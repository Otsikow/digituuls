import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type ReferralCommission = Database['public']['Tables']['referral_commissions']['Row'];
type ReferralPayout = Database['public']['Tables']['referral_payouts']['Row'];
type ReferralNotification = Database['public']['Tables']['referral_notifications']['Row'];
type ReferralSettings = Database['public']['Tables']['referral_settings']['Row'];

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalSalesVolume: number;
  totalPlatformEarnings: number;
  totalReferralEarnings: number;
  pendingBalance: number;
  paidBalance: number;
}

interface ReferralEarnings {
  referredUserName: string;
  totalSales: number;
  platformEarnings: number;
  referrerCommission: number;
  paymentStatus: string;
  lastPaymentDate: string | null;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarnings[]>([]);
  const [payouts, setPayouts] = useState<ReferralPayout[]>([]);
  const [notifications, setNotifications] = useState<ReferralNotification[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user's referral code
  const getReferralCode = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setReferralCode(data?.referral_code || '');
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  };

  // Get referral statistics
  const getReferralStats = async () => {
    if (!user) return;

    try {
      // Get total referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('id, status, completed_at')
        .eq('referrer_id', user.id);

      if (referralsError) throw referralsError;

      // Get commission data
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('referral_commissions')
        .select('sale_amount, platform_fee, commission_amount, status')
        .eq('referrer_id', user.id);

      if (commissionsError) throw commissionsError;

      // Get payout data
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('referral_payouts')
        .select('amount, status')
        .eq('user_id', user.id);

      if (payoutsError) throw payoutsError;

      const totalReferrals = referralsData?.length || 0;
      const activeReferrals = referralsData?.filter(r => r.status === 'completed').length || 0;
      
      const totalSalesVolume = commissionsData?.reduce((sum, c) => sum + c.sale_amount, 0) || 0;
      const totalPlatformEarnings = commissionsData?.reduce((sum, c) => sum + c.platform_fee, 0) || 0;
      const totalReferralEarnings = commissionsData?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      
      const pendingBalance = commissionsData
        ?.filter(c => c.status === 'pending' || c.status === 'confirmed')
        .reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      
      const paidBalance = payoutsData
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      setReferralStats({
        totalReferrals,
        activeReferrals,
        totalSalesVolume,
        totalPlatformEarnings,
        totalReferralEarnings,
        pendingBalance,
        paidBalance,
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  // Get detailed earnings
  const getReferralEarnings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select(`
          commission_amount,
          sale_amount,
          platform_fee,
          status,
          paid_at,
          referred_user_id,
          profiles!referral_commissions_referred_user_id_fkey(display_name, username)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const earnings: ReferralEarnings[] = (data || []).map(commission => ({
        referredUserName: commission.profiles?.display_name || commission.profiles?.username || 'Unknown User',
        totalSales: commission.sale_amount,
        platformEarnings: commission.platform_fee,
        referrerCommission: commission.commission_amount,
        paymentStatus: commission.status,
        lastPaymentDate: commission.paid_at,
      }));

      setReferralEarnings(earnings);
    } catch (error) {
      console.error('Error fetching referral earnings:', error);
    }
  };

  // Get payouts
  const getPayouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_payouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  // Get notifications
  const getNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Get referral settings
  const getReferralSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching referral settings:', error);
    }
  };

  // Request payout
  const requestPayout = async (amount: number, method: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('referral_payouts')
        .insert({
          user_id: user.id,
          amount: Math.round(amount * 100), // Convert to cents
          method: method as any,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh payouts
      await getPayouts();

      return { data, error: null };
    } catch (error) {
      console.error('Error requesting payout:', error);
      return { error: error.message };
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('referral_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Refresh notifications
      await getNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Track referral visit
  const trackReferralVisit = async (referralCode: string, landingPage: string) => {
    try {
      // Get referrer ID from referral code
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('referrer_id')
        .eq('referral_code', referralCode)
        .single();

      if (referralError) throw referralError;

      // Track the visit
      const { error: trackingError } = await supabase
        .from('referral_tracking')
        .insert({
          referrer_id: referralData.referrer_id,
          referral_code: referralCode,
          landing_page: landingPage,
          ip_address: null, // Will be handled by server-side function
          user_agent: navigator.userAgent,
          referrer_url: document.referrer,
        });

      if (trackingError) throw trackingError;
    } catch (error) {
      console.error('Error tracking referral visit:', error);
    }
  };

  // Complete referral (when user signs up)
  const completeReferral = async (referralCode: string, newUserId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          referred_id: newUserId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('referral_code', referralCode);

      if (error) throw error;

      // Update tracking record
      await supabase
        .from('referral_tracking')
        .update({
          converted: true,
          conversion_date: new Date().toISOString(),
        })
        .eq('referral_code', referralCode);

    } catch (error) {
      console.error('Error completing referral:', error);
    }
  };

  // Load all data
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          getReferralCode(),
          getReferralStats(),
          getReferralEarnings(),
          getPayouts(),
          getNotifications(),
          getReferralSettings(),
        ]);
        setLoading(false);
      };

      loadData();
    }
  }, [user]);

  return {
    referralCode,
    referralStats,
    referralEarnings,
    payouts,
    notifications,
    settings,
    loading,
    requestPayout,
    markNotificationAsRead,
    trackReferralVisit,
    completeReferral,
    refreshData: async () => {
      if (user) {
        await Promise.all([
          getReferralCode(),
          getReferralStats(),
          getReferralEarnings(),
          getPayouts(),
          getNotifications(),
        ]);
      }
    },
  };
};