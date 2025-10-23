import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Bell, MoonStar, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { NotificationCenter } from "./NotificationCenter";
import { useThemeMode } from "@/hooks/useThemeMode";
import logo from "@/assets/logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications } = useReferrals();
  const { toggleTheme, isDark } = useThemeMode();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const unreadNotifications = notifications?.filter((n) => !n.read).length || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="DigiTuuls" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/tools"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            <Link
              to="/toolkits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Toolkits
            </Link>
          </nav>
        </div>

        {/* Right Section - Search, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary"
            />
          </form>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="hover:bg-secondary md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-secondary"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </Button>

          {/* Notification Bell (Only when logged in) */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary relative"
              onClick={() => setNotificationOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          )}

          {/* Sell Button */}
          <Link to="/sell">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              Sell Product
            </Button>
          </Link>

          {/* User Profile / Auth Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/referrals")}>
                  Referrals & Earnings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/purchases")}>
                  My Purchases
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/saved")}>
                  Saved Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => navigate("/auth")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Notification Drawer */}
      {user && (
        <NotificationCenter
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />
      )}
    </header>
  );
};
