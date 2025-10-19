import { Link } from "react-router-dom";
import { Search, User, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">M</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link to="/tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tools
            </Link>
            <Link to="/toolkits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Toolkits
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary"
            />
          </div>

          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <Search className="h-5 w-5 md:hidden" />
          </Button>

          <Link to="/sell">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              Sell Product
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
