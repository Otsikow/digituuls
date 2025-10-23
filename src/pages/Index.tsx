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
    {
      value: "8.2k+",
      label: "Creators",
      description: "Verified builders sharing premium products",
    },
    {
      value: "$12M",
      label: "Earned",
      description: "Paid out to sellers in the last 12 months",
    },
    {
      value: "62",
      label: "Countries",
      description: "Global marketplace with trusted payouts",
    },
  ];

  const spotlight = [
    {
      title: "AI Content Generator",
      subtitle: "Launch-ready with GPT-4 prompt library",
      metric: "4.8★ rating",
    },
    {
      title: "Growth Marketing Suite",
      subtitle: "Automated funnels & analytics dashboard",
      metric: "+312% ROI",
    },
    {
      title: "Design System Library",
      subtitle: "Figma + React components with docs",
      metric: "200+ assets",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Sellers",
      description: "All sellers go through KYC verification for your security",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Download your purchases immediately after checkout",
    },
    {
      icon: TrendingUp,
      title: "Quality Products",
      description: "Curated marketplace with only the best digital tools",
    },
  ];

  const categories = [
    {
      icon: Bot,
      title: "AI Automation",
      description: "Workflows, chatbots, and assistants to accelerate growth",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboards",
      description: "Analytics templates and data visualisation kits",
    },
    {
      icon: Palette,
      title: "Design Systems",
      description: "Complete UI kits with tokens, guidelines, and assets",
    },
    {
      icon: LineChart,
      title: "Marketing",
      description: "Funnels, automations, and reporting playbooks",
    },
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
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="container relative py-24 md:py-32">
          <div className="grid items-center gap-16 md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-10">
              <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
                <div className="flex flex-col items-center gap-3 md:items-start">
                  <img src={logo} alt="DigiTuuls" className="h-16 w-auto drop-shadow-sm" />
                  <span className="text-base font-medium text-muted-foreground md:text-lg">
                    Your growth partner for digital launches
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-2 text-sm font-medium text-primary shadow-soft">
                  <Sparkles className="h-4 w-4" />
                  <span>Professional Digital Marketplace</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
                  Discover, launch, and scale with premium digital tools
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  DigiTuuls curates high-performing SaaS projects, templates, and automations so your next product or campaign is ready in record time.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center shadow-soft backdrop-blur"
                  >
                    <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-xs text-muted-foreground/80">{stat.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border/60 bg-secondary/60 p-6 shadow-elevated backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search for tools, templates, and workflows..."
                      className="h-14 rounded-2xl border-none bg-background/40 pl-12 text-base focus-visible:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link to="/marketplace" className="flex-1">
                      <Button size="lg" className="h-14 w-full rounded-2xl bg-gradient-primary text-base shadow-glow">
                        Explore Marketplace
                      </Button>
                    </Link>
                    <Link to="/sell" className="flex-1">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 w-full rounded-2xl border-primary/40 bg-background/20 text-base text-primary hover:bg-primary/10"
                      >
                        Become a Seller
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-primary/25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-elegant backdrop-blur-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <BadgeCheck className="h-4 w-4" /> Verified spotlight
                </div>
                <h3 className="mt-6 text-2xl font-semibold">Launch-ready products curated weekly</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover premium projects vetted by our expert team. Every listing includes documentation, onboarding, and support resources.
                </p>

                <div className="mt-6 space-y-4">
                  {spotlight.map((item) => (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-4 transition-all hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">{item.metric}</p>
                          <p className="text-lg font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 rounded-2xl border border-border/50 bg-background/40 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-10 w-10 rounded-xl bg-primary/15 p-2 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Growth Network</p>
                      <p className="text-xs text-muted-foreground">Collaborate with vetted partners and agencies.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 rounded-xl bg-accent/15 p-2 text-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Actionable Analytics</p>
                      <p className="text-xs text-muted-foreground">Track conversions, downloads, and revenue in real time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="container pb-12">
        <div className="rounded-3xl border border-border/60 bg-card/40 px-6 py-10 shadow-soft backdrop-blur">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Trusted by teams building the future</p>
              <p className="mt-2 text-base text-muted-foreground">
                Join product leaders, agencies, and creators shipping faster with DigiTuuls.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-muted-foreground/80">
              {partnerLogos.map((logoName) => (
                <span key={logoName} className="rounded-full border border-border/50 bg-background/60 px-4 py-2 shadow-sm">
                  {logoName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-secondary-foreground/80">
              <Layers className="h-4 w-4" /> Platform advantage
            </div>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Everything you need to launch and scale digital products with confidence
            </h2>
            <p className="text-lg text-muted-foreground">
              From first concept to recurring revenue, DigiTuuls provides premium assets, transparent analytics, and a trusted buyer community.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-soft">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <BadgeCheck className="h-4 w-4 text-primary" /> Curated quality
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Listings are reviewed for design, performance, and documentation so you can trust what you buy.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-soft">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Users className="h-4 w-4 text-accent" /> Collaborative growth
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access a private creator network, partner with agencies, and co-build with top talent.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-soft">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" /> Insightful analytics
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real-time dashboards highlight conversions, downloads, and revenue trends.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-soft">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Zap className="h-4 w-4 text-accent" /> Effortless delivery
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Secure infrastructure handles payments, licensing, and instant downloads for your customers.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-8 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                <Layers className="h-4 w-4" /> Premium catalog
              </div>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Curated categories to accelerate every product milestone
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover playbooks, UI kits, and automation bundles crafted by industry experts across disciplines.
              </p>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="rounded-2xl border-border/60 bg-background/40 px-6 py-6 text-sm font-semibold hover:border-primary/40 hover:text-primary">
                Browse marketplace
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.title}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore templates <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">Featured marketplace launches</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Handpicked tools and projects from top creators. Preview the craftsmanship before you commit.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="secondary" className="rounded-2xl border border-border/40 bg-background/40 px-6 py-6 text-sm font-semibold text-foreground hover:bg-secondary/60">
              View full catalog
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[0.8fr,1.2fr] md:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                <Quote className="h-4 w-4" /> Voices from the community
              </div>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Creators and teams rely on DigiTuuls to ship polished experiences faster
              </h2>
              <p className="text-lg text-muted-foreground">
                From solo founders to enterprise studios, our marketplace empowers the next generation of digital products.
              </p>
              <Link to="/features">
                <Button className="rounded-2xl bg-gradient-primary px-6 py-6 text-sm font-semibold shadow-glow">
                  Explore platform features
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur"
                >
                  <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
                  <Quote className="relative h-8 w-8 text-primary" />
                  <p className="relative mt-4 text-sm text-muted-foreground">{testimonial.quote}</p>
                  <div className="relative mt-6">
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaC0ydi0yaDJ6bS0yLTR2Mmh5di0yaC0yem0yIDBodjJoLTJ2LTJoMnptMiAwdjJoMnYtMmgtMnptMCAydjJoLTJ2LTJoMnptMi0ydjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="relative max-w-2xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Sell Your Product?
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of creators earning from their digital products. We handle payments, verification, and customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sell">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 h-12 px-8">
                  Start Selling
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
