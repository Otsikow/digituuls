import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  validateReferralCode,
  trackReferralVisit,
} from "@/lib/referralUtils";

// Lightweight cookie helper for fallback tracking
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function ReferralLanding() {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState<{
    isValid: boolean;
    referrerId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processReferral = async () => {
      if (!referralCode) {
        navigate("/", { replace: true });
        return;
      }

      try {
        setCookie("ref_code", referralCode, 30);

        const data = await validateReferralCode(referralCode);
        setReferralData(data);

        if (data.isValid) {
          // Track visit in both Supabase and local analytics
          await trackReferralVisit(referralCode);
          await supabase
            .from("referral_clicks")
            .insert({ code: referralCode, user_agent: navigator.userAgent });
        }
      } catch {
        // Ignore silent failures
      } finally {
        setLoading(false);
      }
    };

    processReferral();
  }, [referralCode, navigate]);

  const handleGetStarted = () => {
    if (referralCode) {
      localStorage.setItem("digituuls_referral", referralCode);
    }
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!referralData?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">
              Invalid Referral Link
            </CardTitle>
            <CardDescription>
              This referral link is not valid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Users className="w-4 h-4 mr-2" />
              You've been invited to DigiTuuls
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Join the Creator Economy
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover, create, and sell digital products. Start earning from
              your creativity today.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Earn Money</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sell your digital products and keep 90% of your earnings. No
                  hidden fees.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Grow Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access tools, templates, and resources to scale your digital
                  business.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Join Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with thousands of creators and entrepreneurs
                  worldwide.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    "Unlimited product uploads",
                    "Built-in payment processing",
                    "Analytics dashboard",
                    "Customer support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[
                    "SEO optimization",
                    "Mobile responsive",
                    "Secure hosting",
                    "Referral program",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-lg">
                  Join thousands of creators already earning on DigiTuuls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full text-lg py-6"
                  onClick={handleGetStarted}
                >
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500">
                  Free to join • No credit card required • Start selling
                  immediately
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              You were invited by a DigiTuuls creator. When you make your first
              sale, they'll earn a commission as a thank you for bringing you to
              the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
