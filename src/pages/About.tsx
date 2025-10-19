import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Target, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in empowering creators and fostering a supportive community."
    },
    {
      icon: Target,
      title: "Quality Over Quantity",
      description: "Every product is carefully reviewed to maintain high marketplace standards."
    },
    {
      icon: Heart,
      title: "Fair Pricing",
      description: "Transparent pricing with only 10% platform fee and no hidden costs."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Constantly evolving to provide the best tools and features for our users."
    }
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

        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            About Our Marketplace
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            We're building the world's most trusted platform for digital creators to buy, sell, and discover amazing tools and resources.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="border-border/50 bg-gradient-card mb-12 sm:mb-16">
          <CardContent className="p-6 sm:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                To democratize access to digital tools and empower creators worldwide by providing a secure, 
                transparent marketplace where innovation thrives and everyone can benefit from quality digital products.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-border/50 bg-gradient-card">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Founded in 2024, our marketplace was born from a simple observation: creators needed a better way 
              to monetize their digital products, and buyers needed a trusted platform to discover quality tools.
            </p>
            <p>
              What started as a small community has grown into a thriving ecosystem where thousands of creators 
              share their work with millions of users worldwide. We've processed millions in transactions while 
              maintaining our commitment to fair pricing and exceptional quality.
            </p>
            <p>
              Today, we continue to innovate and expand, always keeping our community at the heart of everything we do. 
              Our platform isn't just about transactions—it's about empowering creators to build sustainable businesses 
              and helping users discover the tools they need to succeed.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[
            { number: "10K+", label: "Products" },
            { number: "50K+", label: "Users" },
            { number: "5K+", label: "Creators" },
            { number: "$5M+", label: "Paid Out" }
          ].map((stat, index) => (
            <Card key={index} className="border-border/50 bg-gradient-card">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="border-border/50 bg-gradient-primary text-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
              Whether you're a creator or a buyer, there's a place for you here
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/sell")}
              >
                Start Selling
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/marketplace")}
              >
                Browse Marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default About;
