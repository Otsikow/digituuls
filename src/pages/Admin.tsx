import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Package, TrendingUp, ExternalLink, Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { refreshSearchIndex, getSearchStats } from "@/lib/searchIndex";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshSearchIndex = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshSearchIndex();
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh search index",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = [
    { title: "Total Revenue", value: "$45,231", icon: DollarSign, change: "+12.5%" },
    { title: "Active Sellers", value: "234", icon: Users, change: "+8.2%" },
    { title: "Listed Products", value: "1,432", icon: Package, change: "+23.1%" },
    { title: "GMV (30d)", value: "$156,789", icon: TrendingUp, change: "+18.7%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border/50 bg-gradient-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-primary mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/admin/referrals")} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Referrals
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={handleRefreshSearchIndex} variant="outline" disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Search Index
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>Product Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Product management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Review moderation interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Search Index</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Refresh the search index to include new content and improve search performance.
                    </p>
                    <Button 
                      onClick={handleRefreshSearchIndex} 
                      disabled={isRefreshing}
                      className="w-full"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh Search Index'}
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Search Statistics</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Total indexed items: Loading...</p>
                      <p>Last updated: Loading...</p>
                      <p>Search performance: Good</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Audit log interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
