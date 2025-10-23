import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import ReferralLanding from "./pages/ReferralLanding";
import ReferralAccount from "./pages/ReferralAccount";
import AdminReferrals from "./pages/AdminReferrals";
import Sell from "./pages/Sell";
import Admin from "./pages/Admin";
import Tools from "./pages/Tools";
import Toolkits from "./pages/Toolkits";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SellerTerms from "./pages/SellerTerms";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Purchases from "./pages/Purchases";
import Saved from "./pages/Saved";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/toolkits" element={<Toolkits />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/seller-terms" element={<SellerTerms />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/ref/:code" element={<ReferralLanding />} />
          <Route path="/account/referrals" element={<ReferralAccount />} />
          <Route path="/admin/referrals" element={<AdminReferrals />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
