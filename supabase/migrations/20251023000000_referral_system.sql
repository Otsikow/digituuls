-- Extend referrals table with additional fields
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS referred_user_email TEXT,
  ADD COLUMN IF NOT EXISTS referred_user_ip TEXT,
  ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
    sale_amount INTEGER NOT NULL,
    platform_fee_amount INTEGER NOT NULL, -- 10% of sale
    commission_amount INTEGER NOT NULL, -- 30% of platform fee (3% of sale)
    currency TEXT DEFAULT 'GBP',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    payment_cleared_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'GBP',
    method TEXT DEFAULT 'manual' CHECK (method IN ('manual', 'stripe', 'paypal', 'bank_transfer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    commission_ids UUID[] DEFAULT ARRAY[]::UUID[],
    transaction_id TEXT,
    recipient_details JSONB DEFAULT '{}'::jsonb,
    admin_notes TEXT,
    failed_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create referral_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.referral_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    minimum_payout_threshold INTEGER DEFAULT 2500, -- £25.00 in pence
    payout_method TEXT DEFAULT 'manual',
    payout_details JSONB DEFAULT '{}'::jsonb,
    auto_payout_enabled BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- Create referral_clicks table for tracking
CREATE TABLE IF NOT EXISTS public.referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer_url TEXT,
    landing_page TEXT,
    converted BOOLEAN DEFAULT FALSE,
    converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('referral_signup', 'commission_earned', 'payout_requested', 'payout_completed', 'payout_failed')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_referral_settings_updated_at BEFORE UPDATE ON public.referral_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id UUID)
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username TEXT;
  _code TEXT;
  _exists BOOLEAN;
BEGIN
  -- Get username from profiles
  SELECT username INTO _username FROM public.profiles WHERE user_id = _user_id;
  
  IF _username IS NULL THEN
    _username := SUBSTRING(_user_id::TEXT FROM 1 FOR 8);
  END IF;
  
  -- Try username first
  _code := LOWER(_username);
  SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = _code) INTO _exists;
  
  -- If exists, append random suffix
  IF _exists THEN
    _code := _code || '_' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6);
  END IF;
  
  RETURN _code;
END;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code TEXT;
BEGIN
  -- Generate unique referral code
  _code := public.generate_referral_code(NEW.user_id);
  
  -- Create referral entry
  INSERT INTO public.referrals (referrer_id, referral_code, status)
  VALUES (NEW.user_id, _code, 'pending');
  
  -- Create referral settings
  INSERT INTO public.referral_settings (user_id)
  VALUES (NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create referral code when profile is created
CREATE TRIGGER on_profile_created_create_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_referral_code();

-- Function to calculate commission when purchase is completed
CREATE OR REPLACE FUNCTION public.calculate_referral_commission()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _seller_user_id UUID;
  _referrer_id UUID;
  _platform_fee INTEGER;
  _commission INTEGER;
BEGIN
  -- Only process when payment succeeds
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    
    -- Get seller's user_id from product
    SELECT s.user_id INTO _seller_user_id
    FROM public.sellers s
    JOIN public.products p ON p.seller_id = s.id
    WHERE p.id = NEW.product_id;
    
    -- Check if seller was referred
    SELECT referrer_id INTO _referrer_id
    FROM public.referrals
    WHERE referred_id = _seller_user_id
      AND status IN ('completed', 'rewarded')
      AND is_active = TRUE;
    
    -- If seller has a referrer, create commission
    IF _referrer_id IS NOT NULL THEN
      -- Calculate fees: 10% platform fee, 30% of that to referrer (3% of total)
      _platform_fee := ROUND(NEW.amount * 0.10);
      _commission := ROUND(_platform_fee * 0.30);
      
      INSERT INTO public.commissions (
        referrer_id,
        referred_seller_id,
        purchase_id,
        sale_amount,
        platform_fee_amount,
        commission_amount,
        currency,
        status,
        payment_cleared_at
      ) VALUES (
        _referrer_id,
        _seller_user_id,
        NEW.id,
        NEW.amount,
        _platform_fee,
        _commission,
        NEW.currency,
        'approved', -- Auto-approve for now
        NOW()
      );
      
      -- Create notification for referrer
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        _referrer_id,
        'commission_earned',
        'You earned a commission!',
        'You earned £' || (_commission / 100.0)::TEXT || ' from your referral''s sale.',
        jsonb_build_object(
          'commission_id', (SELECT id FROM public.commissions WHERE purchase_id = NEW.id ORDER BY created_at DESC LIMIT 1),
          'amount', _commission,
          'currency', NEW.currency
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to calculate commission on purchase completion
CREATE TRIGGER on_purchase_succeeded_calculate_commission
  AFTER UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.calculate_referral_commission();

-- RLS Policies for commissions
CREATE POLICY "Users can view own commissions" ON public.commissions 
  FOR SELECT USING (auth.uid() = referrer_id);
  
CREATE POLICY "Admins can view all commissions" ON public.commissions 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can manage commissions" ON public.commissions 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payouts
CREATE POLICY "Users can view own payouts" ON public.payouts 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can request payouts" ON public.payouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all payouts" ON public.payouts 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can manage payouts" ON public.payouts 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_settings
CREATE POLICY "Users can view own settings" ON public.referral_settings 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own settings" ON public.referral_settings 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own settings" ON public.referral_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referral_clicks
CREATE POLICY "Users can view own referral clicks" ON public.referral_clicks 
  FOR SELECT USING (auth.uid() = referrer_id);
  
CREATE POLICY "Anyone can create referral clicks" ON public.referral_clicks 
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Admins can view all clicks" ON public.referral_clicks 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "System can create notifications" ON public.notifications 
  FOR INSERT WITH CHECK (true);

-- Admin policy for referrals
CREATE POLICY "Admins can view all referrals" ON public.referrals 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Admins can manage referrals" ON public.referrals 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_commissions_referrer_id ON public.commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referred_seller_id ON public.commissions(referred_seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referral_code ON public.referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referrer_id ON public.referral_clicks(referrer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Function to get user referral stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(_user_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  active_referrals BIGINT,
  total_sales_volume NUMERIC,
  total_platform_earnings NUMERIC,
  total_commission_earnings NUMERIC,
  pending_commission NUMERIC,
  paid_commission NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH referral_data AS (
    SELECT referred_id
    FROM public.referrals
    WHERE referrer_id = _user_id AND referred_id IS NOT NULL
  )
  SELECT
    COUNT(DISTINCT r.referred_id) AS total_referrals,
    COUNT(DISTINCT CASE WHEN r.referred_id IN (SELECT referred_id FROM referral_data) THEN r.referred_id END) AS active_referrals,
    COALESCE(SUM(c.sale_amount) / 100.0, 0) AS total_sales_volume,
    COALESCE(SUM(c.platform_fee_amount) / 100.0, 0) AS total_platform_earnings,
    COALESCE(SUM(c.commission_amount) / 100.0, 0) AS total_commission_earnings,
    COALESCE(SUM(CASE WHEN c.status IN ('pending', 'approved') THEN c.commission_amount ELSE 0 END) / 100.0, 0) AS pending_commission,
    COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.commission_amount ELSE 0 END) / 100.0, 0) AS paid_commission
  FROM public.referrals r
  LEFT JOIN public.commissions c ON c.referrer_id = r.referrer_id
  WHERE r.referrer_id = _user_id
  GROUP BY r.referrer_id;
$$;

-- Create view for admin referral overview
CREATE OR REPLACE VIEW public.admin_referral_overview AS
SELECT
  r.referrer_id,
  p.username AS referrer_username,
  p.display_name AS referrer_name,
  COUNT(DISTINCT r.referred_id) FILTER (WHERE r.referred_id IS NOT NULL) AS total_referrals,
  COUNT(DISTINCT CASE WHEN r.status = 'completed' OR r.status = 'rewarded' THEN r.referred_id END) AS active_referrals,
  COALESCE(SUM(c.sale_amount), 0) AS total_sales_volume,
  COALESCE(SUM(c.platform_fee_amount), 0) AS total_platform_earnings,
  COALESCE(SUM(c.commission_amount), 0) AS total_commissions,
  COALESCE(SUM(CASE WHEN c.status IN ('pending', 'approved') THEN c.commission_amount ELSE 0 END), 0) AS pending_commissions,
  COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.commission_amount ELSE 0 END), 0) AS paid_commissions,
  MAX(c.created_at) AS last_commission_date,
  r.is_active
FROM public.referrals r
JOIN public.profiles p ON p.user_id = r.referrer_id
LEFT JOIN public.commissions c ON c.referrer_id = r.referrer_id
GROUP BY r.referrer_id, p.username, p.display_name, r.is_active;
