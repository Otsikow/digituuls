import { supabase } from '@/integrations/supabase/client';

/**
 * Process referral commission for a completed purchase
 */
export const processReferralCommission = async (purchaseId: string) => {
  try {
    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, buyer_id, amount, status')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status !== 'succeeded') {
      throw new Error('Purchase not completed');
    }

    // Check if buyer was referred
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referred_id', purchase.buyer_id)
      .eq('status', 'completed')
      .single();

    if (referralError || !referral) {
      // No referral found, no commission to process
      return { success: true, message: 'No referral found for this purchase' };
    }

    // Check if commission already exists
    const { data: existingCommission, error: existingError } = await supabase
      .from('referral_commissions')
      .select('id')
      .eq('purchase_id', purchaseId)
      .eq('referrer_id', referral.referrer_id)
      .single();

    if (existingCommission) {
      return { success: true, message: 'Commission already processed' };
    }

    // Calculate commission amounts
    const platformFee = Math.round(purchase.amount * 0.10); // 10% platform fee
    const commissionAmount = Math.round(platformFee * 0.30); // 30% of platform fee = 3% of sale

    // Create commission record
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert({
        referrer_id: referral.referrer_id,
        referred_user_id: purchase.buyer_id,
        purchase_id: purchaseId,
        sale_amount: purchase.amount,
        platform_fee: platformFee,
        commission_amount: commissionAmount,
        status: 'pending',
        stripe_transaction_id: null, // Will be updated when payment is confirmed
      })
      .select()
      .single();

    if (commissionError) {
      throw new Error('Failed to create commission record');
    }

    // Create notification for referrer
    await supabase
      .from('referral_notifications')
      .insert({
        user_id: referral.referrer_id,
        type: 'commission_earned',
        title: 'Commission Earned!',
        message: `You earned £${(commissionAmount / 100).toFixed(2)} from a referral sale!`,
        data: {
          commission_amount: commissionAmount,
          sale_amount: purchase.amount,
          purchase_id: purchaseId,
        },
      });

    return { 
      success: true, 
      message: 'Commission processed successfully',
      commission: commission
    };

  } catch (error) {
    console.error('Error processing referral commission:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Process all pending commissions for a referrer
 */
export const processAllPendingCommissions = async (referrerId: string) => {
  try {
    // Get all pending commissions for this referrer
    const { data: commissions, error: commissionsError } = await supabase
      .from('referral_commissions')
      .select('id, purchase_id, status')
      .eq('referrer_id', referrerId)
      .eq('status', 'pending');

    if (commissionsError) {
      throw new Error('Failed to fetch pending commissions');
    }

    const results = [];
    for (const commission of commissions || []) {
      const result = await processReferralCommission(commission.purchase_id);
      results.push({
        commissionId: commission.id,
        purchaseId: commission.purchase_id,
        ...result
      });
    }

    return {
      success: true,
      message: `Processed ${results.length} commissions`,
      results
    };

  } catch (error) {
    console.error('Error processing pending commissions:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Update commission status
 */
export const updateCommissionStatus = async (
  commissionId: string, 
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled',
  stripeTransactionId?: string
) => {
  try {
    const updateData: any = { status };
    
    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }
    
    if (stripeTransactionId) {
      updateData.stripe_transaction_id = stripeTransactionId;
    }

    const { error } = await supabase
      .from('referral_commissions')
      .update(updateData)
      .eq('id', commissionId);

    if (error) {
      throw new Error('Failed to update commission status');
    }

    return { success: true, message: 'Commission status updated successfully' };

  } catch (error) {
    console.error('Error updating commission status:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get commission statistics for a referrer
 */
export const getCommissionStats = async (referrerId: string) => {
  try {
    const { data, error } = await supabase
      .from('referral_commissions')
      .select('commission_amount, status, created_at')
      .eq('referrer_id', referrerId);

    if (error) {
      throw new Error('Failed to fetch commission stats');
    }

    const stats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      paid: 0,
      cancelled: 0,
      thisMonth: 0,
      lastMonth: 0,
    };

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    for (const commission of data || []) {
      const amount = commission.commission_amount;
      const createdAt = new Date(commission.created_at);

      stats.total += amount;

      switch (commission.status) {
        case 'pending':
          stats.pending += amount;
          break;
        case 'confirmed':
          stats.confirmed += amount;
          break;
        case 'paid':
          stats.paid += amount;
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
    console.error('Error fetching commission stats:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};