import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Download, 
  Filter, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, getStatusDisplay, getPayoutMethodDisplayName } from '@/lib/referralUtils';

interface AdminReferralStats {
  totalReferrals: number;
  totalCommissions: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);

  const loadStats = async () => {
    try {
      // Get total referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('id, status');

      // Get total commissions
      const { data: commissionsData } = await supabase
        .from('referral_commissions')
        .select('commission_amount, status');

      // Get total payouts
      const { data: payoutsData } = await supabase
        .from('referral_payouts')
        .select('amount, status');

      // Get top referrers
      const { data: topReferrersData } = await supabase
        .rpc('get_top_referrers', { limit_count: 10 });

      const totalReferrals = referralsData?.length || 0;
      const totalCommissions = commissionsData?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
      const totalPayouts = payoutsData?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingPayouts = payoutsData?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalReferrals,
        totalCommissions,
        totalPayouts,
        pendingPayouts,
        topReferrers: topReferrersData || [],
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select(`
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
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const commissionRecords: CommissionRecord[] = (data || []).map(commission => ({
        id: commission.id,
        referrer_id: commission.referrer_id,
        referred_user_id: commission.referred_user_id,
        sale_amount: commission.sale_amount,
        commission_amount: commission.commission_amount,
        status: commission.status,
        created_at: commission.created_at,
        paid_at: commission.paid_at,
        referrer_name: commission.profiles?.display_name || 'Unknown',
        referred_name: commission.profiles?.display_name || 'Unknown',
      }));

      setCommissions(commissionRecords);
    } catch (error) {
      console.error('Error loading commissions:', error);
    }
  };

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_payouts')
        .select(`
          id,
          user_id,
          amount,
          method,
          status,
          created_at,
          processed_at,
          profiles!referral_payouts_user_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const payoutRecords: PayoutRecord[] = (data || []).map(payout => ({
        id: payout.id,
        user_id: payout.user_id,
        amount: payout.amount,
        method: payout.method,
        status: payout.status,
        created_at: payout.created_at,
        processed_at: payout.processed_at,
        user_name: payout.profiles?.display_name || 'Unknown',
      }));

      setPayouts(payoutRecords);
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const updateCommissionStatus = async (commissionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('referral_commissions')
        .update({ 
          status,
          ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {})
        })
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: 'Commission status has been updated successfully.',
      });

      loadCommissions();
    } catch (error) {
      console.error('Error updating commission status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update commission status.',
        variant: 'destructive',
      });
    }
  };

  const updatePayoutStatus = async (payoutId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('referral_payouts')
        .update({ 
          status,
          ...(status === 'completed' ? { 
            processed_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          } : {})
        })
        .eq('id', payoutId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: 'Payout status has been updated successfully.',
      });

      loadPayouts();
      setPayoutDialogOpen(false);
    } catch (error) {
      console.error('Error updating payout status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update payout status.',
        variant: 'destructive',
      });
    }
  };

  const exportData = async (type: 'commissions' | 'payouts') => {
    try {
      const data = type === 'commissions' ? commissions : payouts;
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadCommissions(),
        loadPayouts(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.referred_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Management</h1>
        <p className="text-gray-600">Monitor and manage the referral system</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissions)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPayouts)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayouts)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="commissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission Management</CardTitle>
                  <CardDescription>Review and manage referral commissions</CardDescription>
                </div>
                <Button onClick={() => exportData('commissions')} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by referrer or referred user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Sale Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => {
                    const statusDisplay = getStatusDisplay(commission.status);
                    return (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {commission.referrer_name}
                        </TableCell>
                        <TableCell>{commission.referred_name}</TableCell>
                        <TableCell>{formatCurrency(commission.sale_amount)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(commission.commission_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusDisplay.color === 'green' ? 'default' : 'secondary'}>
                            {statusDisplay.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(commission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {commission.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCommissionStatus(commission.id, 'confirmed')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCommissionStatus(commission.id, 'paid')}
                                >
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Pay
                                </Button>
                              </>
                            )}
                            {commission.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCommissionStatus(commission.id, 'paid')}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Pay
                              </Button>
                            )}
                          </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payout Management</CardTitle>
                  <CardDescription>Process and manage user payouts</CardDescription>
                </div>
                <Button onClick={() => exportData('payouts')} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by user name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => {
                    const statusDisplay = getStatusDisplay(payout.status);
                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {payout.user_name}
                        </TableCell>
                        <TableCell>{formatCurrency(payout.amount)}</TableCell>
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setPayoutDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {payout.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePayoutStatus(payout.id, 'completed')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>Users with the highest referral earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Total Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topReferrers.map((referrer, index) => (
                    <TableRow key={referrer.user_id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {referrer.display_name}
                      </TableCell>
                      <TableCell>{referrer.referral_count}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(referrer.total_earnings)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Details Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              Review payout information and update status
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="font-medium">{selectedPayout.user_name}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">{formatCurrency(selectedPayout.amount)}</p>
              </div>
              <div>
                <Label>Method</Label>
                <p className="font-medium">{getPayoutMethodDisplayName(selectedPayout.method)}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant="secondary">
                  {getStatusDisplay(selectedPayout.status).label}
                </Badge>
              </div>
              <div>
                <Label>Requested</Label>
                <p>{new Date(selectedPayout.created_at).toLocaleString()}</p>
              </div>
              {selectedPayout.processed_at && (
                <div>
                  <Label>Processed</Label>
                  <p>{new Date(selectedPayout.processed_at).toLocaleString()}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {selectedPayout.status === 'pending' && (
                  <Button
                    onClick={() => updatePayoutStatus(selectedPayout.id, 'completed')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setPayoutDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}