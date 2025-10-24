import { supabase } from '@/integrations/supabase/client';
import { validateReferral, checkSelfReferral } from './securityUtils';

export interface ReferralData {
  code: string;
  referrerId: string;
  isValid: boolean;
}

/**
 * Extract referral code from URL or localStorage
 */
export const getReferralCode = (): string | null => {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  if (refParam) {
    localStorage.setItem('digituuls_referral', refParam);
    return refParam;
  }

  // Check localStorage
  return localStorage.getItem('digituuls_referral');
};

/**
 * Validate referral code and get referrer information
 */
export const validateReferralCode = async (code: string): Promise<ReferralData> => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('referrer_id, status')
      .eq('referral_code', code)
      .single();

    if (error || !data) {
      return {
        code,
        referrerId: '',
        isValid: false,
      };
    }

    return {
      code,
      referrerId: data.referrer_id,
      isValid: data.status === 'pending' || data.status === 'completed',
    };
  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      code,
      referrerId: '',
      isValid: false,
    };
  }
};

/**
 * Track referral visit
 */
export const trackReferralVisit = async (referralCode: string) => {
  try {
    const referralData = await validateReferralCode(referralCode);
    
    if (!referralData.isValid) {
      return;
    }

    // Track the visit
    await supabase
      .from('referral_tracking')
      .insert({
        referrer_id: referralData.referrerId,
        referral_code: referralCode,
        landing_page: window.location.pathname,
        user_agent: navigator.userAgent,
        referrer_url: document.referrer,
      });
  } catch (error) {
    console.error('Error tracking referral visit:', error);
  }
};

/**
 * Complete referral when user signs up
 */
export const completeReferral = async (referralCode: string, newUserId: string) => {
  try {
    const referralData = await validateReferralCode(referralCode);
    
    if (!referralData.isValid) {
      return;
    }

    // Get new user's email for security check
    const { data: newUser, error: userError } = await supabase.auth.admin.getUserById(newUserId);
    
    if (userError || !newUser.user?.email) {
      console.error('Error getting new user data:', userError);
      return;
    }

    // Check for self-referral
    const isSelfReferral = await checkSelfReferral(referralData.referrerId, newUser.user.email);
    if (isSelfReferral) {
      console.warn('Self-referral attempt blocked');
      return;
    }

    // Update referral record
    await supabase
      .from('referrals')
      .update({
        referred_id: newUserId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('referral_code', referralCode);

    // Update tracking record
    await supabase
      .from('referral_tracking')
      .update({
        converted: true,
        conversion_date: new Date().toISOString(),
      })
      .eq('referral_code', referralCode);

    // Create notification for referrer
    await supabase
      .from('referral_notifications')
      .insert({
        user_id: referralData.referrerId,
        type: 'referral_signed_up',
        title: 'New Referral!',
        message: 'Someone you referred just signed up for DigiTuuls!',
        data: {
          referred_user_id: newUserId,
          referral_code: referralCode,
        },
      });

    // Clear referral from localStorage
    localStorage.removeItem('digituuls_referral');

  } catch (error) {
    console.error('Error completing referral:', error);
  }
};

/**
 * Generate referral URL
 */
export const generateReferralUrl = (referralCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/ref/${referralCode}`;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amountInCents: number, currency: string = 'USD'): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate commission amount
 */
export const calculateCommission = (saleAmount: number, platformFeePercent: number = 10, referrerCommissionPercent: number = 30): number => {
  const platformFee = (saleAmount * platformFeePercent) / 100;
  const commission = (platformFee * referrerCommissionPercent) / 100;
  return Math.round(commission);
};

/**
 * Get social sharing URLs
 */
export const getSocialSharingUrls = (referralUrl: string, message: string) => {
  const encodedUrl = encodeURIComponent(referralUrl);
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Check if user is eligible for payout
 */
export const isEligibleForPayout = (pendingBalance: number, minimumPayout: number): boolean => {
  return pendingBalance >= minimumPayout;
};

/**
 * Get payout method display name
 */
export const getPayoutMethodDisplayName = (method: string): string => {
  const methodMap: Record<string, string> = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    manual: 'Manual',
  };
  return methodMap[method] || method;
};

/**
 * Get status display name and color
 */
export const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'yellow' },
    confirmed: { label: 'Confirmed', color: 'blue' },
    paid: { label: 'Paid', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
    processing: { label: 'Processing', color: 'blue' },
    completed: { label: 'Completed', color: 'green' },
    failed: { label: 'Failed', color: 'red' },
  };
  return statusMap[status] || { label: status, color: 'gray' };
};