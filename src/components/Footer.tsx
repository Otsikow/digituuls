import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container space-y-12 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img src={logo} alt="DigiTuuls" className="h-20 w-auto drop-shadow-lg" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="text-xl font-bold text-foreground">DigiTuuls</p>
                <p className="text-sm">
                  Premium marketplace for digital builders.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional marketplace for digital tools, SaaS projects, and
              creative assets.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/marketplace"
                  className="transition-colors hover:text-foreground"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="transition-colors hover:text-foreground"
                >
                  Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/toolkits"
                  className="transition-colors hover:text-foreground"
                >
                  Toolkits
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="transition-colors hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="transition-colors hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/terms"
                  className="transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/seller-terms"
                  className="transition-colors hover:text-foreground"
                >
                  Seller Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border/40 pt-8 text-center text-xs text-muted-foreground sm:text-sm">
          <p>© 2025 DigiTuuls Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
