import React from "react";
import { ShieldCheck, CheckCircle2, XCircle, Zap, Sparkles, Star, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TrustValueSectionProps {
  onOpenWhatsApp?: () => void;
}

export function TrustValueSection({ onOpenWhatsApp }: TrustValueSectionProps) {
  const comparisonRows = [
    {
      feature: "Cost per month",
      traditional: "$300 - $800+ / mo ($60-$100/hr)",
      levelhub: "Affordable flat subscription or free start",
      highlight: true,
    },
    {
      feature: "Availability",
      traditional: "1-2 hours per week by appointment",
      levelhub: "24/7 unlimited on-demand assistance",
      highlight: false,
    },
    {
      feature: "Cambridge Syllabus Matching",
      traditional: "Depends heavily on individual tutor memory",
      levelhub: "100% indexed to official Cambridge codes & past papers",
      highlight: true,
    },
    {
      feature: "Instant Step-by-Step Marking",
      traditional: "Days to get homework marked",
      levelhub: "Instant AI mark scheme feedback with method marks",
      highlight: false,
    },
    {
      feature: "Parent Activity & Progress Reports",
      traditional: "Occasional brief verbal updates",
      levelhub: "Live 6-digit dashboard & weekly printable breakdowns",
      highlight: true,
    },
    {
      feature: "Free Study Tools Included",
      traditional: "None (must buy textbooks/workbooks)",
      levelhub: "Free tools: Timetables, Past Papers, Formula Sheets, etc.",
      highlight: false,
    },
  ];

  const trustBadges = [
    {
      icon: ShieldCheck,
      title: "Verified High-Quality Study",
      desc: "Trained strictly on official Cambridge mark schemes and syllabus standards.",
    },
    {
      icon: Zap,
      title: "Serious Value",
      desc: "Get 10x more practice reps and feedback for a fraction of private tuition fees.",
    },
    {
      icon: Award,
      title: "Exam-Board Proven",
      desc: "Covers 19 IGCSE, 17 O Level, and 18 A Level official subject syllabi.",
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Serious Value</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Why Pay More When You Can{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-primary to-blue-600 bg-clip-text text-transparent">
              Get More?
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Experience verified high-quality self-study built for Cambridge excellence. Real syllabus rigor, around-the-clock guidance, zero compromise.
          </p>
        </div>

        {/* Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xl mb-12">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-muted/50 via-card to-muted/50 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Traditional Tuition vs LevelHubAI</h3>
              <p className="text-muted-foreground text-sm mt-1">See how our AI learning ecosystem stacks up against conventional private tutoring.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold self-start sm:self-auto">
              <Star className="w-3.5 h-3.5 fill-primary" />
              10x Practice Volume
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="py-4 px-6 font-semibold text-foreground">Feature</th>
                  <th className="py-4 px-6 font-semibold text-muted-foreground">Traditional Private Tuition</th>
                  <th className="py-4 px-6 font-bold text-primary bg-primary/5">LevelHubAI Self-Study Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{row.feature}</td>
                    <td className="py-4 px-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500/70 shrink-0" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 font-medium bg-primary/5 ${row.highlight ? "text-primary font-bold" : "text-foreground"}`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{row.levelhub}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto font-bold shadow-lg hover:shadow-primary/25 h-12 px-8 text-base"
          >
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          {onOpenWhatsApp && (
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenWhatsApp}
              className="w-full sm:w-auto h-12 px-8 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-base"
            >
              Ask Questions on WhatsApp
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
