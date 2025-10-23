# DigiTuuls Referral System

A comprehensive referral system that rewards users with 30% of the platform's 10% commission (3% of total sales) when they refer new creators to DigiTuuls.

## 🎯 Overview

The referral system is designed to incentivize users to bring new creators to the platform while maintaining a sustainable revenue model:

- **DigiTuuls earns**: 10% of every sale
- **Referrers earn**: 30% of that 10% (3% of total sale)
- **Creators keep**: 90% of their sale revenue

## 🏗️ Architecture

### Database Schema

The system uses the following Supabase tables:

- `referrals` - Tracks referral relationships
- `referral_commissions` - Records commission calculations
- `referral_payouts` - Manages payout requests and processing
- `referral_tracking` - Analytics and fraud prevention
- `referral_settings` - Platform configuration
- `referral_notifications` - User notifications

### Key Features

1. **Automatic Commission Calculation**
   - Triggers on successful purchase completion
   - Calculates 3% commission automatically
   - Creates notification for referrer

2. **Referral Link System**
   - Unique codes for each user
   - Format: `https://digituuls.com/ref/{username}_{user_id}`
   - Persistent tracking via localStorage

3. **User Dashboard**
   - Real-time earnings tracking
   - Payout request system
   - Detailed commission history
   - Social sharing tools

4. **Admin Management**
   - Commission approval workflow
   - Payout processing
   - Fraud detection and prevention
   - Analytics and reporting

5. **Security Measures**
   - Self-referral prevention
   - Rate limiting (5 referrals/hour)
   - Suspicious activity detection
   - IP-based fraud prevention

## 🚀 Getting Started

### 1. Database Setup

Run the migration to create the referral system tables:

```sql
-- The migration is located at:
-- supabase/migrations/20250120000000_referral_system.sql
```

### 2. Environment Variables

Ensure your Supabase environment is configured with the necessary RLS policies and functions.

### 3. Frontend Integration

The system includes the following components:

- `Referrals.tsx` - User dashboard
- `ReferralLanding.tsx` - Referral tracking page
- `AdminReferrals.tsx` - Admin management
- `NotificationCenter.tsx` - Real-time notifications

### 4. Hooks and Utilities

- `useReferrals.tsx` - Main referral data management
- `referralUtils.ts` - Core utility functions
- `commissionUtils.ts` - Commission processing
- `payoutUtils.ts` - Payout management
- `securityUtils.ts` - Fraud prevention

## 📊 Usage

### For Users

1. **Get Your Referral Link**
   - Navigate to `/referrals`
   - Copy your unique referral link
   - Share via social media or direct messaging

2. **Track Earnings**
   - View real-time commission updates
   - Monitor pending and paid earnings
   - Request payouts when minimum threshold is met

3. **Request Payouts**
   - Minimum payout: £25.00
   - Multiple payment methods supported
   - Admin approval required

### For Admins

1. **Manage Commissions**
   - Review and approve pending commissions
   - Process bulk payments
   - Export data for accounting

2. **Monitor System**
   - Track referral performance
   - Detect fraudulent activity
   - View analytics dashboard

3. **Process Payouts**
   - Approve payout requests
   - Update payment status
   - Handle disputes

## 🔒 Security Features

### Fraud Prevention

1. **Self-Referral Detection**
   - Prevents users from referring themselves
   - Email-based validation

2. **Rate Limiting**
   - Maximum 5 referrals per hour per user
   - Prevents spam and abuse

3. **Suspicious Activity Detection**
   - Flags high-volume referrers
   - Monitors IP-based patterns
   - Detects rapid-fire referrals

4. **Audit Logging**
   - All security events logged
   - Comprehensive tracking for investigation

### Data Protection

- Row-level security (RLS) policies
- Encrypted sensitive data
- Secure API endpoints
- Input validation and sanitization

## 📈 Analytics

### User Metrics

- Total referrals
- Active vs inactive referrals
- Total sales volume generated
- Commission earnings
- Payout history

### Admin Metrics

- Platform-wide referral performance
- Top referrers by earnings
- Commission processing rates
- Fraud detection statistics

## 🛠️ API Endpoints

### Commission Processing

```typescript
// Process commission for a purchase
POST /functions/v1/process-commission
{
  "purchase_id": "uuid",
  "stripe_payment_intent_id": "pi_xxx"
}
```

### Database Functions

```sql
-- Get user's total earnings
SELECT * FROM get_user_total_earnings('user_id');

-- Get top referrers
SELECT * FROM get_top_referrers(10);

-- Calculate commission amount
SELECT calculate_commission_amount(10000); -- 100.00 in cents
```

## 🔧 Configuration

### Referral Settings

The system can be configured via the `referral_settings` table:

- `platform_fee_percentage` - Platform fee (default: 10%)
- `referrer_commission_percentage` - Referrer commission (default: 30%)
- `minimum_payout_amount` - Minimum payout in cents (default: 2500)
- `payout_frequency` - Payout schedule (daily/weekly/monthly)
- `auto_payout_enabled` - Enable automatic payouts

### Customization

1. **Commission Rates**
   - Modify in database settings
   - Update calculation functions
   - Adjust UI displays

2. **Payout Thresholds**
   - Change minimum amounts
   - Add tiered thresholds
   - Implement bonus structures

3. **Notification Templates**
   - Customize message content
   - Add branding elements
   - Configure delivery methods

## 🚨 Troubleshooting

### Common Issues

1. **Commissions Not Calculating**
   - Check purchase status is 'succeeded'
   - Verify referral relationship exists
   - Review database triggers

2. **Payouts Not Processing**
   - Confirm admin approval
   - Check payment method configuration
   - Verify user balance

3. **Notifications Not Sending**
   - Check notification table
   - Verify user preferences
   - Review system logs

### Debug Mode

Enable detailed logging by setting:

```typescript
const DEBUG_REFERRALS = true;
```

## 📝 License

This referral system is part of the DigiTuuls platform and follows the same licensing terms.

## 🤝 Contributing

When contributing to the referral system:

1. Follow existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Consider security implications
5. Test with various scenarios

## 📞 Support

For technical support or questions about the referral system:

1. Check the troubleshooting section
2. Review the code documentation
3. Contact the development team
4. Submit issues via the project repository

---

**Note**: This system is designed to be scalable and secure. Always test thoroughly in a staging environment before deploying to production.