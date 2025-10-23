-- DigiTuuls Referral System - schema additions
-- 10% platform fee; referrer earns 30% of that (3% of sale)

-- Enable required extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Referral codes: one unique code per referrer
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Basic policies: anyone can read codes to resolve /ref/:code; owners can create theirs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_codes' AND policyname='Referral codes viewable by everyone'
  ) THEN
    CREATE POLICY "Referral codes viewable by everyone" ON public.referral_codes FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_codes' AND policyname='Users can create their referral code'
  ) THEN
    CREATE POLICY "Users can create their referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = referrer_id);
  END IF;
END $$;

-- 2) Referral clicks: anonymous-friendly logging of clicks on codes
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL REFERENCES public.referral_codes(code) ON DELETE CASCADE,
  user_agent TEXT,
  utm JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even unauthenticated) to insert clicks; owners and admins can view
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_clicks' AND policyname='Anyone can create referral clicks'
  ) THEN
    CREATE POLICY "Anyone can create referral clicks" ON public.referral_clicks FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_clicks' AND policyname='Owners and admins can view referral clicks'
  ) THEN
    CREATE POLICY "Owners and admins can view referral clicks" ON public.referral_clicks
      FOR SELECT USING (
        public.has_role(auth.uid(), 'admin') OR EXISTS (
          SELECT 1 FROM public.referral_codes c WHERE c.code = referral_clicks.code AND c.referrer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3) Referral relations: who referred whom (one referrer per referred user)
CREATE TABLE IF NOT EXISTS public.referral_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL REFERENCES public.referral_codes(code) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT referral_no_self CHECK (referrer_id <> referred_id)
);
ALTER TABLE public.referral_relations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_referral_relations_referrer ON public.referral_relations(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_relations_referred ON public.referral_relations(referred_id);

-- Trigger to derive referrer_id from code and enforce validity
CREATE OR REPLACE FUNCTION public.set_referrer_from_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner UUID;
BEGIN
  SELECT referrer_id INTO owner FROM public.referral_codes WHERE code = NEW.code;
  IF owner IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;
  NEW.referrer_id := owner;
  IF NEW.referrer_id = NEW.referred_id THEN
    RAISE EXCEPTION 'Self-referral is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referrer_from_code ON public.referral_relations;
CREATE TRIGGER trg_set_referrer_from_code
BEFORE INSERT ON public.referral_relations
FOR EACH ROW EXECUTE FUNCTION public.set_referrer_from_code();

-- Policies: owners (referrer or referred) can view; referred user claims the relation
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_relations' AND policyname='Users can view own referral relations'
  ) THEN
    CREATE POLICY "Users can view own referral relations" ON public.referral_relations
      FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_relations' AND policyname='Referred user can create relation via code'
  ) THEN
    CREATE POLICY "Referred user can create relation via code" ON public.referral_relations
      FOR INSERT WITH CHECK (auth.uid() = referred_id);
  END IF;
END $$;

-- 4) Referral commissions: records created when referred seller makes a sale
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  sale_amount INTEGER NOT NULL, -- cents
  platform_fee_amount INTEGER NOT NULL, -- 10% of sale_amount
  commission_amount INTEGER NOT NULL, -- 30% of platform_fee_amount
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','paid','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE (purchase_id)
);
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_commissions_referrer ON public.referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referred ON public.referral_commissions(referred_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.referral_commissions(status);

-- Policies: referrer visibility and admin; inserts happen via SECURITY DEFINER function
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_commissions' AND policyname='Referrers and admins can view commissions'
  ) THEN
    CREATE POLICY "Referrers and admins can view commissions" ON public.referral_commissions
      FOR SELECT USING (auth.uid() = referrer_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 5) Referral payouts: payout requests and records
CREATE TABLE IF NOT EXISTS public.referral_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- cents
  method TEXT NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','bank','stripe_connect','paypal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','failed','rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  metadata JSONB
);
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_payouts_referrer ON public.referral_payouts(referrer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.referral_payouts(status);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_payouts' AND policyname='Users can view own payouts'
  ) THEN
    CREATE POLICY "Users can view own payouts" ON public.referral_payouts FOR SELECT USING (auth.uid() = referrer_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_payouts' AND policyname='Users can create payout requests'
  ) THEN
    CREATE POLICY "Users can create payout requests" ON public.referral_payouts FOR INSERT WITH CHECK (auth.uid() = referrer_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_payouts' AND policyname='Admins can update payouts'
  ) THEN
    CREATE POLICY "Admins can update payouts" ON public.referral_payouts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Commission creation function & trigger on purchases
CREATE OR REPLACE FUNCTION public.create_referral_commission_for_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product_seller UUID; -- sellers.id
  seller_user UUID;    -- auth.users.id
  referrer UUID;       -- auth.users.id
  sale_amount_cents INTEGER;
  platform_fee_cents INTEGER;
  commission_cents INTEGER;
BEGIN
  -- Only act on succeeded payments
  IF NOT (TG_OP = 'INSERT' AND NEW.status = 'succeeded') AND NOT (TG_OP = 'UPDATE' AND NEW.status = 'succeeded' AND (OLD.status IS DISTINCT FROM NEW.status)) THEN
    RETURN NEW;
  END IF;

  -- Find the seller's user id
  SELECT p.seller_id INTO product_seller FROM public.products p WHERE p.id = NEW.product_id;
  IF product_seller IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT s.user_id INTO seller_user FROM public.sellers s WHERE s.id = product_seller;
  IF seller_user IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if seller was referred
  SELECT rr.referrer_id INTO referrer FROM public.referral_relations rr WHERE rr.referred_id = seller_user;
  IF referrer IS NULL THEN
    RETURN NEW; -- no referral, nothing to do
  END IF;

  -- Compute amounts (integers in cents)
  sale_amount_cents := NEW.amount;
  platform_fee_cents := ROUND(sale_amount_cents * 0.10);
  commission_cents := ROUND(sale_amount_cents * 0.03);

  -- Insert commission (idempotent on purchase_id)
  INSERT INTO public.referral_commissions (
    referrer_id, referred_id, purchase_id, sale_amount, platform_fee_amount, commission_amount, status
  ) VALUES (
    referrer, seller_user, NEW.id, sale_amount_cents, platform_fee_cents, commission_cents, 'ready'
  ) ON CONFLICT (purchase_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_referral_commission ON public.purchases;
CREATE TRIGGER trg_create_referral_commission
AFTER INSERT OR UPDATE OF status ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.create_referral_commission_for_purchase();

-- Auto-generate a referral code for every new user (does not depend on profiles)
CREATE OR REPLACE FUNCTION public.create_referral_code_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code TEXT;
BEGIN
  -- code based on user id prefix, lowercased to be URL-friendly
  generated_code := lower('u' || substr(NEW.id::text, 1, 8));
  INSERT INTO public.referral_codes(referrer_id, code)
  VALUES (NEW.id, generated_code)
  ON CONFLICT (referrer_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_referral_code_on_user ON auth.users;
CREATE TRIGGER trg_create_referral_code_on_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_referral_code_for_new_user();
