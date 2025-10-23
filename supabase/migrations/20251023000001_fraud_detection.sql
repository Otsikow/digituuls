-- Create fraud_flags table to track suspicious activity
CREATE TABLE IF NOT EXISTS public.fraud_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    flag_type TEXT NOT NULL CHECK (flag_type IN (
        'self_referral',
        'same_ip',
        'duplicate_email',
        'suspicious_velocity',
        'fake_account',
        'invalid_referral'
    )),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'confirmed')),
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for fraud_flags
CREATE POLICY "Only admins can view fraud flags" ON public.fraud_flags 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  
CREATE POLICY "Only admins can manage fraud flags" ON public.fraud_flags 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fraud_flags_user_id ON public.fraud_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON public.fraud_flags(status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_severity ON public.fraud_flags(severity);

-- Trigger for updated_at
CREATE TRIGGER update_fraud_flags_updated_at BEFORE UPDATE ON public.fraud_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to detect self-referrals
CREATE OR REPLACE FUNCTION public.detect_self_referral()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if referrer and referred user have the same email domain
  IF NEW.referred_id IS NOT NULL AND NEW.referrer_id IS NOT NULL THEN
    DECLARE
      referrer_email TEXT;
      referred_email TEXT;
      referrer_domain TEXT;
      referred_domain TEXT;
    BEGIN
      -- Get emails from auth.users
      SELECT email INTO referrer_email FROM auth.users WHERE id = NEW.referrer_id;
      SELECT email INTO referred_email FROM auth.users WHERE id = NEW.referred_id;
      
      -- Extract domains
      referrer_domain := SPLIT_PART(referrer_email, '@', 2);
      referred_domain := SPLIT_PART(referred_email, '@', 2);
      
      -- Flag if domains match (possible self-referral)
      IF referrer_domain = referred_domain THEN
        INSERT INTO public.fraud_flags (user_id, flag_type, severity, description, metadata)
        VALUES (
          NEW.referrer_id,
          'self_referral',
          'high',
          'Referrer and referred user have the same email domain',
          jsonb_build_object(
            'referral_id', NEW.id,
            'referrer_id', NEW.referrer_id,
            'referred_id', NEW.referred_id,
            'referrer_email', referrer_email,
            'referred_email', referred_email
          )
        );
      END IF;
      
      -- Check if referrer and referred are the same person
      IF NEW.referrer_id = NEW.referred_id THEN
        INSERT INTO public.fraud_flags (user_id, flag_type, severity, description, metadata)
        VALUES (
          NEW.referrer_id,
          'self_referral',
          'critical',
          'User attempted to refer themselves',
          jsonb_build_object('referral_id', NEW.id, 'user_id', NEW.referrer_id)
        );
        
        -- Disable the referral
        NEW.is_active := FALSE;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to detect self-referrals when referral is completed
CREATE TRIGGER on_referral_completed_detect_fraud
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW 
  WHEN (OLD.referred_id IS NULL AND NEW.referred_id IS NOT NULL)
  EXECUTE FUNCTION public.detect_self_referral();

-- Function to detect suspicious referral velocity
CREATE OR REPLACE FUNCTION public.detect_suspicious_velocity()
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_user RECORD;
BEGIN
  -- Find users who have more than 5 referrals in the last 24 hours
  FOR suspicious_user IN
    SELECT 
      referrer_id,
      COUNT(*) as referral_count
    FROM public.referrals
    WHERE created_at > NOW() - INTERVAL '24 hours'
      AND referred_id IS NOT NULL
    GROUP BY referrer_id
    HAVING COUNT(*) > 5
  LOOP
    -- Check if flag already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.fraud_flags 
      WHERE user_id = suspicious_user.referrer_id 
        AND flag_type = 'suspicious_velocity'
        AND status IN ('pending', 'investigating')
    ) THEN
      INSERT INTO public.fraud_flags (user_id, flag_type, severity, description, metadata)
      VALUES (
        suspicious_user.referrer_id,
        'suspicious_velocity',
        'high',
        'User has an unusually high number of referrals in a short time',
        jsonb_build_object(
          'referral_count', suspicious_user.referral_count,
          'time_period', '24 hours'
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Function to detect duplicate IPs
CREATE OR REPLACE FUNCTION public.detect_duplicate_ips()
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_pattern RECORD;
BEGIN
  -- Find referrers whose referred users signed up from same IP
  FOR suspicious_pattern IN
    SELECT 
      r.referrer_id,
      rc.ip_address,
      COUNT(DISTINCT r.referred_id) as user_count
    FROM public.referrals r
    JOIN public.referral_clicks rc ON rc.referral_code = r.referral_code
    WHERE r.referred_id IS NOT NULL
      AND rc.converted = true
      AND rc.ip_address IS NOT NULL
    GROUP BY r.referrer_id, rc.ip_address
    HAVING COUNT(DISTINCT r.referred_id) > 2
  LOOP
    -- Check if flag already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.fraud_flags 
      WHERE user_id = suspicious_pattern.referrer_id 
        AND flag_type = 'same_ip'
        AND status IN ('pending', 'investigating')
        AND metadata->>'ip_address' = suspicious_pattern.ip_address
    ) THEN
      INSERT INTO public.fraud_flags (user_id, flag_type, severity, description, metadata)
      VALUES (
        suspicious_pattern.referrer_id,
        'same_ip',
        'high',
        'Multiple referred users signed up from the same IP address',
        jsonb_build_object(
          'ip_address', suspicious_pattern.ip_address,
          'user_count', suspicious_pattern.user_count
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- Create a view for admin fraud dashboard
CREATE OR REPLACE VIEW public.admin_fraud_overview AS
SELECT
  ff.id,
  ff.user_id,
  p.username,
  p.display_name,
  ff.flag_type,
  ff.severity,
  ff.description,
  ff.status,
  ff.created_at,
  (
    SELECT COUNT(*) FROM public.referrals 
    WHERE referrer_id = ff.user_id
  ) as total_referrals,
  (
    SELECT COALESCE(SUM(commission_amount), 0) 
    FROM public.commissions 
    WHERE referrer_id = ff.user_id
  ) as total_commissions
FROM public.fraud_flags ff
JOIN public.profiles p ON p.user_id = ff.user_id
WHERE ff.status != 'resolved';

-- Function to automatically run fraud checks (can be called periodically)
CREATE OR REPLACE FUNCTION public.run_fraud_checks()
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.detect_suspicious_velocity();
  PERFORM public.detect_duplicate_ips();
END;
$$;

-- Add comment explaining usage
COMMENT ON FUNCTION public.run_fraud_checks() IS 'Run this function periodically (e.g., via cron job or edge function) to detect fraudulent referral activity';
