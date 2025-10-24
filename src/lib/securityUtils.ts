import { supabase } from '@/integrations/supabase/client';

/**
 * Check for potential self-referral attempts
 */
export const checkSelfReferral = async (referrerId: string, referredEmail: string): Promise<boolean> => {
  try {
    // Get referrer's email
    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', referrerId)
      .single();

    if (referrerError || !referrerProfile) {
      return false;
    }

    // Get referrer's auth user data
    const { data: referrerUser, error: referrerUserError } = await supabase.auth.admin.getUserById(referrerId);
    
    if (referrerUserError || !referrerUser.user) {
      return false;
    }

    // Check if emails match
    const referrerEmail = referrerUser.user.email?.toLowerCase();
    const referredEmailLower = referredEmail.toLowerCase();

    return referrerEmail === referredEmailLower;

  } catch (error) {
    console.error('Error checking self-referral:', error);
    return false;
  }
};

/**
 * Check for suspicious referral patterns
 */
export const checkSuspiciousActivity = async (referrerId: string): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> => {
  try {
    const reasons: string[] = [];
    
    // Check referral count in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentReferrals, error: recentError } = await supabase
      .from('referrals')
      .select('id, created_at')
      .eq('referrer_id', referrerId)
      .gte('created_at', twentyFourHoursAgo);

    if (recentError) {
      console.error('Error checking recent referrals:', recentError);
      return { isSuspicious: false, reasons: [] };
    }

    const recentCount = recentReferrals?.length || 0;
    
    // Flag if more than 10 referrals in 24 hours
    if (recentCount > 10) {
      reasons.push(`High referral volume: ${recentCount} referrals in 24 hours`);
    }

    // Check for duplicate IP addresses
    const { data: trackingData, error: trackingError } = await supabase
      .from('referral_tracking')
      .select('ip_address, created_at')
      .eq('referrer_id', referrerId)
      .gte('created_at', twentyFourHoursAgo);

    if (trackingError) {
      console.error('Error checking tracking data:', trackingError);
    } else if (trackingData) {
      const ipCounts = trackingData.reduce((acc, item) => {
        if (item.ip_address) {
          acc[item.ip_address] = (acc[item.ip_address] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const maxIpCount = Math.max(...Object.values(ipCounts));
      if (maxIpCount > 5) {
        reasons.push(`Suspicious IP activity: ${maxIpCount} referrals from same IP`);
      }
    }

    // Check for rapid-fire referrals (less than 1 minute apart)
    if (recentReferrals && recentReferrals.length > 1) {
      const sortedReferrals = recentReferrals.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      let rapidFireCount = 0;
      for (let i = 1; i < sortedReferrals.length; i++) {
        const timeDiff = new Date(sortedReferrals[i].created_at).getTime() - 
                        new Date(sortedReferrals[i-1].created_at).getTime();
        if (timeDiff < 60000) { // Less than 1 minute
          rapidFireCount++;
        }
      }

      if (rapidFireCount > 3) {
        reasons.push(`Rapid-fire referrals: ${rapidFireCount} referrals within 1 minute of each other`);
      }
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };

  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return { isSuspicious: false, reasons: [] };
  }
};

/**
 * Validate referral code format and existence
 */
export const validateReferralCode = async (code: string): Promise<{
  isValid: boolean;
  referrerId?: string;
  error?: string;
}> => {
  try {
    // Check code format (should be alphanumeric with underscores)
    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(code)) {
      return {
        isValid: false,
        error: 'Invalid referral code format'
      };
    }

    // Check if code exists and is active
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id, status')
      .eq('referral_code', code)
      .single();

    if (referralError || !referral) {
      return {
        isValid: false,
        error: 'Referral code not found'
      };
    }

    if (referral.status !== 'pending' && referral.status !== 'completed') {
      return {
        isValid: false,
        error: 'Referral code is not active'
      };
    }

    return {
      isValid: true,
      referrerId: referral.referrer_id
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      isValid: false,
      error: 'Validation failed'
    };
  }
};

/**
 * Log security events for audit
 */
export const logSecurityEvent = async (
  eventType: 'self_referral_attempt' | 'suspicious_activity' | 'invalid_code' | 'fraud_detected',
  userId: string,
  details: Record<string, any>
) => {
  try {
    await supabase
      .from('referral_tracking')
      .insert({
        referrer_id: userId,
        referral_code: 'SECURITY_EVENT',
        ip_address: null, // Will be filled by server
        user_agent: navigator.userAgent,
        referrer_url: document.referrer,
        landing_page: window.location.pathname,
        converted: false,
        data: {
          event_type: eventType,
          details,
          timestamp: new Date().toISOString(),
        }
      });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

/**
 * Rate limiting for referral creation
 */
export const checkRateLimit = async (referrerId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    
    // Check referrals created in last hour
    const { data: recentReferrals, error } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: 10, resetTime: now.getTime() + 3600000 };
    }

    const recentCount = recentReferrals?.length || 0;
    const maxPerHour = 5; // Maximum 5 referrals per hour
    const remaining = Math.max(0, maxPerHour - recentCount);
    const allowed = recentCount < maxPerHour;
    const resetTime = now.getTime() + 3600000; // Reset in 1 hour

    return { allowed, remaining, resetTime };

  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { allowed: true, remaining: 10, resetTime: Date.now() + 3600000 };
  }
};

/**
 * Comprehensive referral validation
 */
export const validateReferral = async (
  referrerId: string,
  referredEmail: string,
  referralCode: string
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check self-referral
    const isSelfReferral = await checkSelfReferral(referrerId, referredEmail);
    if (isSelfReferral) {
      errors.push('Self-referrals are not allowed');
      await logSecurityEvent('self_referral_attempt', referrerId, { referredEmail });
    }

    // Check rate limiting
    const rateLimit = await checkRateLimit(referrerId);
    if (!rateLimit.allowed) {
      errors.push(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 60000)} minutes`);
    }

    // Check suspicious activity
    const suspiciousActivity = await checkSuspiciousActivity(referrerId);
    if (suspiciousActivity.isSuspicious) {
      warnings.push(...suspiciousActivity.reasons);
      await logSecurityEvent('suspicious_activity', referrerId, { 
        reasons: suspiciousActivity.reasons 
      });
    }

    // Validate referral code
    const codeValidation = await validateReferralCode(referralCode);
    if (!codeValidation.isValid) {
      errors.push(codeValidation.error || 'Invalid referral code');
      await logSecurityEvent('invalid_code', referrerId, { referralCode });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Error validating referral:', error);
    return {
      valid: false,
      errors: ['Validation failed due to system error'],
      warnings: []
    };
  }
};