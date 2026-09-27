import React from "react";
import { GraduationCap, Target, Bot, Heart, Users, ShieldCheck, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AboutSectionProps {
  onOpenWhatsApp?: () => void;
}

export function AboutSection({ onOpenWhatsApp }: AboutSectionProps) {
  const stats = [
    { value: "50K+", label: "O-Level & IGCSE Students" },
    { value: "15,000+", label: "Topical Practice Questions" },
    { value: "95%", label: "Cambridge Pass Rate" },
    { value: "10+", label: "Free Study Tools Included" },
  ];

  const pillars = [
    {
      icon: Target,
      title: "Exam-Board Rigor",
      desc: "Every question, mark scheme, and explanation is strictly engineered to official Cambridge CAIE criteria.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: Bot,
      title: "24/7 AI Mark Scheme Guidance",
      desc: "Instant method marking (M1, M2, A1) and Socratic smart hints without expensive $80/hr private tuition.",
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Heart,
      title: "Confidence & Zero Anxiety",
      desc: "Eliminate study stress through structured daily schedules, topic gap analysis, and gamified streaks.",
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: Users,
      title: "Parental Visibility",
      desc: "Simple 6-digit access code for parents to monitor real study time, completed topics, and grade forecasts.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/25 to-background relative overflow-hidden" id="about-us">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-4 h-4" />
            <span>About Us • LevelHubAI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Empowering Cambridge Students to{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Excel Beyond Boundaries
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            LevelHubAI is an advanced learning platform built exclusively for Cambridge IGCSE, O Level, and International A Level students. We bridge the gap between classroom textbooks and official Cambridge mark scheme expectations.
          </p>
        </div>

        {/* Story Callout & Philosophy Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>The Problem We Are Solving</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              Exam Success Requires Exact Method Marks, Not Endless Note-Taking.
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Every year, thousands of capable students prepare for Cambridge examinations by reading textbooks—only to lose crucial marks in the exam hall because they missed specific keywords or failed to structure intermediate derivation steps.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Traditional private tuition costs $300–$800/month, making consistent personalized coaching unaffordable for most families. LevelHubAI provides around-the-clock mark scheme precision, automated revision schedules, and instant step-by-step solutions at a fraction of the cost.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/about">
                <Button variant="outline" className="font-semibold text-xs h-10 px-5">
                  Read Our Full Story
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link to="/subjects">
                <Button className="font-bold text-xs h-10 px-5 shadow-sm">
                  Explore All Subjects
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Highlights Box */}
          <div className="lg:col-span-5 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">Mark Scheme Precision</h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              Covering all syllabus learning outcomes across Mathematics, Sciences, Humanities, and Commerce with real Cambridge mark schemes from 2015 to 2024.
            </p>

            <div className="space-y-2.5 border-t border-border/60 pt-4 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>100% Cambridge CAIE syllabus aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Socratic hints for deeper conceptual mastery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Transparent parent reports with 6-digit link</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-lg transition-all duration-300 space-y-3"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold border ${p.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-foreground">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-muted/40 border border-border/60 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-primary font-mono">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
