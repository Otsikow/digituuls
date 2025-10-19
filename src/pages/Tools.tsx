import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Github, TrendingUp, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitToolDialog } from "@/components/SubmitToolDialog";

const Tools = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const tools = [
    {
      id: "1",
      title: "Notion",
      description: "All-in-one workspace for notes, docs, and collaboration",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80",
      category: "Productivity",
      pricing: "Freemium",
      websiteUrl: "https://notion.so",
      upvotes: 1234,
      tags: ["Notes", "Docs", "Collaboration"],
    },
    {
      id: "2",
      title: "Figma",
      description: "Collaborative interface design tool",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
      category: "Design",
      pricing: "Freemium",
      websiteUrl: "https://figma.com",
      repoUrl: null,
      upvotes: 2156,
      tags: ["Design", "UI/UX", "Prototyping"],
    },
    {
      id: "3",
      title: "ChatGPT",
      description: "Advanced AI language model for conversations and content",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
      category: "AI",
      pricing: "Freemium",
      websiteUrl: "https://chat.openai.com",
      upvotes: 3421,
      tags: ["AI", "ChatBot", "Writing"],
    },
    {
      id: "4",
      title: "VS Code",
      description: "Powerful, lightweight code editor",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
      category: "Development",
      pricing: "Free",
      websiteUrl: "https://code.visualstudio.com",
      repoUrl: "https://github.com/microsoft/vscode",
      upvotes: 4532,
      tags: ["Code Editor", "IDE", "Development"],
    },
    {
      id: "5",
      title: "Stripe",
      description: "Payment processing platform for the internet",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
      category: "Marketing",
      pricing: "Usage-based",
      websiteUrl: "https://stripe.com",
      upvotes: 2876,
      tags: ["Payments", "API", "SaaS"],
    },
    {
      id: "6",
      title: "Supabase",
      description: "Open source Firebase alternative",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
      category: "Development",
      pricing: "Freemium",
      websiteUrl: "https://supabase.com",
      repoUrl: "https://github.com/supabase/supabase",
      upvotes: 3214,
      tags: ["Database", "Backend", "Auth"],
    },
  ];

  const categories = ["All", "AI", "Design", "Development", "Productivity", "Marketing"];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || tool.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-4xl font-bold mb-2">Community Tools Directory</h1>
          <p className="text-muted-foreground">
            Discover and share the best tools for creators and developers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity w-full sm:w-auto"
            onClick={() => setShowSubmitDialog(true)}
          >
            Submit Tool
          </Button>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card
                key={tool.id}
                className="border-border/50 bg-gradient-card hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/tool/${tool.id}`)}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-background/90 text-foreground">
                        {tool.pricing}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{tool.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle upvote
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {tool.upvotes}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(tool.websiteUrl, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit
                    </Button>
                    {tool.repoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(tool.repoUrl, "_blank");
                        }}
                      >
                        <Github className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle save
                      }}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No tools found</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}
      </div>

      <Footer />
      <SubmitToolDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog} />
    </div>
  );
};

export default Tools;