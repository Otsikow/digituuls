import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  category: string;
}

export const ProductCard = ({
  id,
  title,
  subtitle,
  price,
  image,
  rating,
  reviewCount,
  isNew,
  isBestSeller,
  category,
}: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="group">
      <Card className="overflow-hidden border-border/50 bg-gradient-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <Badge className="bg-primary text-primary-foreground shadow-glow">
                New
              </Badge>
            )}
            {isBestSeller && (
              <Badge className="bg-accent text-accent-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                Best Seller
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{category}</p>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {subtitle}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="ml-1 font-medium">{rating}</span>
            </div>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl font-bold text-foreground">
              ${(price / 100).toFixed(0)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
