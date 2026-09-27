import React, { useState } from "react";
import { Bot, Sparkles, MessageSquare, Lightbulb, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";

interface AITutorFeatureSectionProps {}

export function AITutorFeatureSection({}: AITutorFeatureSectionProps = {}) {
  const [hintStep, setHintStep] = useState(1);

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden" id="ai-tutor">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Bot className="w-3.5 h-3.5" />
            <span>24/7 AI Cambridge Study Tutor</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            An Elite Cambridge AI Tutor{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              in Your Pocket, 24/7
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Stuck at 11 PM on an organic chemistry mechanism or a pure math integration question? Get instant, step-by-step guidance trained strictly on official Cambridge mark schemes.
          </p>
        </div>

        {/* AI Tutor Chat & Capabilities Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: AI Capabilities (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Smart Hints, Not Spoilers</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rather than dumping the final answer, our AI provides progressive Socratic nudges so you genuinely understand the underlying method.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Strict Cambridge Mark Scheme Logic</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Flags missing keywords, units, and intermediate working so you never lose easy method marks (M1, A1, B1) in the exam hall.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Always Patient, Always Available</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask the same concept 10 times in 10 different ways. No judgment, no expensive hourly tutor rates, instant response anytime.
              </p>
            </div>

            <Button asChild className="w-full sm:w-auto font-bold shadow-md">
              <Link to="/auth">
                Start Studying Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right Column: Live AI Interactive Chat Dialogue Mockup (7 cols) */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">LevelHubAI Cambridge Tutor</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Trained on 2015-2024 Past Papers
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                Math 9709
              </span>
            </div>

            {/* Chat Flow */}
            <div className="space-y-4 py-2">
              {/* Student Message */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] rounded-2xl p-4 bg-primary text-primary-foreground text-xs sm:text-sm">
                  <p className="font-medium">
                    "I'm stuck on this 4-mark question: Find ∫ x·e^(2x) dx. I tried multiplying integrals but it doesn't match the answer."
                  </p>
                </div>
              </div>

              {/* AI Tutor Response with Progressive Hint Button */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[88%] space-y-2">
                  <div className="rounded-2xl p-4 bg-muted/60 border border-border/70 text-xs sm:text-sm space-y-2">
                    <p className="text-foreground">
                      Great question! Notice that <strong>x·e^(2x)</strong> is a product of two distinct algebraic and exponential terms. You cannot integrate terms separately.
                    </p>
                    <p className="text-muted-foreground">
                      {hintStep === 1 && (
                        <span>
                          💡 <strong>Hint 1:</strong> In Cambridge 9709 Pure Math 3, when you have an algebraic term multiplied by an exponential, you must use <em>Integration by Parts</em>: <code>∫ u·(dv/dx) dx = uv - ∫ v·(du/dx) dx</code>.
                        </span>
                      )}
                      {hintStep >= 2 && (
                        <span>
                          💡 <strong>Hint 2:</strong> Set <code>u = x</code> (so <code>du/dx = 1</code>) and <code>dv/dx = e^(2x)</code> (so <code>v = (1/2)e^(2x)</code>).
                        </span>
                      )}
                      {hintStep >= 3 && (
                        <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✅ <strong>Method Marks:</strong> <code>uv - ∫ v = (1/2)x·e^(2x) - (1/4)e^(2x) + C</code>.
                        </span>
                      )}
                    </p>
                  </div>

                  {hintStep < 3 && (
                    <button
                      onClick={() => setHintStep(hintStep + 1)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pl-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Reveal Next Hint ({hintStep}/3)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <span>Instant step-by-step guidance</span>
              <span className="text-primary font-semibold">Ask another question anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
