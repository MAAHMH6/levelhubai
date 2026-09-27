import React, { useState } from "react";
import { BookOpen, Sparkles, RotateCw, Check, ArrowRight, Bookmark, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheatSheetsFlashcardsSectionProps {
  onOpenTools?: () => void;
}

export function CheatSheetsFlashcardsSection({ onOpenTools }: CheatSheetsFlashcardsSectionProps) {
  const [flipped, setFlipped] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const flashcards = [
    {
      subject: "Cambridge IGCSE Physics (0625)",
      topic: "General Physics — Momentum",
      front: "State the principle of conservation of momentum and write the formula.",
      back: "For a closed system with no external forces, total momentum before collision = total momentum after collision.\nFormula: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂",
      examinerTip: "Examiner Tip: You must mention 'in a closed system' or 'no external forces acting' to score the definition mark!",
    },
    {
      subject: "Cambridge O Level Biology (5090)",
      topic: "Enzymes & Metabolism",
      front: "Define an enzyme according to the Cambridge syllabus mark scheme.",
      back: "A biological catalyst that increases the rate of chemical reactions without being changed or used up in the process.",
      examinerTip: "Examiner Tip: 'Protein catalyst' is also accepted, but always include 'not changed or consumed'.",
    },
    {
      subject: "Cambridge A Level Chemistry (9701)",
      topic: "Reaction Kinetics",
      front: "What is the definition of the overall order of a reaction?",
      back: "The sum of the powers to which the concentrations of the reactants are raised in the rate equation.\nExample: For Rate = k[A]²[B], overall order = 2 + 1 = 3.",
      examinerTip: "Examiner Tip: Never confuse reaction order with stoichiometric coefficients!",
    },
  ];

  const current = flashcards[activeCardIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden" id="flashcards-sheets">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Cheat Sheets & Smart Flashcards</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Lock in Definitions & Formulas with{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Active Recall Flashcards
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Cambridge mark schemes are notorious for deducting marks on loose definitions. Master every exact examiner keyword and essential formula effortlessly.
          </p>
        </div>

        {/* Interactive Flashcard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3 Pillar Tools */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all shadow-sm">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="font-bold text-base">Cambridge Formula Sheet Hub</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                One-click access to all official formula sheets for Mathematics, Physics, and Chemistry so you know what is given vs what must be memorized.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all shadow-sm">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h4 className="font-bold text-base">Keyword & Definition Lists</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Every syllabus term tagged with exact mark scheme wording required for 1-mark and 2-mark definition questions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all shadow-sm">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h4 className="font-bold text-base">Spaced Repetition Algorithm</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Cards you find difficult repeat tomorrow; cards you master shift to next week, guaranteeing high retention with minimal study time.
              </p>
            </div>

            {onOpenTools && (
              <Button onClick={onOpenTools} className="w-full sm:w-auto font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                Open Free Formula & Flashcard Hub
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Right Column: Interactive 3D Card Flip */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Card Switcher Pills */}
            <div className="flex items-center gap-2 mb-4">
              {flashcards.map((fc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCardIndex(idx);
                    setFlipped(false);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeCardIndex === idx
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Card {idx + 1}
                </button>
              ))}
            </div>

            {/* Interactive Flip Card */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="w-full max-w-lg min-h-[300px] p-8 rounded-3xl bg-card border-2 border-border hover:border-amber-500/50 shadow-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 relative group select-none"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-4">
                  <span className="text-primary font-bold">{current.subject}</span>
                  <span className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to flip
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/80 block mb-3 font-mono">{current.topic}</span>

                {!flipped ? (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Question / Prompt</span>
                    <p className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                      {current.front}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Cambridge Mark Scheme Answer</span>
                    <p className="text-base sm:text-lg font-medium text-foreground whitespace-pre-line leading-relaxed">
                      {current.back}
                    </p>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                      {current.examinerTip}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
                <span>{flipped ? "Showing Mark Scheme Answer" : "Tap card to reveal answer"}</span>
                <span className="text-primary font-bold">LevelHubAI Recall Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
