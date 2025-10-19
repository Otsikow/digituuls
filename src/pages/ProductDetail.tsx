import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Shield, Download, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProductDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <span>/</span>
          <span className="text-foreground">SaaS Starter Kit Pro</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Image */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-secondary">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary text-primary-foreground">New</Badge>
                <Badge variant="outline">SaaS Projects</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">SaaS Starter Kit Pro</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Complete Next.js boilerplate with authentication, payments, and database setup
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="font-semibold">4.9</span>
                  <span className="text-muted-foreground">(127 reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>234 purchases</span>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">About This Product</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Save weeks of development time with this production-ready SaaS starter kit. Built with Next.js 14, 
                  TypeScript, and modern best practices. Includes everything you need to launch your SaaS product quickly.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This comprehensive boilerplate includes user authentication (email/password and OAuth), 
                  Stripe payment integration, role-based access control, responsive design, and a complete admin dashboard.
                </p>
              </div>

              {/* Features */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Complete authentication system",
                    "Stripe payment integration",
                    "Admin dashboard",
                    "Role-based permissions",
                    "Responsive design",
                    "Database setup with Prisma",
                    "Email templates",
                    "Documentation & guides",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50 bg-gradient-card">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold mb-1">$149</div>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>

                <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
                  Buy Now
                </Button>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Instant Access</p>
                      <p className="text-xs text-muted-foreground">Download immediately</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Verified Seller</p>
                      <p className="text-xs text-muted-foreground">KYC verified creator</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Lifetime Access</p>
                      <p className="text-xs text-muted-foreground">Free updates included</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">About the Creator</h4>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">John Developer</p>
                      <p className="text-xs text-muted-foreground">12 products • 4.9★</p>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-secondary">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
