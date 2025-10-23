-- Referral System Migration
-- This migration adds tables for commissions, payouts, and referral tracking

-- Create commission_status enum
CREATE TYPE public.commission_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled');

-- Create payout_status enum  
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create payout_method enum
CREATE TYPE public.payout_method AS ENUM ('stripe', 'paypal', 'bank_transfer', 'manual');

-- Create referral_commissions table
CREATE TABLE public.referral_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
    sale_amount INTEGER NOT NULL, -- Amount in cents
    platform_fee INTEGER NOT NULL, -- 10% of sale amount in cents
    commission_amount INTEGER NOT NULL, -- 30% of platform fee in cents (3% of sale)
    status commission_status DEFAULT 'pending',
    stripe_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    payout_id UUID REFERENCES public.referral_payouts(id),
    UNIQUE (purchase_id, referrer_id) -- Prevent duplicate commissions
);

-- Create referral_payouts table
CREATE TABLE public.referral_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Total amount in cents
    currency TEXT DEFAULT 'USD',
    method payout_method NOT NULL,
    status payout_status DEFAULT 'pending',
    stripe_payout_id TEXT,
    paypal_payout_id TEXT,
    bank_reference TEXT,
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create referral_tracking table for analytics
CREATE TABLE public.referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    landing_page TEXT,
    converted BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_settings table for platform configuration
CREATE TABLE public.referral_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percentage DECIMAL(5,2) DEFAULT 10.00, -- 10%
    referrer_commission_percentage DECIMAL(5,2) DEFAULT 30.00, -- 30% of platform fee
    minimum_payout_amount INTEGER DEFAULT 2500, -- £25.00 in cents
    payout_frequency TEXT DEFAULT 'weekly' CHECK (payout_frequency IN ('daily', 'weekly', 'monthly')),
    auto_payout_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_notifications table
CREATE TABLE public.referral_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('commission_earned', 'payout_processed', 'referral_signed_up', 'sale_made')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_commissions
CREATE POLICY "Users can view own commissions" ON public.referral_commissions 
    FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all commissions" ON public.referral_commissions 
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create commissions" ON public.referral_commissions 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update commissions" ON public.referral_commissions 
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_payouts
CREATE POLICY "Users can view own payouts" ON public.referral_payouts 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payouts" ON public.referral_payouts 
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create payout requests" ON public.referral_payouts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage payouts" ON public.referral_payouts 
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_tracking
CREATE POLICY "Users can view own tracking data" ON public.referral_tracking 
    FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all tracking data" ON public.referral_tracking 
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can create tracking data" ON public.referral_tracking 
    FOR INSERT WITH CHECK (true);

-- RLS Policies for referral_settings
CREATE POLICY "Settings viewable by everyone" ON public.referral_settings 
    FOR SELECT USING (true);
CREATE POLICY "Only admins can manage settings" ON public.referral_settings 
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_notifications
CREATE POLICY "Users can view own notifications" ON public.referral_notifications 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.referral_notifications 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.referral_notifications 
    FOR INSERT WITH CHECK (true);

-- Add foreign key constraint for commission payouts
ALTER TABLE public.referral_commissions 
    ADD CONSTRAINT fk_commission_payout 
    FOREIGN KEY (payout_id) REFERENCES public.referral_payouts(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_referral_commissions_referrer ON public.referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_referred ON public.referral_commissions(referred_user_id);
CREATE INDEX idx_referral_commissions_status ON public.referral_commissions(status);
CREATE INDEX idx_referral_commissions_created ON public.referral_commissions(created_at);

CREATE INDEX idx_referral_payouts_user ON public.referral_payouts(user_id);
CREATE INDEX idx_referral_payouts_status ON public.referral_payouts(status);
CREATE INDEX idx_referral_payouts_created ON public.referral_payouts(created_at);

CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX idx_referral_tracking_code ON public.referral_tracking(referral_code);
CREATE INDEX idx_referral_tracking_converted ON public.referral_tracking(converted);

CREATE INDEX idx_referral_notifications_user ON public.referral_notifications(user_id);
CREATE INDEX idx_referral_notifications_read ON public.referral_notifications(read);
CREATE INDEX idx_referral_notifications_created ON public.referral_notifications(created_at);

-- Insert default referral settings
INSERT INTO public.referral_settings (platform_fee_percentage, referrer_commission_percentage, minimum_payout_amount, payout_frequency, auto_payout_enabled) 
VALUES (10.00, 30.00, 2500, 'weekly', false);

-- Create function to calculate commission amount
CREATE OR REPLACE FUNCTION public.calculate_commission_amount(sale_amount_cents INTEGER)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  -- Platform fee: 10% of sale amount
  -- Referrer commission: 30% of platform fee
  -- So referrer gets 3% of total sale amount
  SELECT ROUND((sale_amount_cents * 0.10 * 0.30)::INTEGER);
$$;

-- Create function to get user's referral code
CREATE OR REPLACE FUNCTION public.get_user_referral_code(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT referral_code 
  FROM public.referrals 
  WHERE referrer_id = user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;

-- Create function to check if user was referred
CREATE OR REPLACE FUNCTION public.get_user_referrer(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT referrer_id 
  FROM public.referrals 
  WHERE referred_id = user_id 
  AND status = 'completed'
  LIMIT 1;
$$;

-- Create function to get user's total earnings
CREATE OR REPLACE FUNCTION public.get_user_total_earnings(user_id UUID)
RETURNS TABLE(
  total_commissions BIGINT,
  paid_commissions BIGINT,
  pending_commissions BIGINT,
  total_payouts BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COALESCE(SUM(rc.commission_amount), 0) as total_commissions,
    COALESCE(SUM(CASE WHEN rc.status = 'paid' THEN rc.commission_amount ELSE 0 END), 0) as paid_commissions,
    COALESCE(SUM(CASE WHEN rc.status IN ('pending', 'confirmed') THEN rc.commission_amount ELSE 0 END), 0) as pending_commissions,
    COALESCE(SUM(rp.amount), 0) as total_payouts
  FROM public.referral_commissions rc
  LEFT JOIN public.referral_payouts rp ON rp.user_id = user_id
  WHERE rc.referrer_id = user_id;
$$;

-- Create trigger to update referral_settings updated_at
CREATE TRIGGER update_referral_settings_updated_at 
    BEFORE UPDATE ON public.referral_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to process commission on successful purchase
CREATE OR REPLACE FUNCTION public.process_referral_commission()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    referrer_user_id UUID;
    commission_amount_cents INTEGER;
    platform_fee_cents INTEGER;
BEGIN
    -- Only process if purchase status changed to 'succeeded'
    IF NEW.status = 'succeeded' AND (OLD.status IS NULL OR OLD.status != 'succeeded') THEN
        -- Check if the buyer was referred by someone
        SELECT get_user_referrer(NEW.buyer_id) INTO referrer_user_id;
        
        IF referrer_user_id IS NOT NULL THEN
            -- Calculate platform fee (10% of sale)
            platform_fee_cents := ROUND((NEW.amount * 0.10)::INTEGER);
            
            -- Calculate commission (30% of platform fee = 3% of sale)
            commission_amount_cents := calculate_commission_amount(NEW.amount);
            
            -- Insert commission record
            INSERT INTO public.referral_commissions (
                referrer_id,
                referred_user_id,
                purchase_id,
                sale_amount,
                platform_fee,
                commission_amount,
                status,
                stripe_transaction_id
            ) VALUES (
                referrer_user_id,
                NEW.buyer_id,
                NEW.id,
                NEW.amount,
                platform_fee_cents,
                commission_amount_cents,
                'pending',
                NEW.stripe_payment_intent_id
            );
            
            -- Create notification for referrer
            INSERT INTO public.referral_notifications (
                user_id,
                type,
                title,
                message,
                data
            ) VALUES (
                referrer_user_id,
                'commission_earned',
                'Commission Earned!',
                'You earned £' || (commission_amount_cents / 100.0)::TEXT || ' from a referral sale!',
                json_build_object(
                    'commission_amount', commission_amount_cents,
                    'sale_amount', NEW.amount,
                    'purchase_id', NEW.id
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to process commissions on purchase status change
CREATE TRIGGER process_referral_commission_trigger
    AFTER UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.process_referral_commission();

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id UUID)
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    username TEXT;
    referral_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Get username from profile
    SELECT p.username INTO username
    FROM public.profiles p
    WHERE p.user_id = user_id;
    
    -- If no username, use user_id substring
    IF username IS NULL THEN
        username := SUBSTRING(user_id::TEXT FROM 1 FOR 8);
    END IF;
    
    -- Generate referral code
    referral_code := LOWER(username) || '_' || SUBSTRING(user_id::TEXT FROM 1 FOR 8);
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = referral_code) INTO code_exists;
    
    -- If exists, append random string
    IF code_exists THEN
        referral_code := referral_code || '_' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 4);
    END IF;
    
    RETURN referral_code;
END;
$$;

-- Create function to create referral record for new user
CREATE OR REPLACE FUNCTION public.create_referral_record()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    referral_code TEXT;
    referrer_id UUID;
BEGIN
    -- Generate referral code for the new user
    referral_code := generate_referral_code(NEW.id);
    
    -- Create referral record
    INSERT INTO public.referrals (referrer_id, referral_code, status)
    VALUES (NEW.id, referral_code, 'pending');
    
    RETURN NEW;
END;
$$;

-- Create trigger to create referral record for new users
CREATE TRIGGER create_referral_record_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_referral_record();

-- Create function to get top referrers
CREATE OR REPLACE FUNCTION public.get_top_referrers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    user_id UUID,
    display_name TEXT,
    total_earnings BIGINT,
    referral_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    rc.referrer_id as user_id,
    p.display_name,
    COALESCE(SUM(rc.commission_amount), 0) as total_earnings,
    COUNT(DISTINCT r.id) as referral_count
  FROM public.referral_commissions rc
  LEFT JOIN public.profiles p ON p.user_id = rc.referrer_id
  LEFT JOIN public.referrals r ON r.referrer_id = rc.referrer_id AND r.status = 'completed'
  GROUP BY rc.referrer_id, p.display_name
  ORDER BY total_earnings DESC
  LIMIT limit_count;
$$;