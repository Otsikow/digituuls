# DigiTuuls Referral System - Complete Documentation

## 🚀 Overview

This is a comprehensive referral system implementation for DigiTuuls that enables users to earn passive income by referring new sellers to the platform.

### Revenue Model
- **DigiTuuls Platform Fee**: 10% of every sale
- **Referrer Commission**: 30% of the platform fee (3% of total sales)
- **Seller Keeps**: 90% of their revenue

## 📊 Features Implemented

### 1. Database Schema ✅
- **referrals table**: Tracks referral relationships and codes
- **commissions table**: Records all commission earnings
- **payouts table**: Manages payout requests and history
- **referral_settings table**: User payout preferences
- **referral_clicks table**: Tracks referral link clicks for analytics
- **notifications table**: In-app notification system
- **fraud_flags table**: Fraud detection and prevention

### 2. User Dashboard ✅
**Route**: `/referrals`

Features:
- Overview statistics (total referrals, sales volume, earnings)
- Unique referral link with one-click copy
- Social media sharing buttons (Twitter, Facebook, WhatsApp, Telegram)
- Commission history table
- Payout balance and request system
- Payout history

### 3. Admin Dashboard ✅
**Route**: `/admin/referrals`

Features:
- Global referral program statistics
- Payout request management (approve/reject)
- Referrer directory with search
- Ability to pause/activate referrers
- Export data to CSV
- Analytics overview

### 4. Referral Landing Page ✅
**Route**: `/ref/{code}`

Features:
- Personalized landing page with referrer name
- Platform benefits and features
- Referral click tracking
- Automatic referral code storage for signup

### 5. Backend Logic ✅

**Automatic Commission Calculation**:
- Trigger-based system that runs when purchases succeed
- Automatically calculates: 3% of sale amount
- Creates commission records and notifications
- Links commissions to referrers

**Referral Tracking**:
- Unique referral codes for each user
- Click tracking with IP and user agent
- Conversion tracking when users sign up
- First-touch attribution (first referrer wins)

### 6. Fraud Detection & Security ✅

**Automated Fraud Detection**:
- Self-referral detection (same user)
- Email domain matching (same domain = suspicious)
- IP address duplication detection
- Suspicious velocity detection (too many referrals too fast)
- Fraud flag system with severity levels

**Security Measures**:
- Row-level security (RLS) on all tables
- Users can only see their own data
- Admins have full access
- Prevention of double-paying commissions
- Idempotent commission calculation

### 7. Notifications System ✅

**In-App Notifications**:
- Real-time notification bell in header
- Unread badge counter
- Notification types:
  - New referral signup
  - Commission earned
  - Payout requested
  - Payout completed
  - Payout failed

**Real-time Updates**:
- Supabase real-time subscriptions
- Instant notification delivery
- Mark as read functionality

### 8. Payout Management ✅

**User Features**:
- Minimum payout threshold (£25 default)
- One-click payout requests
- Payout history tracking
- Multiple payout methods support

**Admin Features**:
- Approve/reject payout requests
- Add admin notes
- Batch payout processing
- Automatic commission status updates

## 🛠️ Technical Implementation

### Database Migrations
1. `20251023000000_referral_system.sql` - Core referral system
2. `20251023000001_fraud_detection.sql` - Fraud detection features

### Frontend Pages
- `/src/pages/Referrals.tsx` - User referral dashboard
- `/src/pages/ReferralLanding.tsx` - Referral tracking landing page
- `/src/pages/AdminReferrals.tsx` - Admin management dashboard

### Components
- `/src/components/NotificationBell.tsx` - Notification system UI

### Integration Points
- **Auth.tsx**: Updated to handle referral tracking on signup
- **Profile.tsx**: Added link to referrals page
- **Admin.tsx**: Added referrals tab
- **Header.tsx**: Added notification bell

## 📈 How It Works

### For Users (Referrers):
1. User gets unique referral link: `https://digituuls.com/ref/{username}`
2. Shares link via social media or direct messaging
3. When someone signs up through their link and becomes a seller:
   - Referral is tracked in database
   - Link is established permanently
4. When referred seller makes sales:
   - Automatic commission calculation (3% of sale)
   - Notification sent to referrer
   - Commission added to pending balance
5. When balance reaches £25:
   - User can request payout
   - Admin processes payout
   - Funds transferred to user

### For Admins:
1. Monitor all referral activity in `/admin/referrals`
2. Review payout requests
3. Approve or reject with notes
4. Monitor fraud flags
5. Export data for accounting
6. Pause suspicious referrers

### Fraud Detection:
1. Automatic checks run on every referral completion
2. Periodic batch checks for velocity and IP patterns
3. Flags created with severity levels
4. Admins review and resolve flags
5. Can pause or disable fraudulent referrers

## 🔧 Configuration

### Minimum Payout Threshold
Default: £25 (stored in `referral_settings.minimum_payout_threshold` as pence)

To change for a user:
```sql
UPDATE referral_settings 
SET minimum_payout_threshold = 5000 -- £50.00
WHERE user_id = 'user-uuid';
```

### Run Fraud Checks Manually
```sql
SELECT run_fraud_checks();
```

**Recommended**: Set up a cron job or edge function to run this every hour.

### Commission Calculation Formula
```
Sale Amount: £100
Platform Fee (10%): £10
Referrer Commission (30% of fee): £3 (3% of sale)
```

## 🎨 UI/UX Features

- Modern, clean interface matching DigiTuuls design
- Mobile-responsive layout
- Real-time updates via Supabase subscriptions
- Toast notifications for user actions
- Loading states and error handling
- Social media integration for easy sharing

## 📊 Analytics Available

### User View:
- Total referrals (all-time)
- Active referrals (sellers who made sales)
- Total referred sales volume
- Platform earnings from referred sales
- Total commission earnings
- Pending vs paid commissions

### Admin View:
- Total referrers
- Total referrals across platform
- Total sales generated through referrals
- Platform earnings from referral sales
- Total commissions paid out
- Pending payouts count
- Individual referrer performance

## 🔐 Security Considerations

1. **RLS Policies**: All tables have row-level security enabled
2. **Function Security**: All functions use `SECURITY DEFINER` appropriately
3. **Fraud Prevention**: Multiple layers of fraud detection
4. **Idempotency**: Commission calculations use unique constraints
5. **Audit Trail**: All actions logged with timestamps
6. **Admin-Only Access**: Sensitive operations require admin role

## 🚀 Deployment Checklist

- [x] Run database migrations
- [x] Update Supabase types (if using generated types)
- [x] Install dependencies (`date-fns`)
- [x] Test referral link tracking
- [x] Test commission calculation
- [x] Test payout workflow
- [x] Test fraud detection
- [x] Test notifications
- [x] Set up periodic fraud check job (recommended)

## 📱 Testing the System

### Test User Referral Flow:
1. Sign up as User A
2. Copy referral link from `/referrals`
3. Open link in incognito window
4. Sign up as User B (referred user)
5. Make User B a seller
6. Create a test purchase for User B's product
7. Mark purchase as succeeded
8. Check User A's dashboard for commission

### Test Admin Flow:
1. Assign admin role to test user
2. Access `/admin/referrals`
3. Request payout as User A (need £25 minimum)
4. Approve/reject payout as admin
5. Check notification system

### Test Fraud Detection:
1. Try to refer yourself (should be blocked)
2. Create multiple referrals from same IP (should be flagged)
3. Check fraud flags in database or admin view

## 🐛 Troubleshooting

**Commission not calculating:**
- Check if purchase status is "succeeded"
- Verify seller was properly referred (check referrals table)
- Check if referral is active (`is_active = true`)
- Look for errors in Supabase logs

**Payout not working:**
- Verify minimum threshold is met
- Check commission status (should be "approved")
- Ensure user has valid payout settings

**Notifications not showing:**
- Check Supabase real-time is enabled
- Verify notification table has entries
- Check browser console for WebSocket errors

## 📞 Support

For issues or questions about the referral system:
1. Check database logs in Supabase
2. Review function execution logs
3. Test queries in Supabase SQL editor
4. Check RLS policies if access denied

## 🎉 Success Metrics

Track these KPIs to measure referral program success:
- **Conversion Rate**: % of referred users who become sellers
- **Active Referrer Rate**: % of users who have at least 1 referral
- **Average Commission per Referrer**: Total commissions / total referrers
- **Referral Sales Volume**: Total sales from referred sellers
- **Payout Processing Time**: Time from request to completion

## 🔮 Future Enhancements

Consider adding:
- Referral tiers (earn more for top referrers)
- Leaderboards
- Referral contests and bonuses
- Email notifications (in addition to in-app)
- Advanced analytics dashboard with charts
- Automated payout scheduling
- Multi-currency support
- Referral program customization per user segment

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-23  
**Status**: ✅ Production Ready
