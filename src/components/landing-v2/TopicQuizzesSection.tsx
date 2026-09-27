import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, ArrowRight, Zap, Filter, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TopicQuizzesSectionProps {}

export function TopicQuizzesSection({}: TopicQuizzesSectionProps = {}) {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<"math" | "chem" | "bio">("math");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(1);

  const sampleQuestions = {
    math: {
      title: "Cambridge IGCSE Mathematics (0580)",
      topic: "Topic 3.4: Quadratic Equations & The Quadratic Formula",
      difficulty: "Exam Standard",
      question: "Solve the equation 2x² - 7x + 3 = 0. What are the values of x?",
      options: [
        { text: "x = 1 and x = 6", correct: false },
        { text: "x = 3 and x = 0.5", correct: true },
        { text: "x = -3 and x = -0.5", correct: false },
        { text: "x = 2 and x = 1.5", correct: false },
      ],
      explanation: "Using factoring: (2x - 1)(x - 3) = 0. Therefore 2x - 1 = 0 => x = 1/2 (0.5), or x - 3 = 0 => x = 3. Method mark (M1) awarded for correct factorisation or discriminant setup.",
    },
    chem: {
      title: "Cambridge A Level Chemistry (9701)",
      topic: "Topic 6.2: Enthalpy Changes of Hydration",
      difficulty: "Challenging (Grade A*)",
      question: "Which factor primarily explains why the enthalpy change of hydration of Mg²⁺ is significantly more exothermic than that of Ca²⁺?",
      options: [
        { text: "Mg²⁺ has a higher atomic mass", correct: false },
        { text: "Mg²⁺ has a higher charge density and smaller ionic radius", correct: true },
        { text: "Ca²⁺ has more valence electrons", correct: false },
        { text: "Mg²⁺ forms weaker electrostatic attractions with water", correct: false },
      ],
      explanation: "Mg²⁺ and Ca²⁺ both have a 2+ charge, but Mg²⁺ has a much smaller ionic radius (72 pm vs 100 pm). Higher charge density leads to stronger ion-dipole attractions with water molecules, releasing more energy (more exothermic).",
    },
    bio: {
      title: "Cambridge O Level Biology (5090)",
      topic: "Topic 8.1: Transport in Flowering Plants",
      difficulty: "Foundational to Standard",
      question: "Through which tissue are sucrose and amino acids translocated from source leaves to storage sinks?",
      options: [
        { text: "Xylem vessels", correct: false },
        { text: "Phloem sieve tubes", correct: true },
        { text: "Cortex parenchyma", correct: false },
        { text: "Cambium layer", correct: false },
      ],
      explanation: "Phloem tissue translocates organic nutrients (sucrose, amino acids) bidirectionally from source to sink via sieve tube elements and companion cells.",
    },
  };

  const current = sampleQuestions[activeSubject];

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="topic-quizzes">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Targeted Topic Quizzes</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Custom Topic Quizzes Built to{" "}
            <span className="bg-gradient-to-r from-purple-600 via-primary to-pink-500 bg-clip-text text-transparent">
              Maximize Exam Readiness
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Zero wasted time on what you already know. Generate targeted quizzes filtered down to the exact Cambridge subtopic, variant, and difficulty level you need.
          </p>
        </div>

        {/* Interactive Quiz Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Subject Switcher & Highlights */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Syllabus Area</span>
            <div className="space-y-2">
              {[
                { id: "math", name: "Mathematics (0580)", badge: "Algebra & Calculus", color: "border-blue-500/30" },
                { id: "chem", name: "Chemistry (9701)", badge: "Energetics & Kinetics", color: "border-purple-500/30" },
                { id: "bio", name: "Biology (5090)", badge: "Plant Transport & Ecology", color: "border-emerald-500/30" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveSubject(sub.id as any);
                    setSelectedAnswer(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    activeSubject === sub.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card border-border/70 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{sub.name}</span>
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {sub.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Smart Adaptive Engine</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every quiz tracks your error patterns. If you consistently miss 3-mark derivation questions, the system automatically surfaces similar past questions until you achieve 100% mastery.
              </p>
            </div>

            <Button
              onClick={() => navigate("/quiz")}
              className="w-full font-bold shadow-md bg-gradient-to-r from-purple-600 to-primary text-white"
            >
              Start a Custom Quiz Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right Column: Quiz Card Simulator */}
          <div className="lg:col-span-8 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/70">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">{current.title}</span>
                <h4 className="text-base sm:text-lg font-bold text-primary">{current.topic}</h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 self-start sm:self-auto">
                <Filter className="w-3 h-3" />
                {current.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="py-6">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {current.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {current.options.map((opt, idx) => {
                const isChosen = selectedAnswer === idx;
                let optStyle = "bg-muted/30 border-border/60 hover:border-primary/40 hover:bg-muted/60";

                if (selectedAnswer !== null) {
                  if (opt.correct) {
                    optStyle = "bg-emerald-500/10 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-semibold";
                  } else if (isChosen && !opt.correct) {
                    optStyle = "bg-rose-500/10 border-rose-500/60 text-rose-700 dark:text-rose-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-background flex items-center justify-center text-xs font-bold border border-border/70 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt.text}</span>
                    </div>

                    {selectedAnswer !== null && opt.correct && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {selectedAnswer !== null && isChosen && !opt.correct && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant AI Mark Scheme Explanation Reveal */}
            {selectedAnswer !== null && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Cambridge Mark Scheme Feedback & Method Marks</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {current.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
