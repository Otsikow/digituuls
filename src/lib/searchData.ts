// Centralized search data for the entire application
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  keywords?: string[];
  metadata?: Record<string, any>;
}

export const productsData: SearchResult[] = [
  {
    id: "product-1",
    title: "SaaS Starter Kit Pro",
    description: "Complete Next.js boilerplate with auth & payments",
    category: "Products",
    url: "/product/1",
    keywords: ["saas", "nextjs", "boilerplate", "authentication", "payments", "starter"],
    metadata: { price: 14900, rating: 4.9, isNew: true }
  },
  {
    id: "product-2",
    title: "AI Content Generator",
    description: "GPT-powered content creation tool with templates",
    category: "Products",
    url: "/product/2",
    keywords: ["ai", "gpt", "content", "generator", "writing", "templates"],
    metadata: { price: 4900, rating: 4.8, isBestSeller: true }
  },
  {
    id: "product-3",
    title: "Design System Library",
    description: "200+ components for Figma & React",
    category: "Products",
    url: "/product/3",
    keywords: ["design", "system", "components", "figma", "react", "ui"],
    metadata: { price: 7900, rating: 5.0, isBestSeller: true }
  },
  {
    id: "product-4",
    title: "Marketing Automation Suite",
    description: "Email campaigns & analytics dashboard",
    category: "Products",
    url: "/product/4",
    keywords: ["marketing", "automation", "email", "campaigns", "analytics"],
    metadata: { price: 9900, rating: 4.7 }
  },
  {
    id: "product-5",
    title: "E-commerce Template Bundle",
    description: "Modern store templates with checkout flow",
    category: "Products",
    url: "/product/5",
    keywords: ["ecommerce", "store", "templates", "checkout", "shopping"],
    metadata: { price: 5900, rating: 4.6 }
  },
  {
    id: "product-6",
    title: "Analytics Dashboard Kit",
    description: "Beautiful charts and data visualization components",
    category: "Products",
    url: "/product/6",
    keywords: ["analytics", "dashboard", "charts", "visualization", "data"],
    metadata: { price: 3900, rating: 4.9 }
  }
];

export const toolsData: SearchResult[] = [
  {
    id: "tool-1",
    title: "Notion",
    description: "All-in-one workspace for notes, docs, and collaboration",
    category: "Tools",
    url: "/tools#notion",
    keywords: ["notes", "docs", "collaboration", "workspace", "productivity"]
  },
  {
    id: "tool-2",
    title: "Figma",
    description: "Collaborative interface design tool",
    category: "Tools",
    url: "/tools#figma",
    keywords: ["design", "ui", "ux", "prototyping", "interface", "collaborative"]
  },
  {
    id: "tool-3",
    title: "ChatGPT",
    description: "Advanced AI language model for conversations and content",
    category: "Tools",
    url: "/tools#chatgpt",
    keywords: ["ai", "chatbot", "writing", "language", "model", "gpt"]
  },
  {
    id: "tool-4",
    title: "VS Code",
    description: "Powerful, lightweight code editor",
    category: "Tools",
    url: "/tools#vscode",
    keywords: ["code", "editor", "ide", "development", "programming"]
  },
  {
    id: "tool-5",
    title: "Stripe",
    description: "Payment processing platform for the internet",
    category: "Tools",
    url: "/tools#stripe",
    keywords: ["payments", "api", "saas", "processing", "checkout"]
  },
  {
    id: "tool-6",
    title: "Supabase",
    description: "Open source Firebase alternative",
    category: "Tools",
    url: "/tools#supabase",
    keywords: ["database", "backend", "auth", "firebase", "postgres"]
  }
];

export const toolkitsData: SearchResult[] = [
  {
    id: "toolkit-1",
    title: "Startup Launch Kit",
    description: "Everything you need to launch your startup in 30 days",
    category: "Toolkits",
    url: "/toolkits#startup-launch-kit",
    keywords: ["startup", "launch", "marketing", "mvp"]
  },
  {
    id: "toolkit-2",
    title: "Full-Stack Developer Toolkit",
    description: "Complete toolset for modern full-stack development",
    category: "Toolkits",
    url: "/toolkits#fullstack-dev-toolkit",
    keywords: ["development", "fullstack", "devops", "programming"]
  },
  {
    id: "toolkit-3",
    title: "Designer's Arsenal",
    description: "Curated design tools for UI/UX professionals",
    category: "Toolkits",
    url: "/toolkits#designers-arsenal",
    keywords: ["design", "ui", "ux", "creative", "tools"]
  },
  {
    id: "toolkit-4",
    title: "AI Content Creator Bundle",
    description: "AI-powered tools for content creation and automation",
    category: "Toolkits",
    url: "/toolkits#ai-content-creator",
    keywords: ["ai", "content", "automation", "writing"]
  },
  {
    id: "toolkit-5",
    title: "Marketing Growth Stack",
    description: "Tools to scale your marketing and grow your audience",
    category: "Toolkits",
    url: "/toolkits#marketing-growth-stack",
    keywords: ["marketing", "growth", "analytics", "audience"]
  },
  {
    id: "toolkit-6",
    title: "Remote Work Essentials",
    description: "Everything for productive remote and async work",
    category: "Toolkits",
    url: "/toolkits#remote-work-essentials",
    keywords: ["productivity", "remote", "collaboration", "async"]
  }
];

export const pagesData: SearchResult[] = [
  {
    id: "page-home",
    title: "Home",
    description: "Discover, launch, and scale with premium digital tools",
    category: "Pages",
    url: "/",
    keywords: ["home", "marketplace", "digital", "tools", "products"]
  },
  {
    id: "page-marketplace",
    title: "Marketplace",
    description: "Browse premium digital products and tools",
    category: "Pages",
    url: "/marketplace",
    keywords: ["marketplace", "products", "buy", "digital", "shop"]
  },
  {
    id: "page-tools",
    title: "Tools Directory",
    description: "Discover and share the best tools for creators and developers",
    category: "Pages",
    url: "/tools",
    keywords: ["tools", "directory", "community", "resources"]
  },
  {
    id: "page-toolkits",
    title: "Curated Toolkits",
    description: "Hand-picked collections of tools for specific use cases",
    category: "Pages",
    url: "/toolkits",
    keywords: ["toolkits", "collections", "curated", "bundles"]
  },
  {
    id: "page-features",
    title: "Features",
    description: "Powerful features for buyers and sellers",
    category: "Pages",
    url: "/features",
    keywords: ["features", "capabilities", "benefits"]
  },
  {
    id: "page-pricing",
    title: "Pricing",
    description: "Transparent pricing for sellers and buyers",
    category: "Pages",
    url: "/pricing",
    keywords: ["pricing", "fees", "cost", "commission"]
  },
  {
    id: "page-about",
    title: "About Us",
    description: "Learn about DigiTuuls and our mission",
    category: "Pages",
    url: "/about",
    keywords: ["about", "mission", "team", "company"]
  },
  {
    id: "page-contact",
    title: "Contact",
    description: "Get in touch with our team",
    category: "Pages",
    url: "/contact",
    keywords: ["contact", "support", "help", "email"]
  },
  {
    id: "page-sell",
    title: "Sell Products",
    description: "Start selling your digital products today",
    category: "Pages",
    url: "/sell",
    keywords: ["sell", "seller", "vendor", "create", "upload"]
  },
  {
    id: "page-profile",
    title: "Profile",
    description: "Manage your account and settings",
    category: "Account",
    url: "/profile",
    keywords: ["profile", "account", "settings", "user"]
  },
  {
    id: "page-purchases",
    title: "My Purchases",
    description: "View your purchase history and downloads",
    category: "Account",
    url: "/purchases",
    keywords: ["purchases", "orders", "history", "downloads"]
  },
  {
    id: "page-saved",
    title: "Saved Items",
    description: "Access your saved products and favorites",
    category: "Account",
    url: "/saved",
    keywords: ["saved", "favorites", "bookmarks", "wishlist"]
  },
  {
    id: "page-referrals",
    title: "Referrals & Earnings",
    description: "Track your referrals and commission earnings",
    category: "Account",
    url: "/referrals",
    keywords: ["referrals", "earnings", "commission", "affiliate"]
  }
];

export const featuresData: SearchResult[] = [
  {
    id: "feature-search",
    title: "Advanced Search",
    description: "Find exactly what you need with powerful filters and smart search algorithms",
    category: "Features",
    url: "/features#search",
    keywords: ["search", "filter", "find", "discover"]
  },
  {
    id: "feature-security",
    title: "Secure Payments",
    description: "Bank-level encryption and secure payment processing",
    category: "Features",
    url: "/features#security",
    keywords: ["security", "payment", "encryption", "safe"]
  },
  {
    id: "feature-analytics",
    title: "Seller Analytics",
    description: "Track sales, revenue, and customer insights",
    category: "Features",
    url: "/features#analytics",
    keywords: ["analytics", "stats", "insights", "data"]
  },
  {
    id: "feature-referral",
    title: "Referral Program",
    description: "Earn commission by referring new users",
    category: "Features",
    url: "/features#referral",
    keywords: ["referral", "affiliate", "commission", "earn"]
  }
];

// Combine all data sources
export const allSearchableData: SearchResult[] = [
  ...productsData,
  ...toolsData,
  ...toolkitsData,
  ...pagesData,
  ...featuresData
];
