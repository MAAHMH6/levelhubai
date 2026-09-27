import React from "react";
import { Users, Heart, Sparkles, MessageCircle, ShieldCheck, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";

interface MissionSectionProps {
  onOpenWhatsApp?: () => void;
}

export function MissionSection({ onOpenWhatsApp }: MissionSectionProps) {
  const pillars = [
    {
      icon: Users,
      tag: "Your Goals",
      title: "Built Around Your Ambition",
      desc: "Whether you're aiming for top A* grades for Cambridge Medicine or pushing up from a C to an A in your mocks, your path is customized to your exact syllabus and pace.",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      icon: Sparkles,
      tag: "Our Mission",
      title: "Democratizing Elite Tutoring",
      desc: "World-class Cambridge coaching shouldn't cost $100/hr. We bring AI mark scheme insights, instant step-by-step marking, and 24/7 personalized coaching to every student globally.",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      icon: Heart,
      tag: "We're On Your Team",
      title: "Zero Pressure, Pure Progress",
      desc: "Exams can be overwhelming. LevelHubAI is built to eliminate study anxiety with gentle hints, non-judgmental explanations, and steady confidence-building practice.",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      icon: MessageCircle,
      tag: "Real Talk",
      title: "Direct Mark Scheme Logic",
      desc: "No fluff. No generic summaries. Only exact mark scheme criteria, syllabus tips, common student pitfalls, and the exact steps needed to secure every method mark.",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Community & Mission</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            We're More Than <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">Just Grades</span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Your Goals. Our Mission. We're On Your Team. Real Talk. We empower learners with the tools, clarity, and mindset to conquer exams and build lifelong mastery.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-card/80 border border-border/80 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-foreground group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${pillar.badgeColor}`}>
                    {pillar.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Community Stat banner */}
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-semibold text-sm">
              <Trophy className="w-4 h-4" />
              <span>A Supportive Global Community</span>
            </div>
            <h4 className="text-2xl font-bold">Need a study plan tailored for your target exams?</h4>
            <p className="text-muted-foreground text-sm max-w-xl">
              Talk directly with our academic mentors and see how LevelHubAI fits into your weekly schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              asChild
              className="font-bold shadow-md hover:shadow-primary/25 transition-all"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            {onOpenWhatsApp && (
              <Button
                onClick={onOpenWhatsApp}
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
                Chat on WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
