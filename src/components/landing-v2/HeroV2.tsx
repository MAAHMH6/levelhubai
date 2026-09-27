import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeroV2Props {
  onOpenWhatsApp?: () => void;
  onOpenTools?: () => void;
}

const ANIMATED_FEATURES = [
  "Quizzes & Topic Past Papers",
  "Gamified O-Level & IGCSE Learning",
  "AI O-Level & IGCSE Tutor",
  "Cambridge CIE Aligned Practice",
  "AI Mock Exams & Instant Marking",
  "Video Magnet Lessons",
  "Cheat Sheets & Smart Flashcards",
  "Parent Monitoring Dashboard",
];

export const HeroV2: React.FC<HeroV2Props> = ({
  onOpenWhatsApp,
  onOpenTools,
}) => {
  const { user } = useAuth();
  // Typewriter text animation state
  const [featureIndex, setFeatureIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = ANIMATED_FEATURES[featureIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentFullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1800);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, 28);
      } else {
        setIsDeleting(false);
        setFeatureIndex((prev) => (prev + 1) % ANIMATED_FEATURES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, featureIndex]);

  const handleWhatsApp = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    } else {
      const text = encodeURIComponent(
        "Hello LevelHubAI! I'd like more information about Cambridge exam self-study preparation."
      );
      window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
    }
  };

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-28 pb-16 bg-gradient-to-b from-teal-500/5 via-background to-background">
      {/* Background Ambient Glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Two-Column Layout: Spreading Text Evenly on Left (7 cols), Large Dashboard Display on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-center">
          
          {/* Left Column: Heading evenly spread sideways, Animated line, Online Self-Study CTAs */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Top Proof Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-teal-500/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">
                Trusted by <strong>50K+ O-Level, IGCSE, & A-Level Students</strong>
              </span>
              <span className="hidden sm:inline text-[11px] text-muted-foreground border-l border-border pl-2 font-mono">
                CAIE 2024–2026
              </span>
            </div>

            {/* Main Headline - Evenly Spread Sideways without vertical congestion */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-black tracking-tight leading-[1.14] text-foreground max-w-3xl lg:max-w-4xl">
              Ace Your Cambridge Exams With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-600">
                AI-Powered Gamified Learning
              </span>
            </h1>

            {/* Animated text cycling through Quizzes and all features */}
            <div className="flex flex-wrap items-center gap-2.5 min-h-[38px]">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Master with:
              </span>
              <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 shadow-xs">
                <span className="text-sm sm:text-base font-extrabold text-teal-600 dark:text-teal-400">
                  {displayedText}
                </span>
                <span className="inline-block w-0.5 h-4 sm:h-5 bg-teal-500 ml-1.5 animate-pulse align-middle" />
              </div>
            </div>

            {/* Subtitle - Online Self-Study Platform spread sideways */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              The all-in-one Cambridge O Level, IGCSE & A Level online self-study platform. Practice 10+ years of topical past papers, get instant AI mark scheme feedback, and master your syllabus at your own pace.
            </p>

            {/* Online Self-Study CTAs: Evenly spread sideways */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1 w-full">
              {/* CTA 1: Get Started Free */}
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl text-sm font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white shadow-lg shadow-teal-600/20 gap-2"
              >
                <Link to="/auth">
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                </Link>
              </Button>

              {/* CTA 2: Start Your Quiz */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-xl text-sm font-bold border-border bg-card hover:bg-muted text-foreground gap-2"
              >
                <Link to="/quiz-setup">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Start Your Quiz</span>
                </Link>
              </Button>

              {/* CTA 3: WhatsApp Support (03098444501) */}
              <Button
                onClick={handleWhatsApp}
                size="lg"
                variant="outline"
                className="h-12 px-6 rounded-xl text-sm font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                <span>WhatsApp Support</span>
              </Button>
            </div>

            {/* Reassurance text */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant syllabus access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Online Self-Study
              </span>
            </div>
          </div>

          {/* Right Column: Dashboard Display Card (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 relative flex justify-center lg:justify-end w-full">
            {/* Outer Ambient Glow */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-teal-500/30 via-indigo-500/25 to-purple-500/30 rounded-3xl blur-3xl opacity-80 pointer-events-none" />

            {/* Browser Window Frame with LevelHubAI Dashboard */}
            <Link to={user ? "/dashboard" : "/auth?tab=signup"} className="relative w-full rounded-2xl sm:rounded-3xl border-2 border-border/80 bg-card shadow-2xl overflow-hidden group transition-all duration-300 hover:shadow-teal-500/10 block cursor-pointer">
              
              {/* Window Chrome Header Bar */}
              <div className="px-5 py-3.5 bg-muted/80 border-b border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                  <span className="font-mono text-xs ml-2 text-foreground font-semibold">
                    app.levelhubai.com/dashboard
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-teal-600 dark:text-teal-400 font-bold border-teal-500/30">
                  Live Cockpit
                </Badge>
              </div>

              {/* Dashboard Image Display */}
              <div className="relative overflow-hidden bg-background">
                <img
                  src="/dashboard-preview.png"
                  alt="LevelHubAI Student Platform Dashboard"
                  className="w-full h-auto object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                />
              </div>

              {/* Floating Badge 1: Top Right (Score Boost) */}
              <div className="absolute top-14 right-4 sm:right-6 bg-background/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-border shadow-2xl flex items-center gap-3 pointer-events-none transition-transform group-hover:translate-y-[-2px]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">25–50% Score Boost</div>
                  <div className="text-[10px] text-muted-foreground">Target Grade: A* Projected</div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Left (Instant AI Feedback) */}
              <div className="absolute bottom-5 left-4 sm:left-6 bg-background/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-border shadow-2xl flex items-center gap-3 pointer-events-none transition-transform group-hover:translate-y-[-2px]">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">Instant AI Feedback</div>
                  <div className="text-[10px] text-muted-foreground">Method Mark Scheme Criteria</div>
                </div>
              </div>

            </Link>
          </div>

        </div>

        {/* 3 Live Stats Cards from Platform (Image 1) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { value: "50K+", label: "O-Level & IGCSE Students" },
            { value: "15K+", label: "Practice Questions" },
            { value: "95%", label: "Cambridge Pass Rate" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-card border border-border/80 shadow-md text-center hover:border-teal-500/40 hover:-translate-y-0.5 transition-all"
            >
              <p className="font-display text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
