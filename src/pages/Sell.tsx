import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Zap, DollarSign, Users, Clock, ArrowLeft } from "lucide-react";
import { BecomeSellerDialog } from "@/components/BecomeSellerDialog";
import { useNavigate } from "react-router-dom";

const Sell = () => {
  const navigate = useNavigate();
  const [showBecomeSellerDialog, setShowBecomeSellerDialog] = useState(false);
  
  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Commission",
      description: "Only 10% platform fee + Stripe processing fees",
    },
    {
      icon: Users,
      title: "Global Reach",
      description: "Access to thousands of potential buyers worldwide",
    },
    {
      icon: Zap,
      title: "Easy Setup",
      description: "List your products in minutes with our simple tools",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Stripe-powered payments with automatic payouts",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your sales, views, and revenue in real-time",
    },
    {
      icon: Clock,
      title: "No Subscriptions",
      description: "Pay only when you make a sale, no monthly fees",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4 sm:py-16">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-primary text-primary-foreground">For Creators</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Start Selling Your Digital Products Today
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Join our marketplace and reach thousands of buyers. Simple setup, fair pricing, instant payouts.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow w-full sm:w-auto"
            onClick={() => setShowBecomeSellerDialog(true)}
          >
            Become a Seller
          </Button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-border/50 bg-gradient-card">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Register as a Seller",
                description: "Create your seller account and complete the verification process through Stripe Connect.",
              },
              {
                step: "02",
                title: "List Your Products",
                description: "Upload your digital products, set prices, add descriptions and preview images.",
              },
              {
                step: "03",
                title: "Get Verified",
                description: "Complete KYC verification to ensure secure transactions and build buyer trust.",
              },
              {
                step: "04",
                title: "Start Earning",
                description: "When buyers purchase your products, you'll receive automatic payouts via Stripe Connect.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-border/50 bg-gradient-primary text-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
              Join our community of creators and start earning from your digital products
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
              onClick={() => setShowBecomeSellerDialog(true)}
            >
              Register Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
      <BecomeSellerDialog open={showBecomeSellerDialog} onOpenChange={setShowBecomeSellerDialog} />
    </div>
  );
};

export default Sell;
