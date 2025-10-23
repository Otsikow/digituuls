import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import {
  Search,
  Sparkles,
  Shield,
  TrendingUp,
  Zap,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Users,
  Layers,
  Bot,
  Palette,
  LayoutDashboard,
  LineChart,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  const featuredProducts = [
    {
      id: "1",
      title: "SaaS Starter Kit Pro",
      subtitle: "Complete Next.js boilerplate with auth & payments",
      price: 14900,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      rating: 4.9,
      reviewCount: 127,
      isNew: true,
      category: "SaaS Projects",
    },
    {
      id: "2",
      title: "AI Content Generator",
      subtitle: "GPT-powered content creation tool with templates",
      price: 4900,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      rating: 4.8,
      reviewCount: 89,
      isBestSeller: true,
      category: "AI Tools",
    },
    {
      id: "3",
      title: "Design System Library",
      subtitle: "200+ components for Figma & React",
      price: 7900,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      rating: 5.0,
      reviewCount: 234,
      isBestSeller: true,
      category: "Design Assets",
    },
    {
      id: "4",
      title: "Marketing Automation Suite",
      subtitle: "Email campaigns & analytics dashboard",
      price: 9900,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      rating: 4.7,
      reviewCount: 156,
      category: "Marketing",
    },
  ];

  const stats = [
    { value: "8.2k+", label: "Creators", description: "Verified builders sharing premium products" },
    { value: "$12M", label: "Earned", description: "Paid out to sellers in the last 12 months" },
    { value: "62", label: "Countries", description: "Global marketplace with trusted payouts" },
  ];

  const spotlight = [
    { title: "AI Content Generator", subtitle: "Launch-ready with GPT-4 prompt library", metric: "4.8★ rating" },
    { title: "Growth Marketing Suite", subtitle: "Automated funnels & analytics dashboard", metric: "+312% ROI" },
    { title: "Design System Library", subtitle: "Figma + React components with docs", metric: "200+ assets" },
  ];

  const features = [
    { icon: Shield, title: "Verified Sellers", description: "All sellers go through KYC verification for your security" },
    { icon: Zap, title: "Instant Access", description: "Download your purchases immediately after checkout" },
    { icon: TrendingUp, title: "Quality Products", description: "Curated marketplace with only the best digital tools" },
  ];

  const categories = [
    { icon: Bot, title: "AI Automation", description: "Workflows, chatbots, and assistants to accelerate growth" },
    { icon: LayoutDashboard, title: "Dashboards", description: "Analytics templates and data visualization kits" },
    { icon: Palette, title: "Design Systems", description: "Complete UI kits with tokens, guidelines, and assets" },
    { icon: LineChart, title: "Marketing", description: "Funnels, automations, and reporting playbooks" },
  ];

  const testimonials = [
    {
      quote:
        "DigiTuuls helped us launch a new product line in weeks. The quality of the assets is outstanding and onboarding was seamless.",
      name: "Clara Jennings",
      role: "Head of Product, Nova Labs",
    },
    {
      quote:
        "As a creator, I love how polished the seller experience is. Payments are instant and the analytics give me clarity on performance.",
      name: "Jamir Patel",
      role: "Founder, AutomateIQ",
    },
    {
      quote:
        "Our team saved hundreds of hours using marketplace toolkits. Support is responsive and the curation is top-tier.",
      name: "Marisol Díaz",
      role: "Operations Lead, LaunchHub",
    },
  ];

  const partnerLogos = ["Product Hunt", "Framer", "Linear", "Webflow", "Mixpanel", "Notion"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="absolute inset-0 bg-grid-fine opacity-40" />
        <div className="absolute -top-32 -right-32 hidden h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl lg:block" />
        <div className="absolute -bottom-24 -left-24 hidden h-72 w-72 rounded-full bg-accent/20 blur-3xl md:block" />

        <div className="container relative section-spacing">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr,0.95fr] xl:gap-16">
            {/* Hero Left */}
            <div className="space-y-10">
              <div className="flex flex-col items-center gap-6 text-center sm:gap-8 md:items-start md:text-left">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4 md:flex-col md:items-start">
                  <img src={logo} alt="DigiTuuls" className="h-14 w-auto drop-shadow-sm sm:h-16" />
                  <span className="text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
                    Your growth partner for digital launches
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-2 text-xs font-medium text-primary shadow-soft sm:px-5 sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Professional Digital Marketplace</span>
                </div>
                <h1 className="text-fluid-display font-bold tracking-tight text-balance">
                  Discover, launch, and scale with premium digital tools
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-fluid-subheading">
                  DigiTuuls curates high-performing SaaS projects, templates, and automations so your next product or campaign is ready in record time.
                </p>
              </div>

              {/* Stats */}
              <div className="grid gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card/70 p-5 text-center shadow-soft backdrop-blur-sm sm:p-6"
                  >
                    <p className="text-2xl font-semibold text-foreground sm:text-3xl">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-xs text-muted-foreground/80 sm:text-sm">{stat.description}</p>
                  </div>
                ))}
              </div>

              {/* Search Bar */}
              <div className="rounded-3xl border border-border/60 bg-secondary/60 p-5 shadow-elevated backdrop-blur-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="relative w-full flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search for tools, templates, and workflows..."
                      className="h-12 rounded-2xl border-none bg-background/40 pl-12 text-sm focus-visible:ring-primary sm:h-14 sm:text-base"
                    />
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link to="/marketplace" className="flex-1">
                      <Button size="lg" className="h-12 w-full rounded-2xl bg-gradient-primary text-sm shadow-glow sm:h-14 sm:text-base">
                        Explore Marketplace
                      </Button>
                    </Link>
                    <Link to="/sell" className="flex-1">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-full rounded-2xl border-primary/40 bg-background/20 text-sm text-primary transition-colors hover:bg-primary/10 sm:h-14 sm:text-base"
                      >
                        Become a Seller
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Spotlight Section */}
            <div className="relative mt-12 lg:mt-0">
              <div className="pointer-events-none absolute -top-16 -right-10 hidden h-32 w-32 rounded-full bg-primary/25 blur-2xl sm:block" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 hidden h-40 w-40 rounded-full bg-accent/20 blur-2xl sm:block" />
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-elegant backdrop-blur-lg sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm">
                  <BadgeCheck className="h-4 w-4" /> Verified spotlight
                </div>
                <h3 className="mt-5 text-xl font-semibold sm:mt-6 sm:text-2xl">
                  Launch-ready products curated weekly
                </h3>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Discover premium projects vetted by our expert team. Every listing includes documentation, onboarding, and support resources.
                </p>

                <div className="mt-6 space-y-3 sm:space-y-4">
                  {spotlight.map((item) => (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 sm:p-5"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">{item.metric}</p>
                          <p className="text-base font-medium text-foreground sm:text-lg">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 rounded-2xl border border-border/50 bg-background/40 p-4 sm:grid-cols-2 sm:p-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-10 w-10 rounded-xl bg-primary/15 p-2 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground sm:text-base">Growth Network</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">Collaborate with vetted partners and agencies.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 rounded-xl bg-accent/15 p-2 text-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground sm:text-base">Actionable Analytics</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">Track conversions, downloads, and revenue in real time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining sections unchanged */}
      <Footer />
    </div>
  );
};

export default Index;
