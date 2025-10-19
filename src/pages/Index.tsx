import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { Search, Sparkles, Shield, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  const featuredProducts = [
    {
      id: "1",
      title: "SaaS Starter Kit Pro",
      subtitle: "Complete Next.js boilerplate with auth & payments",
      price: 14900,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      rating: 4.9,
      reviewCount: 127,
      isNew: true,
      category: "SaaS Projects",
    },
    {
      id: "2",
      title: "AI Content Generator",
      subtitle: "GPT-powered content creation tool with templates",
      price: 4900,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      rating: 4.8,
      reviewCount: 89,
      isBestSeller: true,
      category: "AI Tools",
    },
    {
      id: "3",
      title: "Design System Library",
      subtitle: "200+ components for Figma & React",
      price: 7900,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      rating: 5.0,
      reviewCount: 234,
      isBestSeller: true,
      category: "Design Assets",
    },
    {
      id: "4",
      title: "Marketing Automation Suite",
      subtitle: "Email campaigns & analytics dashboard",
      price: 9900,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      rating: 4.7,
      reviewCount: 156,
      category: "Marketing",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Sellers",
      description: "All sellers go through KYC verification for your security",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Download your purchases immediately after checkout",
    },
    {
      icon: TrendingUp,
      title: "Quality Products",
      description: "Curated marketplace with only the best digital tools",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="flex justify-center mb-8">
              <img src={logo} alt="DigiTuuls" className="h-40 w-auto md:h-56 animate-in fade-in zoom-in duration-700" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Professional Digital Marketplace</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Premium Digital Tools & SaaS Projects
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Buy and sell high-quality digital products, templates, and complete SaaS applications
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for tools, templates, projects..."
                  className="pl-12 h-14 bg-secondary/50 border-border/50 focus-visible:ring-primary text-base"
                />
              </div>
              <Link to="/marketplace">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow h-14 px-8">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:shadow-elegant transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked tools and projects from top creators</p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" className="border-border/50 hover:bg-secondary">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaC0ydi0yaDJ6bS0yLTR2Mmh5di0yaC0yem0yIDBodjJoLTJ2LTJoMnptMiAwdjJoMnYtMmgtMnptMCAydjJoLTJ2LTJoMnptMi0ydjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative max-w-2xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Sell Your Product?
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of creators earning from their digital products. We handle payments, verification, and customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sell">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 h-12 px-8">
                  Start Selling
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
