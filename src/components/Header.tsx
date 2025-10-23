import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Bell, MoonStar, Sun, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Separator } from "./ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { useThemeMode } from "@/hooks/useThemeMode";
import { NotificationCenter } from "./NotificationCenter";
import logo from "@/assets/logo.png";
export const Header = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const {
    notifications
  } = useReferrals();
  const {
    toggleTheme,
    isDark
  } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigationLinks = [{
    href: "/marketplace",
    label: "Marketplace"
  }, {
    href: "/tools",
    label: "Tools"
  }, {
    href: "/toolkits",
    label: "Toolkits"
  }, {
    href: "/features",
    label: "Features"
  }];
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(mobileSearchQuery)}`);
      setMobileSearchOpen(false);
      setMobileSearchQuery('');
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;
  return <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="DigiTuuls" className="h-10 sm:h-12 md:h-14 w-auto drop-shadow-sm" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">DigiTuuls</span>
              <span className="text-xs text-muted-foreground">Digital Marketplace</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navigationLinks.map(link => <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                {link.label}
              </Link>)}
          </nav>
        </div>

        {/* Right Section - Search, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-border/50 bg-secondary/60 pl-9 focus-visible:ring-primary" />
          </form>

          {/* Mobile Search Button */}
          <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-secondary md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search Products</DialogTitle>
                <DialogDescription>
                  Search for digital products, tools, and toolkits
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMobileSearch} className="space-y-4">
                <Input
                  placeholder="Search products..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
          <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-secondary" aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}>
            {isDark ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          {user && <Button variant="ghost" size="icon" className="hover:bg-secondary relative" onClick={() => setNotificationOpen(true)}>
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadNotifications}
                </Badge>}
            </Button>}

          {/* Sell Product */}
          <Link to="/sell">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
              Sell Product
            </Button>
          </Link>

          {/* User Profile / Auth */}
          {user ? <DropdownMenu>
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
                <DropdownMenuItem onClick={() => navigate("/purchases")}>My Purchases</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/saved")}>Saved Items</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button variant="ghost" size="icon" className="hover:bg-secondary" onClick={() => navigate("/auth")}>
              <User className="h-5 w-5" />
            </Button>}

          {/* Mobile Menu Drawer */}
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-secondary md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-border/60 bg-background">
              <DrawerHeader className="space-y-4 text-left">
                <DrawerTitle className="flex items-center gap-4">
                  <img src={logo} alt="DigiTuuls" className="h-12 w-auto drop-shadow-sm" />
                  <div className="flex flex-col text-left">
                    <span className="text-xl font-bold text-foreground">DigiTuuls</span>
                    <span className="text-sm text-muted-foreground">
                      Your growth partner for digital launches
                    </span>
                  </div>
                </DrawerTitle>
              </DrawerHeader>

              <div className="space-y-6 px-4 pb-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-11 rounded-xl border-border/60 bg-secondary/60 pl-10 focus-visible:ring-primary" />
                </form>

                <nav className="grid gap-3 text-base font-medium">
                  {navigationLinks.map(link => <DrawerClose asChild key={link.href}>
                      <Link to={link.href} className="group flex items-center justify-between rounded-xl border border-transparent bg-secondary/40 px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                        <span>{link.label}</span>
                        <ArrowIcon />
                      </Link>
                    </DrawerClose>)}
                </nav>

                <Separator className="bg-border/60" />

                <div className="grid gap-3">
                  <DrawerClose asChild>
                    <Link to="/sell">
                      <Button className="h-12 w-full rounded-xl bg-gradient-primary text-base shadow-glow">
                        Sell Product
                      </Button>
                    </Link>
                  </DrawerClose>
                  <Button type="button" variant="outline" className="h-12 rounded-xl border-border/60" onClick={toggleTheme}>
                    {isDark ? "Switch to light" : "Switch to dark"}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {user ? <DrawerClose asChild>
                      <button type="button" onClick={handleSignOut} className="font-medium text-primary">
                        Sign out
                      </button>
                    </DrawerClose> : <DrawerClose asChild>
                      <button type="button" onClick={() => navigate("/auth")} className="font-medium text-primary">
                        Sign in
                      </button>
                    </DrawerClose>}
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border/60">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Notification Drawer */}
      {user && <NotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />}
    </header>;
};
const ArrowIcon = () => <svg className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.66699 8H11.3337" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.66699 4.66675L12.0003 7.99992L8.66699 11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;