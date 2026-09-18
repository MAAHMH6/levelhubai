import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useBranding } from "@/hooks/useBranding";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Subjects", href: "/subjects" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const branding = useBranding();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {branding.logo_url && !logoError ? (
              <img 
                src={branding.logo_url} 
                alt={branding.brand_name} 
                className="w-9 h-9 shrink-0 rounded-xl object-cover" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-display text-xl font-bold text-foreground">{branding.brand_name}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Beta</Badge>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`transition-colors font-medium ${
                  location.pathname === link.href 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {!loading && (
              user ? (
                <Link to="/dashboard">
                  <Button variant="hero">
                    Dashboard
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero">
                      Get Started
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`transition-colors font-medium py-2 ${
                    location.pathname === link.href 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                {!loading && (
                  user ? (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Dashboard
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">Log In</Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="hero" className="w-full">
                          Get Started
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
