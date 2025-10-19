import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Heart, Star, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock saved items data - replace with actual data from backend
  const [savedItems, setSavedItems] = useState([
    {
      id: "1",
      name: "Email Marketing Suite",
      category: "Marketing",
      price: 79.99,
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Video Editing Toolkit",
      category: "Creative",
      price: 99.99,
      rating: 4.9,
      reviews: 203,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      name: "SEO Optimization Tools",
      category: "Marketing",
      price: 59.99,
      rating: 4.7,
      reviews: 124,
      image: "/placeholder.svg",
    },
  ]);

  const handleRemove = (id: string) => {
    setSavedItems(savedItems.filter((item) => item.id !== id));
    toast.success("Item removed from saved items");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Heart className="h-10 w-10 text-primary fill-primary" />
              Saved Items
            </h1>
            <p className="text-muted-foreground">
              Products you've bookmarked for later
            </p>
          </div>

          {/* Saved Items Grid */}
          {savedItems.length === 0 ? (
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring and save your favorite products for later
                </p>
                <Button
                  onClick={() => navigate("/marketplace")}
                  className="bg-gradient-primary"
                >
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {savedItems.length} {savedItems.length === 1 ? "item" : "items"} saved
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Category Badge */}
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {item.category}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="text-xl font-semibold line-clamp-2">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(item.rating)
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.rating} ({item.reviews})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-2xl font-bold">${item.price}</span>
                        <Button
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="bg-gradient-primary"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Saved;
