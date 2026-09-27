import React from 'react';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Award, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const StrengthsWeakSpotsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Target className="w-3.5 h-3.5" />
            Diagnostic Deep-Dive
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Strengths & Weak Spots: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Pinpoint Every Mark Lost Before Exam Day
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Stop studying what you already know. Our diagnostic engine maps your subtopic mastery, full quiz history, and exact weak areas across every Cambridge subject.
          </p>
        </div>

        {/* 2-Column Strengths vs Weak Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Identified Strengths */}
          <div className="p-7 rounded-3xl bg-card border border-emerald-500/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-extrabold text-foreground">Verified Strengths (90%+ Accuracy)</h3>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 font-mono text-[10px] font-bold border-none">
                Exam Ready
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-foreground">Algebraic Quadratics & Sequences</span>
                  <span className="text-emerald-500 font-mono">96%</span>
                </div>
                <Progress value={96} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Completed 42 past paper questions without calculation error. Method marks fully secured.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-foreground">Newton's Laws & Momentum (Physics)</span>
                  <span className="text-emerald-500 font-mono">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Formula substitution and vector components consistently correct across 2018–2024 series.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Identified Weak Spots */}
          <div className="p-7 rounded-3xl bg-card border border-rose-500/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-extrabold text-foreground">Weak Spots Requiring Practice</h3>
              </div>
              <Badge className="bg-rose-500/15 text-rose-600 font-mono text-[10px] font-bold border-none">
                Priority Review
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-foreground">Electrolysis Half-Equations (Chemistry)</span>
                  <span className="text-rose-500 font-mono">48%</span>
                </div>
                <Progress value={48} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Frequent marks lost on state symbols and electron balance at the cathode. Auto-drill queued.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="flex justify-between font-bold mb-1.5">
                  <span className="text-foreground">Trigonometric Bearings (Math 4024/0580)</span>
                  <span className="text-rose-500 font-mono">54%</span>
                </div>
                <Progress value={54} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Angle subtraction from north line missed in 3 consecutive past papers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
