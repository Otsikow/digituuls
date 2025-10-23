import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const gbp = (cents: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format((cents || 0) / 100);

const AdminReferrals = () => {
  const [search, setSearch] = useState("");
  const [overview, setOverview] = useState({
    referredUsers: 0,
    referredSalesCents: 0,
    platformCents: 0,
    commissionsCents: 0,
    pendingCents: 0,
    readyCents: 0,
    paidCents: 0,
  });
  const [topReferrers, setTopReferrers] = useState<Array<{ referrer_id: string; total_cents: number }>>([]);
  const [pendingCommissions, setPendingCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: allComms } = await supabase
        .from("referral_commissions")
        .select("referrer_id, referred_id, sale_amount, platform_fee_amount, commission_amount, status");

      const { data: rels } = await supabase
        .from("referral_relations")
        .select("id");

      let sales = 0, platform = 0, commissions = 0, pending = 0, ready = 0, paid = 0;
      const byReferrer = new Map<string, number>();
      (allComms ?? []).forEach(c => {
        sales += c.sale_amount ?? 0;
        platform += c.platform_fee_amount ?? 0;
        commissions += c.commission_amount ?? 0;
        if (c.status === 'pending') pending += c.commission_amount ?? 0;
        if (c.status === 'ready') ready += c.commission_amount ?? 0;
        if (c.status === 'paid') paid += c.commission_amount ?? 0;
        byReferrer.set(c.referrer_id, (byReferrer.get(c.referrer_id) || 0) + (c.commission_amount ?? 0));
      });

      const sorted = Array.from(byReferrer.entries()).map(([referrer_id, total_cents]) => ({ referrer_id, total_cents }))
        .sort((a,b) => b.total_cents - a.total_cents).slice(0, 20);

      setOverview({
        referredUsers: rels?.length || 0,
        referredSalesCents: sales,
        platformCents: platform,
        commissionsCents: commissions,
        pendingCents: pending,
        readyCents: ready,
        paidCents: paid,
      });

      const { data: pend } = await supabase
        .from("referral_commissions")
        .select("id, referrer_id, referred_id, commission_amount, status")
        .in("status", ['pending','ready']);
      setPendingCommissions(pend ?? []);

      const { data: payoutRows } = await supabase
        .from("referral_payouts")
        .select("*")
        .order("requested_at", { ascending: false });
      setPayouts(payoutRows ?? []);
    };

    load();
  }, []);

  const approvePayout = async (id: string) => {
    await supabase.from("referral_payouts").update({ status: 'approved' }).eq('id', id);
  };
  const markPaidPayout = async (id: string) => {
    await supabase.from("referral_payouts").update({ status: 'paid', processed_at: new Date().toISOString() }).eq('id', id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referral Management</h1>
            <p className="text-muted-foreground">Monitor referrals, commissions, and payouts.</p>
          </div>
          <Input placeholder="Search by user id/email (coming soon)" value={search} onChange={(e)=>setSearch(e.target.value)} className="max-w-sm" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Referred Users</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{overview.referredUsers}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Referred Sales</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{gbp(overview.referredSalesCents)}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Platform 10%</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{gbp(overview.platformCents)}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Commissions 30% of 10%</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{gbp(overview.commissionsCents)}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Pending</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{gbp(overview.pendingCents)}</CardContent></Card>
          <Card className="border-border/50 bg-gradient-card"><CardHeader><CardTitle className="text-xs">Ready</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{gbp(overview.readyCents)}</CardContent></Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Commissions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="leaders">Top Referrers</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader><CardTitle>Commissions Pending/Ready</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCommissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.referrer_id.slice(0,8)}</TableCell>
                        <TableCell>{c.referred_id.slice(0,8)}</TableCell>
                        <TableCell>{gbp(c.commission_amount)}</TableCell>
                        <TableCell className="capitalize">{c.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader><CardTitle>Payout Requests</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.referrer_id.slice(0,8)}</TableCell>
                        <TableCell>{gbp(p.amount)}</TableCell>
                        <TableCell className="capitalize">{p.method.replace('_',' ')}</TableCell>
                        <TableCell className="capitalize">{p.status}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => approvePayout(p.id)} disabled={p.status !== 'pending'}>Approve</Button>
                          <Button size="sm" onClick={() => markPaidPayout(p.id)} disabled={p.status !== 'approved'}>Mark Paid</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaders">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader><CardTitle>Top Referrers</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Total Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topReferrers.map((t) => (
                      <TableRow key={t.referrer_id}>
                        <TableCell>{t.referrer_id.slice(0,8)}</TableCell>
                        <TableCell>{gbp(t.total_cents)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReferrals;
