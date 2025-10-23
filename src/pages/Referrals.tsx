import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Link2, 
  Copy, 
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  Wallet,
  ArrowUpRight
} from "lucide-react";

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_sales_volume: number;
  total_platform_earnings: number;
  total_commission_earnings: number;
  pending_commission: number;
  paid_commission: number;
}

interface Commission {
  id: string;
  referred_seller: {
    username: string;
    display_name: string;
  };
  sale_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  payment_cleared_at: string | null;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  requested_at: string;
  completed_at: string | null;
}

const Referrals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_sales_volume: 0,
    total_platform_earnings: 0,
    total_commission_earnings: 0,
    pending_commission: 0,
    paid_commission: 0,
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPayoutThreshold, setMinPayoutThreshold] = useState(25);

  const referralUrl = `${window.location.origin}/ref/${referralCode}`;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get referral code
      const { data: referralData } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .single();

      if (referralData) {
        setReferralCode(referralData.referral_code);
      }

      // Get referral stats
      const { data: statsData } = await supabase.rpc("get_referral_stats", {
        _user_id: user.id,
      });

      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Get commissions
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select(`
          id,
          sale_amount,
          commission_amount,
          status,
          created_at,
          payment_cleared_at,
          referred_seller_id,
          profiles!commissions_referred_seller_id_fkey (
            username,
            display_name
          )
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (commissionsData) {
        setCommissions(
          commissionsData.map((c: any) => ({
            id: c.id,
            referred_seller: {
              username: c.profiles?.username || "Unknown",
              display_name: c.profiles?.display_name || "Unknown User",
            },
            sale_amount: c.sale_amount,
            commission_amount: c.commission_amount,
            status: c.status,
            created_at: c.created_at,
            payment_cleared_at: c.payment_cleared_at,
          }))
        );
      }

      // Get payouts
      const { data: payoutsData } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false })
        .limit(10);

      if (payoutsData) {
        setPayouts(payoutsData);
      }

      // Get settings
      const { data: settingsData } = await supabase
        .from("referral_settings")
        .select("minimum_payout_threshold")
        .eq("user_id", user.id)
        .single();

      if (settingsData) {
        setMinPayoutThreshold(settingsData.minimum_payout_threshold / 100);
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
  };

  const shareOnPlatform = (platform: string) => {
    const text = encodeURIComponent(
      "Join DigiTuuls and start selling your digital products! Use my referral link:"
    );
    const url = encodeURIComponent(referralUrl);

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const requestPayout = async () => {
    if (!user) return;

    const pendingAmount = stats.pending_commission;

    if (pendingAmount < minPayoutThreshold) {
      toast.error(`Minimum payout amount is £${minPayoutThreshold}`);
      return;
    }

    try {
      // Get commission IDs that are approved but not paid
      const { data: unpaidCommissions } = await supabase
        .from("commissions")
        .select("id")
        .eq("referrer_id", user.id)
        .eq("status", "approved");

      if (!unpaidCommissions || unpaidCommissions.length === 0) {
        toast.error("No commissions available for payout");
        return;
      }

      const commissionIds = unpaidCommissions.map((c) => c.id);

      // Create payout request
      const { error } = await supabase.from("payouts").insert({
        user_id: user.id,
        amount: Math.round(pendingAmount * 100),
        currency: "GBP",
        method: "manual",
        status: "pending",
        commission_ids: commissionIds,
      });

      if (error) throw error;

      toast.success("Payout request submitted! We'll process it shortly.");
      loadReferralData();
    } catch (error) {
      console.error("Error requesting payout:", error);
      toast.error("Failed to request payout");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "approved":
      case "processing":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
      case "failed":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Referrals & Earnings</h1>
            <p className="text-muted-foreground">
              Invite creators to DigiTuuls and earn 3% of their sales!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_referrals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.active_referrals} active sellers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Referred Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  £{stats.total_sales_volume.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Platform earned: £{stats.total_platform_earnings.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  £{stats.total_commission_earnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">3% of referred sales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Pending Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  £{stats.pending_commission.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid: £{stats.paid_commission.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Section */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Your Referral Link
                  </CardTitle>
                  <CardDescription>
                    Share this link with creators to start earning commissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralUrl}
                  readOnly
                  className="bg-muted/50 font-mono text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => shareOnPlatform("twitter")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnPlatform("facebook")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareOnPlatform("whatsapp")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareOnPlatform("telegram")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </Button>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> When someone signs up using your link
                  and makes sales on DigiTuuls, you earn 3% of their sales (30% of our
                  10% platform fee). It's passive income for life!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payout Section */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payout & Balance
              </CardTitle>
              <CardDescription>Request payouts when you reach the threshold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">£{stats.pending_commission.toFixed(2)}</p>
                </div>
                <Button
                  onClick={requestPayout}
                  disabled={stats.pending_commission < minPayoutThreshold}
                  className="bg-gradient-primary"
                >
                  Request Payout
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Minimum payout threshold: £{minPayoutThreshold}
              </p>

              {payouts.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Payouts</h4>
                    <div className="space-y-2">
                      {payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <ArrowUpRight className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                £{(payout.amount / 100).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payout.requested_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Earnings Table */}
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Track earnings from your referred sellers</CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No commissions yet. Start sharing your referral link!
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
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
                      {commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell className="font-medium">
                            {commission.referred_seller.display_name}
                            <span className="text-xs text-muted-foreground block">
                              @{commission.referred_seller.username}
                            </span>
                          </TableCell>
                          <TableCell>£{(commission.sale_amount / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            £{(commission.sale_amount * 0.1 / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            £{(commission.commission_amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(commission.status)}>
                              {commission.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Referrals;
