import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center space-y-8">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="DigiTuuls" className="h-24 w-auto drop-shadow-lg sm:h-28 md:h-32" />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-8xl font-bold text-foreground">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
