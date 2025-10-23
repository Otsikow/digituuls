import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { purchase_id, stripe_payment_intent_id } = await req.json()

    if (!purchase_id) {
      return new Response(
        JSON.stringify({ error: 'Purchase ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .select('id, buyer_id, amount, status')
      .eq('id', purchase_id)
      .single()

    if (purchaseError || !purchase) {
      return new Response(
        JSON.stringify({ error: 'Purchase not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (purchase.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Purchase not completed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if buyer was referred
    const { data: referral, error: referralError } = await supabaseClient
      .from('referrals')
      .select('referrer_id')
      .eq('referred_id', purchase.buyer_id)
      .eq('status', 'completed')
      .single()

    if (referralError || !referral) {
      // No referral found, no commission to process
      return new Response(
        JSON.stringify({ success: true, message: 'No referral found for this purchase' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if commission already exists
    const { data: existingCommission, error: existingError } = await supabaseClient
      .from('referral_commissions')
      .select('id')
      .eq('purchase_id', purchase_id)
      .eq('referrer_id', referral.referrer_id)
      .single()

    if (existingCommission) {
      return new Response(
        JSON.stringify({ success: true, message: 'Commission already processed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate commission amounts
    const platformFee = Math.round(purchase.amount * 0.10) // 10% platform fee
    const commissionAmount = Math.round(platformFee * 0.30) // 30% of platform fee = 3% of sale

    // Create commission record
    const { data: commission, error: commissionError } = await supabaseClient
      .from('referral_commissions')
      .insert({
        referrer_id: referral.referrer_id,
        referred_user_id: purchase.buyer_id,
        purchase_id: purchase_id,
        sale_amount: purchase.amount,
        platform_fee: platformFee,
        commission_amount: commissionAmount,
        status: 'pending',
        stripe_transaction_id: stripe_payment_intent_id,
      })
      .select()
      .single()

    if (commissionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create commission record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create notification for referrer
    await supabaseClient
      .from('referral_notifications')
      .insert({
        user_id: referral.referrer_id,
        type: 'commission_earned',
        title: 'Commission Earned!',
        message: `You earned £${(commissionAmount / 100).toFixed(2)} from a referral sale!`,
        data: {
          commission_amount: commissionAmount,
          sale_amount: purchase.amount,
          purchase_id: purchase_id,
        },
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Commission processed successfully',
        commission: commission
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing commission:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})