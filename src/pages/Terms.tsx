import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using this marketplace, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials on our marketplace for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, use the materials for any commercial purpose or public display, attempt to reverse engineer any software contained on our marketplace, remove any copyright or other proprietary notations from the materials, or transfer the materials to another person or 'mirror' the materials on any other server."
    },
    {
      title: "3. Account Terms",
      content: "You must be 18 years or older to use this service. You must be a human. Accounts registered by 'bots' or other automated methods are not permitted. You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account."
    },
    {
      title: "4. Payment Terms",
      content: "All payments are processed through Stripe. By making a purchase, you agree to pay all fees and charges incurred in connection with your account at the prices in effect when such fees and charges are incurred. All sales are final unless otherwise stated. We reserve the right to refuse or cancel any order for any reason."
    },
    {
      title: "5. Seller Terms",
      content: "As a seller, you agree to: provide accurate product information, deliver digital products as described, respond to buyer inquiries in a timely manner, comply with all applicable laws and regulations, and grant buyers the appropriate usage rights. We reserve the right to remove any products that violate our policies or applicable laws."
    },
    {
      title: "6. Intellectual Property",
      content: "Sellers retain ownership of their intellectual property. By listing products, sellers grant us a license to display, promote, and distribute their products on our platform. Buyers receive the usage rights as specified in each product's license terms."
    },
    {
      title: "7. Prohibited Uses",
      content: "You may not use our platform to: upload malicious code or viruses, infringe on intellectual property rights, engage in fraudulent activity, harass or harm another person, spam or send unsolicited messages, violate any applicable laws or regulations, or attempt to gain unauthorized access to our systems."
    },
    {
      title: "8. Refunds and Disputes",
      content: "Refund policies are determined by individual sellers unless otherwise stated. In case of disputes, we provide mediation services to help resolve issues between buyers and sellers. We reserve the right to make final decisions in disputes."
    },
    {
      title: "9. Limitation of Liability",
      content: "In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our marketplace, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage."
    },
    {
      title: "10. Modifications",
      content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 19, 2025
          </p>
        </div>

        <Card className="border-border/50 bg-gradient-card mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-card">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: legal@marketplace.com<br />
              Address: 123 Digital Street, Tech City, TC 12345
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
