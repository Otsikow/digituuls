import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  formatCurrency,
  getStatusDisplay,
  getPayoutMethodDisplayName,
} from "@/lib/referralUtils";

interface AdminReferralStats {
  totalReferrals: number;
  totalSales: number;
  platformFees: number;
  totalCommissions: number;
  pendingCommissions: number;
  readyCommissions: number;
  totalPayouts: number;
  pendingPayouts: number;
  topReferrers: Array<{
    user_id: string;
    display_name: string;
    total_earnings: number;
    referral_count: number;
  }>;
}

interface CommissionRecord {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  sale_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  referrer_name: string;
  referred_name: string;
}

interface PayoutRecord {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  user_name: string;
}

export default function AdminReferrals() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(
    null
  );
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);

  // Fetch statistics overview
  const loadStats = async () => {
    try {
      const { data: rels } = await supabase.from("referral_relations").select("id");
      const { data: commissionsData } = await supabase
        .from("referral_commissions")
        .select("commission_amount, sale_amount, platform_fee_amount, status");
      const { data: payoutsData } = await supabase
        .from("referral_payouts")
        .select("amount, status");
      const { data: topReferrersData } = await supabase.rpc("get_top_referrers", {
        limit_count: 10,
      });

      const totalSales =
        commissionsData?.reduce((sum, c) => sum + (c.sale_amount ?? 0), 0) || 0;
      const platformFees =
        commissionsData?.reduce((sum, c) => sum + (c.platform_fee_amount ?? 0), 0) || 0;
      const totalCommissions =
        commissionsData?.reduce((sum, c) => sum + (c.commission_amount ?? 0), 0) || 0;
      const pendingCommissions =
        commissionsData?.filter((c) => c.status === "pending").reduce(
          (sum, c) => sum + (c.commission_amount ?? 0),
          0
        ) || 0;
      const readyCommissions =
        commissionsData?.filter((c) => c.status === "ready").reduce(
          (sum, c) => sum + (c.commission_amount ?? 0),
          0
        ) || 0;
      const totalPayouts =
        payoutsData?.filter((p) => p.status === "completed").reduce(
          (sum, p) => sum + (p.amount ?? 0),
          0
        ) || 0;
      const pendingPayouts =
        payoutsData?.filter((p) => p.status === "pending").reduce(
          (sum, p) => sum + (p.amount ?? 0),
          0
        ) || 0;

      setStats({
        totalReferrals: rels?.length || 0,
        totalSales,
        platformFees,
        totalCommissions,
        pendingCommissions,
        readyCommissions,
        totalPayouts,
        pendingPayouts,
        topReferrers: topReferrersData || [],
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Fetch commissions
  const loadCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_commissions")
        .select(
          `
          id,
          referrer_id,
          referred_user_id,
          sale_amount,
          commission_amount,
          status,
          created_at,
          paid_at,
          profiles!referral_commissions_referrer_id_fkey(display_name),
          profiles!referral_commissions_referred_user_id_fkey(display_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const commissionRecords: CommissionRecord[] = (data || []).map((c) => ({
        id: c.id,
        referrer_id: c.referrer_id,
        referred_user_id: c.referred_user_id,
        sale_amount: c.sale_amount,
        commission_amount: c.commission_amount,
        status: c.status,
        created_at: c.created_at,
        paid_at: c.paid_at,
        referrer_name:
          c.profiles?.[0]?.display_name || c.profiles?.display_name || "Unknown",
        referred_name:
          c.profiles?.[1]?.display_name || c.profiles?.display_name || "Unknown",
      }));

      setCommissions(commissionRecords);
    } catch (error) {
      console.error("Error loading commissions:", error);
    }
  };

  // Fetch payouts
  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_payouts")
        .select(
          `
          id,
          user_id,
          amount,
          method,
          status,
          created_at,
          processed_at,
          profiles!referral_payouts_user_id_fkey(display_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const payoutRecords: PayoutRecord[] = (data || []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        created_at: p.created_at,
        processed_at: p.processed_at,
        user_name: p.profiles?.display_name || "Unknown",
      }));

      setPayouts(payoutRecords);
    } catch (error) {
      console.error("Error loading payouts:", error);
    }
  };

  const updateCommissionStatus = async (commissionId: string, status: string) => {
    try {
      await supabase
        .from("referral_commissions")
        .update({
          status,
          ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq("id", commissionId);

      toast({
        title: "Commission updated",
        description: "Commission status updated successfully.",
      });

      loadCommissions();
      loadStats();
    } catch (error) {
      console.error("Error updating commission status:", error);
      toast({
        title: "Update failed",
        description: "Could not update commission status.",
        variant: "destructive",
      });
    }
  };

  const updatePayoutStatus = async (payoutId: string, status: string) => {
    try {
      await supabase
        .from("referral_payouts")
        .update({
          status,
          ...(status === "completed"
            ? { processed_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", payoutId);

      toast({
        title: "Payout updated",
        description: "Payout status updated successfully.",
      });

      loadPayouts();
      loadStats();
      setPayoutDialogOpen(false);
    } catch (error) {
      console.error("Error updating payout:", error);
      toast({
        title: "Update failed",
        description: "Could not update payout status.",
        variant: "destructive",
      });
    }
  };

  const exportData = (type: "commissions" | "payouts") => {
    const data = type === "commissions" ? commissions : payouts;
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadCommissions(), loadPayouts()]);
      setLoading(false);
    };
    load();
  }, []);

  const filteredCommissions = commissions.filter((c) => {
    const matchesSearch =
      c.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.referred_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch = p.user_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        Loading referral data...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Management</h1>
        <p className="text-muted-foreground">
          Track commissions, payouts, and referral earnings (30% of 10%).
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>{stats.totalReferrals}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>{formatCurrency(stats.totalSales)}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Platform 10%</CardTitle>
            </CardHeader>
            <CardContent>{formatCurrency(stats.platformFees)}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Commissions (30% of 10%)</CardTitle>
            </CardHeader>
            <CardContent>{formatCurrency(stats.totalCommissions)}</CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="commissions">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Commission Management</CardTitle>
                <CardDescription>
                  Manage and approve referral commissions
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportData("commissions")}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search referrer or referred..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.referrer_name}</TableCell>
                      <TableCell>{c.referred_name}</TableCell>
                      <TableCell>{formatCurrency(c.commission_amount)}</TableCell>
                      <TableCell>
                        <Badge>{c.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {c.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateCommissionStatus(c.id, "ready")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {c.status === "ready" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateCommissionStatus(c.id, "paid")
                              }
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Payout Requests</CardTitle>
                <CardDescription>Approve and mark completed payouts</CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportData("payouts")}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.user_name}</TableCell>
                      <TableCell>{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        {getPayoutMethodDisplayName(p.method)}
                      </TableCell>
                      <TableCell>
                        <Badge>{p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPayout(p);
                              setPayoutDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                          {p.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updatePayoutStatus(p.id, "completed")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={payoutDialogOpen} onOpenChange={set
