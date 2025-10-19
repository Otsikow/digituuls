import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BecomeSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BecomeSellerDialog = ({ open, onOpenChange }: BecomeSellerDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to become a seller.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is already a seller
      const { data: existingSeller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingSeller) {
        toast({
          title: "Already a seller",
          description: "You're already registered as a seller!",
        });
        onOpenChange(false);
        return;
      }

      // Create seller profile
      const { error } = await supabase.from("sellers").insert({
        user_id: user.id,
        kyc_status: "required",
        payout_enabled: false,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Welcome to the seller community! Complete KYC to start selling.",
      });

      onOpenChange(false);
      // Could navigate to seller dashboard
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Reach thousands of potential buyers worldwide",
    "Simple 10% platform fee",
    "Secure payments via Stripe",
    "Real-time analytics dashboard",
    "Automated payouts",
    "No monthly fees",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Become a Seller</DialogTitle>
          <DialogDescription>
            Join our marketplace and start selling your digital products today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Seller Benefits</h3>
            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-lg mb-3">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Register as a Seller</p>
                  <p className="text-xs text-muted-foreground">Create your seller account</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Complete KYC Verification</p>
                  <p className="text-xs text-muted-foreground">Verify your identity via Stripe Connect</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Selling</p>
                  <p className="text-xs text-muted-foreground">List your products and start earning</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/seller-agreement" className="text-primary hover:underline">
                  Seller Agreement
                </a>
              </Label>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !agreedToTerms}
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Become a Seller
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Label = ({ htmlFor, className, children }: any) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);
