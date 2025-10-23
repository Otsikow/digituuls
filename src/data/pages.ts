export type AppPage = {
  id: string;
  title: string;
  path: string;
  description: string;
  tags?: string[];
};

export const appPages: AppPage[] = [
  { id: "home", title: "Home", path: "/", description: "Discover, launch, and scale with premium digital tools" },
  { id: "marketplace", title: "Marketplace", path: "/marketplace", description: "Browse premium digital products and tools" },
  { id: "tools", title: "Community Tools", path: "/tools", description: "Discover and share the best tools" },
  { id: "toolkits", title: "Toolkits", path: "/toolkits", description: "Curated collections for specific use cases" },
  { id: "features", title: "Features", path: "/features", description: "Platform features for buyers and sellers" },
  { id: "pricing", title: "Pricing", path: "/pricing", description: "Simple pricing to get started" },
  { id: "sell", title: "Sell", path: "/sell", description: "Start selling your digital products" },
  { id: "about", title: "About", path: "/about", description: "Learn more about DigiTuuls" },
  { id: "contact", title: "Contact", path: "/contact", description: "Get in touch with our team" },
  { id: "terms", title: "Terms of Service", path: "/terms", description: "Legal terms of using the platform" },
  { id: "privacy", title: "Privacy Policy", path: "/privacy", description: "How we handle your data" },
  { id: "seller-terms", title: "Seller Terms", path: "/seller-terms", description: "Agreements for sellers" },
  { id: "auth", title: "Sign In / Up", path: "/auth", description: "Create an account or sign in" },
  { id: "profile", title: "Profile", path: "/profile", description: "Manage your profile" },
  { id: "purchases", title: "Purchases", path: "/purchases", description: "View your purchase history" },
  { id: "saved", title: "Saved", path: "/saved", description: "Your wishlist and favorites" },
  { id: "referrals", title: "Referrals", path: "/referrals", description: "Referral program and earnings" },
];
