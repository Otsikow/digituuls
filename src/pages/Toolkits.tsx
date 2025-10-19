import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Toolkits = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const toolkits = [
    {
      id: "1",
      title: "Startup Launch Kit",
      slug: "startup-launch-kit",
      description: "Everything you need to launch your startup in 30 days",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      toolsCount: 12,
      views: 2341,
      tags: ["Startup", "Launch", "Marketing"],
      category: "Startup",
    },
    {
      id: "2",
      title: "Full-Stack Developer Toolkit",
      slug: "fullstack-dev-toolkit",
      description: "Complete toolset for modern full-stack development",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
      toolsCount: 18,
      views: 3892,
      tags: ["Development", "Full-Stack", "DevOps"],
      category: "Developer",
    },
    {
      id: "3",
      title: "Designer's Arsenal",
      slug: "designers-arsenal",
      description: "Curated design tools for UI/UX professionals",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
      toolsCount: 15,
      views: 2156,
      tags: ["Design", "UI/UX", "Creative"],
      category: "Design",
    },
    {
      id: "4",
      title: "AI Content Creator Bundle",
      slug: "ai-content-creator",
      description: "AI-powered tools for content creation and automation",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
      toolsCount: 10,
      views: 4521,
      tags: ["AI", "Content", "Automation"],
      category: "AI",
    },
    {
      id: "5",
      title: "Marketing Growth Stack",
      slug: "marketing-growth-stack",
      description: "Tools to scale your marketing and grow your audience",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      toolsCount: 14,
      views: 3214,
      tags: ["Marketing", "Growth", "Analytics"],
      category: "Marketing",
    },
    {
      id: "6",
      title: "Remote Work Essentials",
      slug: "remote-work-essentials",
      description: "Everything for productive remote and async work",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80",
      toolsCount: 11,
      views: 1876,
      tags: ["Productivity", "Remote", "Collaboration"],
      category: "Productivity",
    },
  ];

  const filteredToolkits = toolkits.filter((toolkit) =>
    toolkit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toolkit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toolkit.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Curated Toolkits</h1>
          <p className="text-muted-foreground">
            Hand-picked collections of tools for specific use cases
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search toolkits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>

          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            Create Toolkit
          </Button>
        </div>

        {/* Toolkits Grid */}
        {filteredToolkits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredToolkits.map((toolkit) => (
              <Card
                key={toolkit.id}
                className="border-border/50 bg-gradient-card hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                onClick={() => navigate(`/toolkit/${toolkit.slug}`)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={toolkit.image}
                    alt={toolkit.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className="mb-2 bg-primary/80 text-primary-foreground">
                      {toolkit.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{toolkit.title}</h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {toolkit.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {toolkit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {toolkit.toolsCount} tools
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {toolkit.views.toLocaleString()} views
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No toolkits found</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Toolkits;