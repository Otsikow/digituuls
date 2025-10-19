import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SellerTerms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Seller Eligibility",
      content: "To become a seller on our platform, you must: be at least 18 years old, have a valid Stripe Connect account, provide accurate business/personal information, comply with all applicable laws and regulations in your jurisdiction, and agree to these Seller Terms."
    },
    {
      title: "2. Product Listings",
      content: "As a seller, you agree to: provide accurate product descriptions, include clear preview images or demos, specify correct pricing and licensing terms, deliver products as described, maintain product quality standards, and update listings to reflect any changes. All products must be digital goods that you have the right to sell."
    },
    {
      title: "3. Fees and Payments",
      content: "Platform Fee: We charge a 10% commission on each sale. Payment Processing: Stripe charges standard processing fees (2.9% + $0.30 per transaction). Payouts: Funds are transferred to your Stripe Connect account automatically. Payout Schedule: Payouts occur on a rolling basis, typically within 2-7 business days. Tax Responsibility: You are responsible for all applicable taxes on your earnings."
    },
    {
      title: "4. Intellectual Property",
      content: "You represent and warrant that: you own or have the right to sell all products you list, your products do not infringe on any third-party intellectual property rights, you have all necessary licenses and permissions. You grant us a non-exclusive license to display, promote, and distribute your products on our platform."
    },
    {
      title: "5. Product Quality Standards",
      content: "All products must: be free of malware, viruses, or malicious code, function as described, meet industry quality standards, include appropriate documentation or instructions, and comply with applicable laws. We reserve the right to remove products that don't meet our standards."
    },
    {
      title: "6. Seller Responsibilities",
      content: "You agree to: respond to buyer inquiries within 48 hours, provide customer support for your products, honor the terms of your stated license, process legitimate refund requests, maintain accurate contact information, and notify us of any issues with your listings."
    },
    {
      title: "7. Prohibited Products",
      content: "You may not sell: stolen or pirated content, products that infringe on intellectual property, illegal or harmful content, products containing malware or viruses, adult content (unless explicitly permitted), weapons or dangerous items, personal information or data, or anything that violates our terms or applicable laws."
    },
    {
      title: "8. Refunds and Chargebacks",
      content: "Refund Policy: You may set your own refund policy, but it must be fair and clearly stated. Chargeback Responsibility: Sellers are responsible for chargebacks and may be charged associated fees. Dispute Resolution: We provide mediation services for buyer-seller disputes. Final Decision: We reserve the right to issue refunds at our discretion."
    },
    {
      title: "9. Account Suspension and Termination",
      content: "We may suspend or terminate your seller account if you: violate these terms, engage in fraudulent activity, receive excessive complaints, fail to respond to buyers, provide poor quality products, or violate applicable laws. Upon termination, pending payouts may be held for 90 days to cover potential refunds or chargebacks."
    },
    {
      title: "10. Marketing and Promotion",
      content: "You grant us permission to: use your product names, descriptions, and images in marketing materials, feature your products in newsletters and promotions, display your seller profile publicly. You may opt-out of certain promotional activities by contacting support."
    },
    {
      title: "11. Data and Analytics",
      content: "We provide sellers with: sales analytics and reports, customer insights (anonymized), product performance metrics. You agree not to: scrape or collect buyer data beyond what's provided, use buyer information for unauthorized purposes, or share buyer data with third parties."
    },
    {
      title: "12. Indemnification",
      content: "You agree to indemnify and hold harmless the platform, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from: your products, your violation of these terms, infringement of third-party rights, or your use of the platform."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4 sm:py-16 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Seller Terms & Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 19, 2025
          </p>
        </div>

        <Card className="border-border/50 bg-gradient-card mb-8">
          <CardContent className="p-6 sm:p-8">
            <p className="text-muted-foreground leading-relaxed mb-8">
              These Seller Terms govern your use of our platform as a seller. By registering as a seller, 
              you agree to comply with these terms in addition to our general Terms of Service.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-card">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-3">Seller Support</h2>
            <p className="text-muted-foreground mb-4">
              For seller-specific questions or support, please contact:
            </p>
            <p className="text-muted-foreground">
              Email: sellers@marketplace.com<br />
              Seller Support: Available 9am-5pm EST, Monday-Friday<br />
              Address: 123 Digital Street, Tech City, TC 12345
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SellerTerms;
