import React from "react";
import { Target, ShieldCheck, CheckCircle2, FileText, Layers, Award, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const CambridgeCieAlignedSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden" id="cie-aligned">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase">
            <Target className="w-3.5 h-3.5" />
            <span>Official Syllabus Compliance</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Cambridge CIE Aligned <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Built to Official Mark Scheme Standards
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every question, quiz, and step-by-step solution strictly matches Cambridge Assessment International Education (CAIE) syllabus criteria from 2015 to 2026. Zero fluff, 100% exam-board accuracy.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 4 Architecture Pillars (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: "Official CAIE Command Words",
                desc: "Learn exact examiner requirements for State, Describe, Explain, Calculate, and Evaluate to prevent losing silly marks.",
                color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
              },
              {
                icon: FileText,
                title: "Method Marks Rubric (M1, A1, B1)",
                desc: "Understand step-by-step mark distribution. Gain full method credit even if final arithmetic suffers a minor slip.",
                color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
              },
              {
                icon: Layers,
                title: "2015–2024 Past Paper Archives",
                desc: "Topical and yearly papers covering May/June and Oct/Nov exam sessions across all 3 international variants.",
                color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: BookOpen,
                title: "54 Syllabus-Locked Curriculums",
                desc: "Covers all core O Level, IGCSE & International A Level subjects structured strictly by Cambridge unit codes.",
                color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card border border-border/80 hover:border-teal-500/40 transition-all flex items-start gap-4 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${pillar.color} border flex items-center justify-center font-bold shrink-0`}>
                  <pillar.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
                <Link to="/subjects">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Aligned Cambridge Subjects →
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Simulated Cambridge Mark Scheme Rubric Card (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl space-y-5">
            
            {/* Header: Verified CIE Mark Scheme Card */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>CAIE Mark Scheme Rubric Breakdown</span>
              </div>
              <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-none font-mono text-[10px] font-bold">
                100% CAIE Verified
              </Badge>
            </div>

            {/* Question Header */}
            <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Cambridge IGCSE Physics (0625/42)</span>
                <span>Question 3 [3 Marks]</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                "Explain how gas particles exert pressure on the walls of a container when heated at constant volume."
              </p>
            </div>

            {/* Mark Breakdown List */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Mark 1 (B1): Kinetic Energy & Speed
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">1 Mark</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-5">
                  "Particles gain kinetic energy / move faster at higher temperature."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Mark 2 (B1): Collision Frequency
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">1 Mark</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-5">
                  "Particles collide with walls more frequently / more often per second."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Mark 3 (B1): Force & Pressure Relationship
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">1 Mark</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-5">
                  "Greater change of momentum on impact causes greater average force per unit area."
                </p>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                Mark Scheme Match: 3/3 Full Credit
              </span>
              <span className="font-mono font-bold text-foreground">Variant 2 Validated</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
