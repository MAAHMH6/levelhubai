import React from 'react';
import { Lightbulb, CheckSquare, Sparkles, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const StepByStepSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Visual Interactive Working (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-7 bg-card border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-foreground">Step-by-Step Solution Breakdown</span>
              <Badge className="bg-emerald-500/15 text-emerald-600 font-mono text-[10px] font-bold border-none">
                3 / 3 Marks
              </Badge>
            </div>

            {/* Problem Statement */}
            <div className="p-3.5 rounded-xl bg-muted/40 text-xs font-medium text-foreground">
              Solve the quadratic equation: <strong>2x² - 7x + 3 = 0</strong>
            </div>

            {/* Steps List */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <div>
                  <div className="font-bold text-foreground">Factorization / Formula Setup (M1 Mark)</div>
                  <div className="text-muted-foreground font-mono text-[11px] mt-0.5">(2x - 1)(x - 3) = 0</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <div>
                  <div className="font-bold text-foreground">First Root Derivation (A1 Mark)</div>
                  <div className="text-muted-foreground font-mono text-[11px] mt-0.5">2x - 1 = 0 → 2x = 1 → x = 0.5</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <div>
                  <div className="font-bold text-foreground">Second Root Derivation (A1 Mark)</div>
                  <div className="text-muted-foreground font-mono text-[11px] mt-0.5">x - 3 = 0 → x = 3</div>
                </div>
              </div>
            </div>

            {/* Smart Hint Widget */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Smart Hint That Actually Helps</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  "Stuck? Look for two numbers that multiply to a·c (2 · 3 = 6) and add up to b (-7). Those numbers are -6 and -1."
                </p>
              </div>
            </div>
          </div>

          {/* Right Text (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Method Over Memorization
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Step-by-Step Solutions & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
                Smart Hints That Guide You
              </span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              Seeing just the final answer tells you nothing when you are stuck. LevelHubAI reveals the complete logical journey behind every problem.
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>Learn the Method, Not Just The Output:</strong> Understand every algebraic transformation and scientific reasoning step.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>Adaptive Scaffolding:</strong> Hints don't spoil the answer immediately; they nudge your thought process in the right direction.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>CIE Method Marks Secured:</strong> Guarantee you earn M1 method marks even under timed pressure.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm px-8">
                <Link to="/past-papers">Try Step-by-Step Past Papers Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
