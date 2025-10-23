import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Ban,
  CheckSquare
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminStats {
  total_referrers: number;
  total_referrals: number;
  total_sales: number;
  platform_earnings: number;
  total_commissions: number;
  pending_commissions: number;
  pending_payouts: number;
}

interface ReferrerData {
  referrer_id: string;
  referrer_username: string;
  referrer_name: string;
  total_referrals: number;
  active_referrals: number;
  total_sales_volume: number;
  total_platform_earnings: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  is_active: boolean;
}

interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  method: string;
  requested_at: string;
  user: {
    username: string;
    display_name: string;
    email: string;
  };
}

const AdminReferrals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    total_referrers: 0,
    total_referrals: 0,
    total_sales: 0,
    platform_earnings: 0,
    total_commissions: 0,
    pending_commissions: 0,
    pending_payouts: 0,
  });
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutAction, setPayoutAction] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    checkAdminAccess();
    loadAdminData();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast.error("Unauthorized access");
      navigate("/");
    }
  };

  const loadAdminData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get overview stats
      const { data: overviewData } = await supabase
        .from("admin_referral_overview")
        .select("*");

      if (overviewData) {
        const totalReferrers = overviewData.length;
        const totalReferrals = overviewData.reduce((sum, r) => sum + r.total_referrals, 0);
        const totalSales = overviewData.reduce((sum, r) => sum + r.total_sales_volume, 0);
        const platformEarnings = overviewData.reduce((sum, r) => sum + r.total_platform_earnings, 0);
        const totalCommissions = overviewData.reduce((sum, r) => sum + r.total_commissions, 0);
        const pendingCommissions = overviewData.reduce((sum, r) => sum + r.pending_commissions, 0);

        setStats({
          total_referrers: totalReferrers,
          total_referrals: totalReferrals,
          total_sales: totalSales / 100,
          platform_earnings: platformEarnings / 100,
          total_commissions: totalCommissions / 100,
          pending_commissions: pendingCommissions / 100,
          pending_payouts: 0,
        });

        setReferrers(
          overviewData.map((r) => ({
            referrer_id: r.referrer_id,
            referrer_username: r.referrer_username,
            referrer_name: r.referrer_name,
            total_referrals: r.total_referrals,
            active_referrals: r.active_referrals,
            total_sales_volume: r.total_sales_volume / 100,
            total_platform_earnings: r.total_platform_earnings / 100,
            total_commissions: r.total_commissions / 100,
            pending_commissions: r.pending_commissions / 100,
            paid_commissions: r.paid_commissions / 100,
            is_active: r.is_active,
          }))
        );
      }

      // Get pending payouts
      const { data: payoutsData } = await supabase
        .from("payouts")
        .select(`
          id,
          user_id,
          amount,
          status,
          method,
          requested_at,
          profiles!payouts_user_id_fkey (
            username,
            display_name
          )
        `)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });

      if (payoutsData) {
        // Get user emails
        const userIds = payoutsData.map((p) => p.user_id);
        const { data: usersData } = await supabase.auth.admin.listUsers();

        const payoutsWithEmails = payoutsData.map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          amount: p.amount,
          status: p.status,
          method: p.method,
          requested_at: p.requested_at,
          user: {
            username: p.profiles?.username || "Unknown",
            display_name: p.profiles?.display_name || "Unknown User",
            email: usersData?.users.find((u) => u.id === p.user_id)?.email || "N/A",
          },
        }));

        setPayouts(payoutsWithEmails);
        setStats((prev) => ({ ...prev, pending_payouts: payoutsWithEmails.length }));
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async () => {
    if (!selectedPayout) return;

    try {
      const newStatus = payoutAction === "approve" ? "completed" : "failed";

      // Update payout status
      const { error: payoutError } = await supabase
        .from("payouts")
        .update({
          status: newStatus,
          admin_notes: payoutNotes,
          processed_at: new Date().toISOString(),
          completed_at: payoutAction === "approve" ? new Date().toISOString() : null,
          failed_reason: payoutAction === "reject" ? payoutNotes : null,
        })
        .eq("id", selectedPayout.id);

      if (payoutError) throw payoutError;

      // If approved, update commission statuses
      if (payoutAction === "approve") {
        const { data: payoutData } = await supabase
          .from("payouts")
          .select("commission_ids")
          .eq("id", selectedPayout.id)
          .single();

        if (payoutData?.commission_ids) {
          await supabase
            .from("commissions")
            .update({ status: "paid" })
            .in("id", payoutData.commission_ids);
        }

        // Send notification
        await supabase.from("notifications").insert({
          user_id: selectedPayout.user_id,
          type: "payout_completed",
          title: "Payout Completed!",
          message: `Your payout of £${(selectedPayout.amount / 100).toFixed(2)} has been processed.`,
          data: { payout_id: selectedPayout.id, amount: selectedPayout.amount },
        });
      } else {
        // Send failure notification
        await supabase.from("notifications").insert({
          user_id: selectedPayout.user_id,
          type: "payout_failed",
          title: "Payout Failed",
          message: `Your payout request could not be processed. ${payoutNotes}`,
          data: { payout_id: selectedPayout.id },
        });
      }

      toast.success(
        `Payout ${payoutAction === "approve" ? "approved" : "rejected"} successfully`
      );
      setPayoutDialogOpen(false);
      setSelectedPayout(null);
      setPayoutNotes("");
      loadAdminData();
    } catch (error) {
      console.error("Error processing payout:", error);
      toast.error("Failed to process payout");
    }
  };

  const toggleReferrerStatus = async (referrerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("referrals")
        .update({ is_active: !currentStatus })
        .eq("referrer_id", referrerId);

      if (error) throw error;

      toast.success(`Referrer ${!currentStatus ? "activated" : "deactivated"}`);
      loadAdminData();
    } catch (error) {
      console.error("Error toggling referrer status:", error);
      toast.error("Failed to update referrer status");
    }
  };

  const exportData = () => {
    const csv = [
      ["Username", "Name", "Total Referrals", "Active", "Sales Volume", "Commissions", "Status"],
      ...referrers.map((r) => [
        r.referrer_username,
        r.referrer_name,
        r.total_referrals,
        r.active_referrals,
        `£${r.total_sales_volume.toFixed(2)}`,
        `£${r.total_commissions.toFixed(2)}`,
        r.is_active ? "Active" : "Paused",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referrals_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredReferrers = referrers.filter(
    (r) =>
      r.referrer_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Referral Management</h1>
          <p className="text-muted-foreground">Monitor and manage the referral program</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_referrers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_referrals} total referrals
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.total_sales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform: £{stats.platform_earnings.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.total_commissions.toFixed(2)}</div>
              <p className="text-xs text-primary mt-1">
                Pending: £{stats.pending_commissions.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_payouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Require action</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payouts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
            <TabsTrigger value="referrers">All Referrers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Payout Requests Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>Pending Payout Requests</CardTitle>
                <CardDescription>Review and process payout requests</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending payouts</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payout.user.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                @{payout.user.username}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{payout.user.email}</TableCell>
                          <TableCell className="font-semibold">
                            £{(payout.amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payout.method}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(payout.requested_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setPayoutAction("approve");
                                  setPayoutDialogOpen(true);
                                }}
                              >
                                <CheckSquare className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setPayoutAction("reject");
                                  setPayoutDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Referrers Tab */}
          <TabsContent value="referrers" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Referrer Directory</CardTitle>
                    <CardDescription>View and manage all referrers</CardDescription>
                  </div>
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Sales Volume</TableHead>
                      <TableHead>Commissions</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrers.map((referrer) => (
                      <TableRow key={referrer.referrer_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{referrer.referrer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{referrer.referrer_username}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {referrer.total_referrals} ({referrer.active_referrals} active)
                        </TableCell>
                        <TableCell>£{referrer.total_sales_volume.toFixed(2)}</TableCell>
                        <TableCell>£{referrer.total_commissions.toFixed(2)}</TableCell>
                        <TableCell className="text-primary">
                          £{referrer.pending_commissions.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              referrer.is_active
                                ? "bg-green-500/20 text-green-700"
                                : "bg-red-500/20 text-red-700"
                            }
                          >
                            {referrer.is_active ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleReferrerStatus(referrer.referrer_id, referrer.is_active)
                              }
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              {referrer.is_active ? "Pause" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/admin/referrals/${referrer.referrer_id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>Referral Analytics</CardTitle>
                <CardDescription>Charts and insights coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced analytics and charts will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payout Action Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {payoutAction === "approve" ? "Approve Payout" : "Reject Payout"}
            </DialogTitle>
            <DialogDescription>
              {selectedPayout && (
                <>
                  Process payout of £{(selectedPayout.amount / 100).toFixed(2)} for{" "}
                  {selectedPayout.user.display_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {payoutAction === "approve" ? "Admin Notes (optional)" : "Rejection Reason"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  payoutAction === "approve"
                    ? "Add any internal notes..."
                    : "Explain why this payout is being rejected..."
                }
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayoutAction}
              className={payoutAction === "approve" ? "bg-green-600" : "bg-red-600"}
            >
              {payoutAction === "approve" ? "Approve & Pay" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReferrals;
