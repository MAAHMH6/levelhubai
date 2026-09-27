import React, { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Target,
  Heart,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  MessageCircle
} from "lucide-react";
import { MissionSection } from "@/components/landing-v2/MissionSection";
import { FinalConversionSection } from "@/components/landing-v2/FinalConversionSection";
import { FreeStudyToolsModal } from "@/components/landing-v2/FreeStudyToolsModal";
import { Link } from "react-router-dom";

const stats = [
  { value: "500+", label: "Ambitious Students Worldwide" },
  { value: "54", label: "Cambridge Syllabi (IGCSE, O & A Level)" },
  { value: "10,000+", label: "Topical Questions & Solutions" },
  { value: "16", label: "Free Cambridge Study Tools" },
];

const values = [
  {
    icon: Target,
    title: "Exam-Board Rigor",
    description: "Every question, mark scheme, and explanation is strictly engineered to official Cambridge CAIE standards.",
  },
  {
    icon: Bot,
    title: "AI-Powered Democratization",
    description: "World-class mark scheme insights and step-by-step marking accessible 24/7 without exorbitant hourly fees.",
  },
  {
    icon: Heart,
    title: "Student Confidence First",
    description: "Eliminate exam anxiety through structured daily plans, smart hints, and non-judgmental revision drills.",
  },
  {
    icon: Users,
    title: "Parental Transparency",
    description: "Equip parents with simple 6-digit access to see real study hours, completed topics, and accurate grade projections.",
  },
];

const AboutPage = () => {
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello LevelHubAI! I'd like to learn more about the team, Cambridge tutoring methodology, and study plans."
    );
    window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
  };

  const handleOpenTools = () => {
    setToolsOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Empowering Cambridge Students to{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Excel Beyond Boundaries
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            LevelHubAI is an advanced AI-powered learning platform built exclusively for Cambridge IGCSE, O Level, and International A Level students. We bridge the gap between classroom teaching and official Cambridge expectations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="font-bold shadow-lg shadow-primary/25 h-12 px-8"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleOpenWhatsApp}
              className="h-12 px-8 font-semibold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Stats Grid */}
      <section className="py-12 bg-muted/20 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/70 p-6 text-center shadow-xs"
              >
                <p className="font-display text-3xl md:text-4xl font-extrabold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <BookOpen className="w-3.5 h-3.5" />
                <span>The LevelHubAI Story</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Born From a Simple Truth:{" "}
                <span className="text-primary">Exam Success Needs Precision.</span>
              </h2>

              <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Every year, thousands of students prepare for Cambridge examinations by endlessly reading textbooks and memorizing notes—only to struggle when facing the exact phrasing demanded by Cambridge mark schemes.
                </p>
                <p>
                  Private tuition was often priced out of reach at $60–$100 per hour, leaving most learners without personal feedback on their method marks, derivation steps, or time pacing.
                </p>
                <p>
                  We built LevelHubAI to solve this once and for all: combining rigorous official past papers, instant 24/7 AI method marking, video magnet lessons, and gamified study habits so every student can prepare with complete clarity.
                </p>
              </div>
            </div>

            {/* Story Card Box */}
            <div className="bg-gradient-to-br from-primary/10 via-card to-purple-500/10 rounded-3xl p-8 sm:p-10 border border-primary/20 shadow-xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">Mark Scheme Clarity, Zero Fluff</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Whether it's the tricky definitions in O Level Biology (5090), calculus derivatives in IGCSE Mathematics (0580), or organic mechanisms in A Level Chemistry (9701), our platform is mapped to every single learning objective.
              </p>
              <div className="pt-2">
                <Button asChild className="font-bold shadow-md">
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Our Guiding <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              The foundational standards that guide every tool, feature, and explanation we craft.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-card rounded-2xl border border-border/80 p-6 space-y-3 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community & Mission Section */}
      <MissionSection
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* Final Conversion Section */}
      <FinalConversionSection
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      <Footer hideCta={true} />

      {/* Global Interactive Modals */}
      <FreeStudyToolsModal open={toolsOpen} onOpenChange={setToolsOpen} />
    </main>
  );
};

export default AboutPage;
