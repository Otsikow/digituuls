import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, including: account information (name, email, password), profile information, payment information (processed securely through Stripe), transaction history, communications with us and other users, and any other information you choose to provide."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to: provide, maintain, and improve our services, process transactions and send related information, send technical notices, updates, security alerts, and support messages, respond to your comments and questions, communicate with you about products, services, and events, monitor and analyze trends and usage, detect and prevent fraud and abuse, personalize and improve your experience."
    },
    {
      title: "3. Information Sharing",
      content: "We may share your information with: service providers who perform services on our behalf, sellers when you make a purchase, other users as necessary to provide our services, law enforcement when required by law, with your consent or at your direction, in connection with a business transfer or acquisition."
    },
    {
      title: "4. Data Security",
      content: "We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no internet or email transmission is ever fully secure or error-free. All payment information is handled by Stripe and we do not store complete payment card information on our servers."
    },
    {
      title: "5. Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings, but disabling cookies may limit your use of certain features. We use cookies for: authentication, security, preferences, analytics, and advertising."
    },
    {
      title: "6. Third-Party Services",
      content: "Our service may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We use the following third-party services: Stripe for payment processing, Google Analytics for usage analytics, and various cloud service providers for data storage."
    },
    {
      title: "7. Your Rights and Choices",
      content: "You have the right to: access your personal information, correct inaccurate information, request deletion of your information, opt-out of marketing communications, disable cookies through your browser settings. To exercise these rights, please contact us at privacy@marketplace.com."
    },
    {
      title: "8. Data Retention",
      content: "We retain your information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes. When you delete your account, we will delete or anonymize your information within 90 days, except as required by law."
    },
    {
      title: "9. Children's Privacy",
      content: "Our service is not directed to children under 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately."
    },
    {
      title: "10. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws. By using our service, you consent to such transfers."
    },
    {
      title: "11. California Privacy Rights",
      content: "If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to: know what personal information we collect, delete your personal information, opt-out of the sale of your personal information. Note: We do not sell personal information."
    },
    {
      title: "12. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. We encourage you to review this Privacy Policy periodically."
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 19, 2025
          </p>
        </div>

        <Card className="border-border/50 bg-gradient-card mb-8">
          <CardContent className="p-6 sm:p-8">
            <p className="text-muted-foreground leading-relaxed mb-8">
              This Privacy Policy describes how we collect, use, and share your personal information 
              when you use our marketplace. By using our service, you agree to the collection and use 
              of information in accordance with this policy.
            </p>

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
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: privacy@marketplace.com<br />
              Data Protection Officer: dpo@marketplace.com<br />
              Address: 123 Digital Street, Tech City, TC 12345
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
