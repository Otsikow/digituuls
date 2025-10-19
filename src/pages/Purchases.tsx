import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Download, Calendar, CreditCard, Package, FileText } from "lucide-react";

const Purchases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Mock purchase data - replace with actual data from backend
  const purchases = [
    {
      id: "1",
      productName: "AI Content Generator Pro",
      productImage: "/placeholder.svg",
      price: 49.99,
      date: "2025-03-15",
      status: "completed",
      downloadUrl: "#",
      invoiceUrl: "#",
    },
    {
      id: "2",
      productName: "Social Media Toolkit",
      productImage: "/placeholder.svg",
      price: 29.99,
      date: "2025-03-10",
      status: "completed",
      downloadUrl: "#",
      invoiceUrl: "#",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">My Purchases</h1>
            <p className="text-muted-foreground">
              View and manage your purchase history
            </p>
          </div>

          {/* Purchase Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription>Total Purchases</CardDescription>
                <CardTitle className="text-3xl">{purchases.length}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription>Total Spent</CardDescription>
                <CardTitle className="text-3xl">
                  ${purchases.reduce((acc, p) => acc + p.price, 0).toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription>Active Downloads</CardDescription>
                <CardTitle className="text-3xl">{purchases.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Purchases List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Purchase History</h2>
            
            {purchases.length === 0 ? (
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start exploring our marketplace to find amazing digital products
                  </p>
                  <Button
                    onClick={() => navigate("/marketplace")}
                    className="bg-gradient-primary"
                  >
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="w-full md:w-32 h-32 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {purchase.productName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(purchase.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="h-4 w-4" />
                                  ${purchase.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {purchase.status}
                            </Badge>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="default"
                              className="bg-gradient-primary"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => navigate("/contact")}
                            >
                              Get Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Purchases;
