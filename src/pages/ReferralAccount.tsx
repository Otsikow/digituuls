import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2 } from "lucide-react";

const CURRENCY = "GBP";
const MIN_PAYOUT_CENTS = 2500; // £25

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

const ReferralAccount = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalReferredSalesCents: 0,
    platformEarningsCents: 0,
    referralEarningsCents: 0,
    pendingCents: 0,
    readyCents: 0,
    paidCents: 0,
  });
  const [rows, setRows] = useState<Array<{
    referred_user_id: string;
    referred_display: string;
    total_sales_cents: number;
    platform_cents: number;
    commission_cents: number;
    last_paid_at: string | null;
    status: string;
  }>>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  const referralUrl = useMemo(() => {
    const base = window.location.origin;
    return code ? `${base}/ref/${code}` : "";
  }, [code]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // Get my code (auto-created by trigger)
      let { data: codeRow } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("referrer_id", user.id)
        .maybeSingle();
      if (!codeRow) {
        const fallback = `u${user.id.slice(0,8).toLowerCase()}`;
        await supabase.from("referral_codes").insert({ referrer_id: user.id, code: fallback });
        codeRow = { code: fallback } as any;
      }
      setCode(codeRow?.code ?? "");

      // Aggregate stats
      const { data: commissions } = await supabase
        .from("referral_commissions")
        .select("referred_id, commission_amount, platform_fee_amount, sale_amount, status, paid_at")
        .eq("referrer_id", user.id);

      const { data: relations } = await supabase
        .from("referral_relations")
        .select("referred_id")
        .eq("referrer_id", user.id);

      const referredSet = new Set(relations?.map(r => r.referred_id) ?? []);
      const totalReferrals = referredSet.size;

      let totalSales = 0, platform = 0, commissionsSum = 0, ready = 0, pending = 0, paid = 0;
      const byReferred = new Map<string, {sales: number; platform: number; commission: number; last_paid_at: string | null; status: string}>();
      (commissions ?? []).forEach(c => {
        totalSales += c.sale_amount ?? 0;
        platform += c.platform_fee_amount ?? 0;
        commissionsSum += c.commission_amount ?? 0;
        if (c.status === 'ready') ready += c.commission_amount ?? 0;
        if (c.status === 'pending') pending += c.commission_amount ?? 0;
        if (c.status === 'paid') paid += c.commission_amount ?? 0;
        const entry = byReferred.get(c.referred_id) || { sales: 0, platform: 0, commission: 0, last_paid_at: null, status: c.status };
        entry.sales += c.sale_amount ?? 0;
        entry.platform += c.platform_fee_amount ?? 0;
        entry.commission += c.commission_amount ?? 0;
        entry.last_paid_at = c.paid_at ?? entry.last_paid_at;
        entry.status = c.status;
        byReferred.set(c.referred_id, entry);
      });

      setStats({
        totalReferrals,
        activeReferrals: byReferred.size,
        totalReferredSalesCents: totalSales,
        platformEarningsCents: platform,
        referralEarningsCents: commissionsSum,
        pendingCents: pending,
        readyCents: ready,
        paidCents: paid,
      });

      // Map rows; try to get profile names
      const rowsData: any[] = [];
      for (const [referredId, v] of byReferred.entries()) {
        rowsData.push({
          referred_user_id: referredId,
          referred_display: referredId.slice(0, 8),
          total_sales_cents: v.sales,
          platform_cents: v.platform,
          commission_cents: v.commission,
          last_paid_at: v.last_paid_at,
          status: v.status,
        });
      }
      setRows(rowsData);

      const { data: payoutRows } = await supabase
        .from("referral_payouts")
        .select("*")
        .eq("referrer_id", user.id)
        .order("requested_at", { ascending: false });
      setPayouts(payoutRows ?? []);

      setLoading(false);
    };

    load();
  }, [user]);

  const requestPayout = async () => {
    if (!user) return;
    if (stats.readyCents < MIN_PAYOUT_CENTS) return;
    await supabase.from("referral_payouts").insert({ referrer_id: user.id, amount: stats.readyCents, method: 'manual' });
  };

  const fmt = (cents: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY }).format((cents || 0) / 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Referrals & Earnings</h1>
          <p className="text-muted-foreground">Earn 3% of your referrals' sales.</p>
        </div>

        <Card className="border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <Input value={referralUrl} readOnly className="bg-secondary/50" />
            <div className="flex gap-2">
              <Button onClick={() => copyToClipboard(referralUrl)} variant="secondary"><Copy className="h-4 w-4 mr-2"/>Copy</Button>
              <Button onClick={() => navigator.share?.({ title: 'DigiTuuls', url: referralUrl })} variant="outline"><Share2 className="h-4 w-4 mr-2"/>Share</Button>
            </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Join DigiTuuls and earn as a creator! ' + referralUrl)}`, '_blank')}>WhatsApp</Button>
              <Button variant="outline" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank')}>Facebook</Button>
              <Button variant="outline" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join DigiTuuls and earn as a creator!')}`, '_blank')}>X</Button>
              <Button variant="outline" onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join DigiTuuls and earn as a creator!')}`, '_blank')}>Telegram</Button>
            </div>
            <div className="text-xs text-muted-foreground">Invite creators to DigiTuuls and earn 3% of their sales!</div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-sm">Referred Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalReferrals}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-sm">Active Referrals</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.activeReferrals}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-sm">Referred Sales</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{fmt(stats.totalReferredSalesCents)}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-sm">Your Earnings</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{fmt(stats.referralEarningsCents)}</CardContent></Card>
        </div>

        <Card className="border-border/50 bg-gradient-card">
          <CardHeader><CardTitle>Payout & Balance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-xs text-muted-foreground">Ready to Payout</div><div className="text-xl font-semibold">{fmt(stats.readyCents)}</div></div>
              <div><div className="text-xs text-muted-foreground">Pending</div><div className="text-xl font-semibold">{fmt(stats.pendingCents)}</div></div>
              <div><div className="text-xs text-muted-foreground">Paid Total</div><div className="text-xl font-semibold">{fmt(stats.paidCents)}</div></div>
              <div><div className="text-xs text-muted-foreground">Minimum Threshold</div><div className="text-xl font-semibold">{fmt(MIN_PAYOUT_CENTS)}</div></div>
            </div>
            <Button disabled={stats.readyCents < MIN_PAYOUT_CENTS} onClick={requestPayout} className="bg-gradient-primary">Request Payout</Button>
            <div className="text-xs text-muted-foreground">Payment methods: manual, bank, Stripe Connect, PayPal</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-card">
          <CardHeader><CardTitle>Detailed Earnings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>DigiTuuls 10%</TableHead>
                  <TableHead>Your 30% of 10%</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.referred_user_id}>
                    <TableCell>{r.referred_display}</TableCell>
                    <TableCell>{fmt(r.total_sales_cents)}</TableCell>
                    <TableCell>{fmt(r.platform_cents)}</TableCell>
                    <TableCell>{fmt(r.commission_cents)}</TableCell>
                    <TableCell className="capitalize">{r.status}</TableCell>
                    <TableCell>{r.last_paid_at ? new Date(r.last_paid_at).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-card">
          <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell>{fmt(p.amount)}</TableCell>
                    <TableCell className="capitalize">{p.method.replace('_',' ')}</TableCell>
                    <TableCell className="capitalize">{p.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralAccount;
