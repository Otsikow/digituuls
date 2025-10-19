import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Shield, CreditCard, TrendingUp, Search, 
  FileText, Bell, Star, Lock, Zap, Users, CheckCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Stripe-powered payment processing with buyer protection and secure transactions.",
      category: "Security"
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find exactly what you need with powerful filters and smart search algorithms.",
      category: "Discovery"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track sales, views, and revenue in real-time with detailed insights.",
      category: "Sellers"
    },
    {
      icon: FileText,
      title: "Digital Delivery",
      description: "Instant file delivery upon purchase with secure download links.",
      category: "Delivery"
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Stay updated with instant notifications for sales, messages, and updates.",
      category: "Communication"
    },
    {
      icon: Star,
      title: "Review System",
      description: "Build trust with verified reviews and ratings from real buyers.",
      category: "Community"
    },
    {
      icon: Lock,
      title: "Secure File Storage",
      description: "Cloud-based storage with encryption for all your digital products.",
      category: "Security"
    },
    {
      icon: CreditCard,
      title: "Automated Payouts",
      description: "Receive automatic payouts via Stripe Connect on your schedule.",
      category: "Sellers"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Start selling in minutes with our streamlined onboarding process.",
      category: "Sellers"
    },
    {
      icon: Users,
      title: "Community Tools",
      description: "Discover and share tools with a vibrant community of creators.",
      category: "Community"
    },
    {
      icon: CheckCircle,
      title: "Quality Assurance",
      description: "Every product is reviewed to ensure high quality and authenticity.",
      category: "Trust"
    },
    {
      icon: FileText,
      title: "License Management",
      description: "Clear licensing terms and automated license delivery.",
      category: "Legal"
    }
  ];

  const sellerFeatures = [
    "10% platform fee only",
    "No monthly subscriptions",
    "Instant product uploads",
    "Custom pricing options",
    "Discount code support",
    "Sales analytics",
    "Customer messaging",
    "Refund management"
  ];

  const buyerFeatures = [
    "Secure checkout",
    "Instant downloads",
    "Purchase history",
    "Wishlist & favorites",
    "Review products",
    "24/7 support",
    "Money-back guarantee",
    "Multiple payment methods"
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
          <Badge className="mb-4 bg-primary text-primary-foreground">Features</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Everything You Need to Succeed
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Powerful features designed for creators and buyers alike
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-gradient-card hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {feature.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Sellers & Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 sm:mb-16">
          <Card className="border-border/50 bg-gradient-card">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-6">For Sellers</h3>
              <div className="space-y-3">
                {sellerFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate("/sell")}
              >
                Start Selling
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-card">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-6">For Buyers</h3>
              <div className="space-y-3">
                {buyerFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate("/marketplace")}
              >
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-border/50 bg-gradient-primary text-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
              Join thousands of creators and buyers on our platform
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/auth")}
            >
              Sign Up Free
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
