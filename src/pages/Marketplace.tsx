import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";

const Marketplace = () => {
  const products = [
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
    {
      id: "5",
      title: "E-commerce Template Bundle",
      subtitle: "Modern store templates with checkout flow",
      price: 5900,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
      rating: 4.6,
      reviewCount: 98,
      category: "Templates",
    },
    {
      id: "6",
      title: "Analytics Dashboard Kit",
      subtitle: "Beautiful charts and data visualization components",
      price: 3900,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      rating: 4.9,
      reviewCount: 176,
      category: "UI Components",
    },
  ];

  const categories = ["All", "SaaS Projects", "AI Tools", "Design Assets", "Marketing", "Templates", "UI Components"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse {products.length} premium digital products and tools</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className={
                  category === "All"
                    ? "bg-primary text-primary-foreground cursor-pointer"
                    : "cursor-pointer hover:bg-secondary"
                }
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 lg:ml-auto">
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="border-border/50">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg" className="border-border/50 hover:bg-secondary">
            Load More Products
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
