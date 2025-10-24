import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Share2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ExternalLink,
  Bell,
  Download
} from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { formatCurrency, formatPercentage, getSocialSharingUrls, copyToClipboard, getPayoutMethodDisplayName, getStatusDisplay } from '@/lib/referralUtils';

export default function Referrals() {
  const { 
    referralCode, 
    referralStats, 
    referralEarnings, 
    payouts, 
    notifications, 
    settings,
    requestPayout,
    markNotificationAsRead,
    refreshData
  } = useReferrals();
  
  const { toast } = useToast();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('stripe');

  const referralUrl = referralCode ? `${window.location.origin}/ref/${referralCode}` : '';
  const socialUrls = getSocialSharingUrls(
    referralUrl,
    'Join me on DigiTuuls and start earning from your digital products!'
  );

  const handleCopyLink = async () => {
    if (referralUrl) {
      const success = await copyToClipboard(referralUrl);
      if (success) {
        toast({
          title: 'Link copied!',
          description: 'Your referral link has been copied to clipboard.',
        });
      } else {
        toast({
          title: 'Copy failed',
          description: 'Could not copy to clipboard. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleShare = (platform: string) => {
    const url = socialUrls[platform as keyof typeof socialUrls];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleRequestPayout = async () => {
    if (!referralStats || !settings) return;

    const amount = parseFloat(payoutAmount);
    if (amount < (settings.minimum_payout_amount || 2500) / 100) {
      toast({
        title: 'Amount too low',
        description: `Minimum payout amount is ${formatCurrency(settings.minimum_payout_amount || 2500)}`,
        variant: 'destructive',
      });
      return;
    }

    if (amount > referralStats.pendingBalance / 100) {
      toast({
        title: 'Insufficient balance',
        description: 'You cannot request more than your pending balance.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await requestPayout(amount, payoutMethod);
    if (error) {
      toast({
        title: 'Request failed',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Payout requested',
        description: 'Your payout request has been submitted for review.',
      });
      setPayoutDialogOpen(false);
      setPayoutAmount('');
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  if (!referralStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referrals & Earnings</h1>
        <p className="text-gray-600">Track your referral performance and earnings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {referralStats.activeReferrals} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referred Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referralStats.totalSalesVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total volume generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referralStats.totalReferralEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(3)} of each sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referralStats.pendingBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Referral Link Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link to earn 3% commission on every sale your referrals make
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralUrl} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleShare('whatsapp')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('telegram')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payout Request */}
          {referralStats.pendingBalance >= (settings?.minimum_payout_amount || 2500) && (
            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  You have {formatCurrency(referralStats.pendingBalance)} available for payout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Request Payout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Payout</DialogTitle>
                      <DialogDescription>
                        Request a payout for your referral earnings
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          max={referralStats.pendingBalance / 100}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Available: {formatCurrency(referralStats.pendingBalance)}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleRequestPayout} className="w-full">
                        Request Payout
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                Detailed breakdown of your referral earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Sale Amount</TableHead>
                    <TableHead>Platform Fee (10%)</TableHead>
                    <TableHead>Your Commission (3%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralEarnings.map((earning, index) => {
                    const statusDisplay = getStatusDisplay(earning.paymentStatus);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {earning.referredUserName}
                        </TableCell>
                        <TableCell>{formatCurrency(earning.totalSales)}</TableCell>
                        <TableCell>{formatCurrency(earning.platformEarnings)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(earning.referrerCommission)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusDisplay.color === 'green' ? 'default' : 'secondary'}>
                            {statusDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {earning.lastPaymentDate 
                            ? new Date(earning.lastPaymentDate).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Track your payout requests and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => {
                    const statusDisplay = getStatusDisplay(payout.status);
                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>
                          {getPayoutMethodDisplayName(payout.method)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusDisplay.color === 'green' ? 'default' : 'secondary'}>
                            {statusDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {payout.processed_at 
                            ? new Date(payout.processed_at).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Stay updated on your referral activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No notifications yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}