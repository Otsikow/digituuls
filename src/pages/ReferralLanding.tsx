import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Users, Zap } from "lucide-react";
import { toast } from "sonner";

const ReferralLanding = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [validCode, setValidCode] = useState(false);

  useEffect(() => {
    if (code) {
      trackReferralClick();
      validateReferralCode();
    }
  }, [code]);

  const validateReferralCode = async () => {
    if (!code) return;

    try {
      const { data: referralData, error } = await supabase
        .from("referrals")
        .select(`
          referrer_id,
          profiles!referrals_referrer_id_fkey (
            display_name,
            username
          )
        `)
        .eq("referral_code", code)
        .eq("is_active", true)
        .single();

      if (error || !referralData) {
        setValidCode(false);
        toast.error("Invalid referral link");
      } else {
        setValidCode(true);
        const profile = referralData.profiles as any;
        setReferrerName(profile?.display_name || profile?.username || "A friend");
        
        // Store referral code in sessionStorage for signup
        sessionStorage.setItem("referral_code", code);
        sessionStorage.setItem("referrer_id", referralData.referrer_id);
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      setValidCode(false);
    } finally {
      setLoading(false);
    }
  };

  const trackReferralClick = async () => {
    if (!code) return;

    try {
      // Get referrer_id from referral code
      const { data: referralData } = await supabase
        .from("referrals")
        .select("referrer_id")
        .eq("referral_code", code)
        .single();

      if (!referralData) return;

      // Track the click
      await supabase.from("referral_clicks").insert({
        referral_code: code,
        referrer_id: referralData.referrer_id,
        landing_page: window.location.href,
        referrer_url: document.referrer,
      });
    } catch (error) {
      console.error("Error tracking referral click:", error);
    }
  };

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!validCode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Invalid Referral Link</CardTitle>
              <CardDescription>
                This referral link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} className="w-full">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              You've been invited by {referrerName}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Join DigiTuuls &{" "}
              <span className="text-gradient-primary">
                Start Earning Today
              </span>
            </h1>

            <p className="text-xl text-muted-foreground">
              The marketplace for digital products, tools, and creator resources.
              Sell your digital creations and keep 90% of every sale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-primary text-lg px-8"
                onClick={handleSignUp}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => navigate("/")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-gradient-card text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Keep 90% Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We only charge 10% - one of the lowest fees in the industry. You
                  keep the rest.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-card text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  List your products in minutes. No complicated setup or technical
                  knowledge required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-card text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Growing Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join thousands of creators selling digital products, tools, and
                  resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose DigiTuuls?</h2>
            <p className="text-muted-foreground">
              Everything you need to succeed as a digital creator
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Instant payouts via Stripe Connect",
              "Beautiful product pages",
              "Built-in analytics dashboard",
              "Secure file delivery",
              "Customizable licensing",
              "Email support included",
              "SEO-optimized listings",
              "Mobile-responsive storefront",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join {referrerName} and thousands of other creators on DigiTuuls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="bg-gradient-primary text-lg px-12"
                onClick={handleSignUp}
              >
                Create Your Free Account
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • Start selling in minutes
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReferralLanding;
