import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Buyer",
      price: "Free",
      period: "Forever",
      description: "For individuals looking to purchase digital products",
      features: [
        { name: "Browse unlimited products", included: true },
        { name: "Secure checkout", included: true },
        { name: "Instant downloads", included: true },
        { name: "Purchase history", included: true },
        { name: "Wishlist & favorites", included: true },
        { name: "Customer support", included: true },
        { name: "Money-back guarantee", included: true },
        { name: "Multiple payment methods", included: true }
      ],
      cta: "Start Browsing",
      popular: false
    },
    {
      name: "Seller",
      price: "10%",
      period: "Per Sale",
      description: "For creators selling digital products",
      features: [
        { name: "List unlimited products", included: true },
        { name: "10% platform fee only", included: true },
        { name: "Stripe processing (2.9% + $0.30)", included: true },
        { name: "No monthly fees", included: true },
        { name: "Automated payouts", included: true },
        { name: "Sales analytics", included: true },
        { name: "Customer messaging", included: true },
        { name: "Refund management", included: true },
        { name: "Custom pricing options", included: true },
        { name: "Discount code support", included: true },
        { name: "Priority support", included: true }
      ],
      cta: "Start Selling",
      popular: true
    }
  ];

  const comparison = [
    { feature: "Browse Products", buyer: true, seller: true },
    { feature: "Purchase Products", buyer: true, seller: true },
    { feature: "List Products", buyer: false, seller: true },
    { feature: "Platform Fee", buyer: "N/A", seller: "10% per sale" },
    { feature: "Monthly Fee", buyer: "$0", seller: "$0" },
    { feature: "Automated Payouts", buyer: false, seller: true },
    { feature: "Analytics Dashboard", buyer: false, seller: true },
    { feature: "Customer Messaging", buyer: true, seller: true },
    { feature: "Priority Support", buyer: false, seller: true }
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            No hidden fees. No surprises. Pay only when you sell.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border-border/50 bg-gradient-card relative ${
                plan.popular ? 'border-primary lg:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:opacity-90 transition-opacity' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => navigate(plan.name === "Seller" ? "/sell" : "/marketplace")}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Detailed Comparison
          </h2>
          <Card className="border-border/50 bg-gradient-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Buyer</th>
                    <th className="text-center p-4 font-semibold">Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr key={index} className="border-t border-border/40">
                      <td className="p-4 text-sm">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.buyer === 'boolean' ? (
                          row.buyer ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.buyer}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.seller === 'boolean' ? (
                          row.seller ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.seller}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Are there any monthly fees?",
                a: "No! We don't charge any monthly subscription fees. Buyers use the platform completely free. Sellers only pay a 10% commission when they make a sale."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and various local payment methods through Stripe. The specific options available depend on your location."
              },
              {
                q: "How do payouts work for sellers?",
                a: "Payouts are processed automatically through Stripe Connect. Funds are typically transferred to your bank account within 2-7 business days after a sale."
              },
              {
                q: "Can I get a refund?",
                a: "Refund policies are set by individual sellers. We encourage sellers to offer fair refund policies and provide mediation services in case of disputes."
              },
              {
                q: "Is there a limit on products I can sell?",
                a: "No! Sellers can list unlimited products on our platform. There are no restrictions on the number of listings."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-border/50 bg-gradient-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-border/50 bg-gradient-primary text-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
              Join thousands of creators and buyers on our platform
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
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
