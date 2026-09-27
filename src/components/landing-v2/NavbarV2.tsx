import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  MessageCircle,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  GraduationCap,
  Flame,
  ArrowRight,
  Calculator,
  Clock,
  HelpCircle,
  BarChart3,
  Bookmark,
  CheckCircle2
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useBranding } from "@/hooks/useBranding";
import { CANONICAL_IGCSE_SUBJECTS } from "@/lib/canonicalIGCSESubjects";
import { CANONICAL_O_LEVEL_SUBJECTS } from "@/lib/canonicalOLevelSubjects";
import { CANONICAL_A_LEVEL_SUBJECTS } from "@/lib/canonicalALevelSubjects";

interface NavbarV2Props {
  onOpenWhatsApp?: () => void;
  onOpenTools?: () => void;
}

export const NavbarV2: React.FC<NavbarV2Props> = ({
  onOpenWhatsApp,
  onOpenTools,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const branding = useBranding();

  const handleWhatsAppClick = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    } else {
      const text = encodeURIComponent(
        "Hello LevelHubAI! I'd like more information about Cambridge exam self-study preparation and tools."
      );
      window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Subjects", href: "/subjects" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 transition-all">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Preserving exact original style */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {branding.logo_url && !logoError ? (
              <img
                src={branding.logo_url}
                alt={branding.brand_name}
                className="w-9 h-9 shrink-0 rounded-xl object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-display text-xl font-bold text-foreground">
              {branding.brand_name || "LevelHubAI"}
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
            >
              Beta
            </Badge>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>

            <Link
              to="/features"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/features"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Features
            </Link>

            <Link
              to="/subjects"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/subjects"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subjects
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground py-2 transition-colors"
              >
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                  Free Tools
                </span>
              </button>

              {/* Mega Dropdown Menu */}
              {resourcesOpen && (
                <div className="absolute top-full -left-28 w-[740px] bg-white dark:bg-zinc-950 text-foreground border-2 border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-6 grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-2 duration-150 z-[100] opacity-100">
                  {/* Left Col: Cambridge Qualifications (7 cols) */}
                  <div className="col-span-7 space-y-4 border-r border-border/80 pr-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Cambridge Syllabus Hub
                      </span>
                      <Link
                        to="/subjects"
                        onClick={() => setResourcesOpen(false)}
                        className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        All Subjects <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Cambridge IGCSE */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 hover:border-blue-500/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Cambridge IGCSE
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 bg-background">
                          {CANONICAL_IGCSE_SUBJECTS.length} Subjects
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Mathematics (0580), Physics (0625), Chemistry (0620), Biology (0610), Computer Science (0478)...
                      </p>
                      <Link
                        to="/subjects?prog=igcse"
                        onClick={() => setResourcesOpen(false)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Browse IGCSE Subjects →
                      </Link>
                    </div>

                    {/* Cambridge O Level */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Cambridge O Level
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 bg-background">
                          {CANONICAL_O_LEVEL_SUBJECTS.length} Subjects
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Math D (4024), Physics (5054), Chemistry (5070), Biology (5090), Pak Studies (2059)...
                      </p>
                      <Link
                        to="/subjects?prog=o_level"
                        onClick={() => setResourcesOpen(false)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Browse O Level Subjects →
                      </Link>
                    </div>

                    {/* Cambridge A & AS Level */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-border/60 hover:border-purple-500/40 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          Cambridge AS & A Level
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 bg-background">
                          {CANONICAL_A_LEVEL_SUBJECTS.length} Subjects
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Pure Maths & Stats (9709), Physics (9702), Chemistry (9701), Biology (9700), Economics (9708)...
                      </p>
                      <Link
                        to="/subjects?prog=a_level"
                        onClick={() => setResourcesOpen(false)}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Browse AS & A Level Subjects →
                      </Link>
                    </div>
                  </div>

                  {/* Right Col: Free Study Tools Hub (Separate Website Pages) */}
                  <div className="col-span-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Free Study Tools
                        </span>
                        <Badge className="bg-primary/20 text-primary border-none text-[10px] h-4">
                          Free Tools
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Instant exam calculators, planners, formula sheets & flashcard makers.
                      </p>

                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { name: "Exam Timetable Builder", href: "/tools/exam-timetable-builder", tag: "Planner" },
                          { name: "Exam Countdown 2026", href: "/tools/exam-countdown", tag: "Timer" },
                          { name: "Smart Flashcard Maker", href: "/tools/flashcard-maker", tag: "Recall" },
                          { name: "Formula Sheet Hub", href: "/tools/formula-sheet-hub", tag: "Sheets" },
                          { name: "Keyword & Definitions", href: "/tools/keyword-definition-lists", tag: "Glossary" },
                          { name: "Past Paper Finder", href: "/tools/past-paper-finder", tag: "Search" },
                        ].map((t, idx) => (
                          <Link
                            key={idx}
                            to={t.href}
                            onClick={() => setResourcesOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-foreground transition-colors group/btn"
                          >
                            <span className="truncate group-hover/btn:text-primary">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground group-hover/btn:text-primary font-mono">
                              {t.tag}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/tools/exam-timetable-builder"
                      onClick={() => setResourcesOpen(false)}
                      className="w-full flex items-center justify-center font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 rounded-xl shadow-md gap-1.5 transition-colors"
                    >
                      <span>Explore Free Study Tools</span>
                      <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/pricing"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pricing
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/about"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppClick}
              className="h-9 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs transition-all gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              <span>WhatsApp</span>
            </Button>

            <Link to="/dashboard">
              <Button variant="hero" size="sm" className="h-9 px-4 text-xs font-bold gap-1.5">
                {user ? "Dashboard" : "Student Dashboard"}
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`py-2 px-2 text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="py-2 px-2 border-t border-border/50 mt-1 space-y-1">
                <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                  Free Study Tools
                </div>
                {[
                  { name: "Exam Timetable Builder", href: "/tools/exam-timetable-builder" },
                  { name: "Exam Countdown 2026", href: "/tools/exam-countdown" },
                  { name: "Smart Flashcard Maker", href: "/tools/flashcard-maker" },
                  { name: "Formula Sheet Hub", href: "/tools/formula-sheet-hub" },
                  { name: "Keyword & Definitions", href: "/tools/keyword-definition-lists" },
                  { name: "Past Paper Finder", href: "/tools/past-paper-finder" },
                ].map((t) => (
                  <Link
                    key={t.href}
                    to={t.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    • {t.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    handleWhatsAppClick();
                  }}
                  className="w-full border-emerald-500/40 text-emerald-600 dark:text-emerald-400 justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  Chat on WhatsApp
                </Button>

                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="hero" size="sm" className="w-full justify-center">
                    {user ? "Go to Dashboard" : "Student Dashboard"}
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
