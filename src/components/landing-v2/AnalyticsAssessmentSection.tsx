import React from "react";
import { BarChart3, TrendingUp, Target, Award, CheckCircle2, ArrowRight, Zap, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AnalyticsAssessmentSectionProps {}

export function AnalyticsAssessmentSection({}: AnalyticsAssessmentSectionProps = {}) {
  const subtopicMetrics = [
    { name: "Algebra & Polynomials", mastery: 94, status: "Mastered", color: "bg-emerald-500" },
    { name: "Organic Synthesis & Mechanisms", mastery: 62, status: "Needs Review", color: "bg-amber-500" },
    { name: "Circular Motion & Gravitation", mastery: 88, status: "Strong", color: "bg-blue-500" },
    { name: "Ecology & Genetic Engineering", mastery: 91, status: "Mastered", color: "bg-emerald-500" },
    { name: "Microeconomics & Elasticity", mastery: 58, status: "Priority Gap", color: "bg-rose-500" },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="analytics-assessment">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Deep Analytics & Assessment Engine</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Continuous Improvement Powered by{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              Real Exam Analytics
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            See exactly where every mark is won or lost. LevelHubAI continuously assesses your speed, accuracy, and subtopic mastery, projecting your realistic Cambridge grade band.
          </p>
        </div>

        {/* Analytics Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Metric Cards & Assessment Highlights (5 cols) */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Projected Cambridge Grade</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Top 5% Band
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-foreground">Grade A*</span>
                  <span className="text-sm font-semibold text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +14% since mock 1
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculated against Cambridge CAIE June 2024 boundary curves across your completed past papers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Exam Pace Efficiency</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Optimal Pace
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-foreground">58 sec / mark</span>
                  <span className="text-xs text-muted-foreground">(Allowed: 72 sec / mark)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leaves you with a 15-minute buffer at the end of paper 4 for checking derivation answers.
                </p>
              </div>
            </div>

            <Button asChild className="w-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link to="/auth">
                Unlock My Diagnostic Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right Column: Interactive Subtopic Mastery Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Continuous Progress Matrix
                  </span>
                  <h4 className="text-lg font-bold text-foreground">Subtopic Accuracy & Knowledge Gaps</h4>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Live Synced</span>
              </div>

              <div className="space-y-4">
                {subtopicMetrics.map((topic, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground font-semibold">{topic.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono">{topic.mastery}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          topic.mastery >= 90
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : topic.mastery >= 75
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {topic.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${topic.color}`}
                        style={{ width: `${topic.mastery}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Callout Bar */}
            <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Adaptive revision drills automatically target your 2 lowest subtopics
              </span>
              <span className="font-bold text-foreground">5 Subtopics Audited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
