import { supabase } from '@/integrations/supabase/client';

/**
 * Request a payout for a user
 */
export const requestPayout = async (
  userId: string, 
  amount: number, 
  method: 'stripe' | 'paypal' | 'bank_transfer' | 'manual'
) => {
  try {
    // Check if user has sufficient balance
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_total_earnings', { user_id: userId });

    if (statsError) {
      throw new Error('Failed to fetch user earnings');
    }

    const pendingBalance = stats?.[0]?.pending_commissions || 0;
    const amountInCents = Math.round(amount * 100);

    if (amountInCents > pendingBalance) {
      throw new Error('Insufficient balance for payout');
    }

    // Get minimum payout amount from settings
    const { data: settings, error: settingsError } = await supabase
      .from('referral_settings')
      .select('minimum_payout_amount')
      .limit(1)
      .single();

    if (settingsError) {
      throw new Error('Failed to fetch payout settings');
    }

    const minimumPayout = settings?.minimum_payout_amount || 2500; // £25.00

    if (amountInCents < minimumPayout) {
      throw new Error(`Minimum payout amount is £${(minimumPayout / 100).toFixed(2)}`);
    }

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from('referral_payouts')
      .insert({
        user_id: userId,
        amount: amountInCents,
        method,
        status: 'pending',
      })
      .select()
      .single();

    if (payoutError) {
      throw new Error('Failed to create payout request');
    }

    // Create notification for user
    await supabase
      .from('referral_notifications')
      .insert({
        user_id: userId,
        type: 'payout_processed',
        title: 'Payout Requested',
        message: `Your payout request of £${amount.toFixed(2)} has been submitted for review.`,
        data: {
          payout_id: payout.id,
          amount: amountInCents,
          method,
        },
      });

    return { success: true, payout };

  } catch (error) {
    console.error('Error requesting payout:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Process a payout (admin function)
 */
export const processPayout = async (
  payoutId: string, 
  status: 'processing' | 'completed' | 'failed' | 'cancelled',
  adminUserId: string,
  notes?: string
) => {
  try {
    const updateData: any = { 
      status,
      processed_by: adminUserId,
    };

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString();
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'processing') {
      updateData.processed_at = new Date().toISOString();
    }

    if (notes) {
      updateData.admin_notes = notes;
    }

    const { data: payout, error: payoutError } = await supabase
      .from('referral_payouts')
      .update(updateData)
      .eq('id', payoutId)
      .select(`
        id,
        user_id,
        amount,
        method,
        status,
        profiles!referral_payouts_user_id_fkey(display_name)
      `)
      .single();

    if (payoutError) {
      throw new Error('Failed to update payout status');
    }

    // If payout is completed, mark associated commissions as paid
    if (status === 'completed') {
      const { error: commissionError } = await supabase
        .from('referral_commissions')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          payout_id: payoutId
        })
        .eq('referrer_id', payout.user_id)
        .eq('status', 'confirmed');

      if (commissionError) {
        console.error('Error updating commission status:', commissionError);
      }

      // Create notification for user
      await supabase
        .from('referral_notifications')
        .insert({
          user_id: payout.user_id,
          type: 'payout_processed',
          title: 'Payout Completed',
          message: `Your payout of £${(payout.amount / 100).toFixed(2)} has been processed successfully.`,
          data: {
            payout_id: payout.id,
            amount: payout.amount,
            method: payout.method,
          },
        });
    }

    return { success: true, payout };

  } catch (error) {
    console.error('Error processing payout:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get payout statistics
 */
export const getPayoutStats = async () => {
  try {
    const { data, error } = await supabase
      .from('referral_payouts')
      .select('amount, status, created_at');

    if (error) {
      throw new Error('Failed to fetch payout stats');
    }

    const stats = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      thisMonth: 0,
      lastMonth: 0,
    };

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    for (const payout of data || []) {
      const amount = payout.amount;
      const createdAt = new Date(payout.created_at);

      stats.total += amount;

      switch (payout.status) {
        case 'pending':
          stats.pending += amount;
          break;
        case 'processing':
          stats.processing += amount;
          break;
        case 'completed':
          stats.completed += amount;
          break;
        case 'failed':
          stats.failed += amount;
          break;
        case 'cancelled':
          stats.cancelled += amount;
          break;
      }

      if (createdAt >= thisMonth) {
        stats.thisMonth += amount;
      } else if (createdAt >= lastMonth && createdAt <= lastMonthEnd) {
        stats.lastMonth += amount;
      }
    }

    return { success: true, stats };

  } catch (error) {
    console.error('Error fetching payout stats:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get user's payout history
 */
export const getUserPayouts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('referral_payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch user payouts');
    }

    return { success: true, payouts: data || [] };

  } catch (error) {
    console.error('Error fetching user payouts:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};