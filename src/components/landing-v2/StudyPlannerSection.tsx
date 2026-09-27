import React, { useState } from "react";
import { Calendar, Clock, CheckCircle2, ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface StudyPlannerSectionProps {}

export function StudyPlannerSection({}: StudyPlannerSectionProps = {}) {
  const [selectedPace, setSelectedPace] = useState<"intense" | "balanced" | "steady">("balanced");

  const paceSchedules = {
    intense: [
      { day: "Monday", task: "Physics 0625: Thermal Physics past paper drill", time: "60 mins", done: true },
      { day: "Tuesday", task: "Math 0580: Differentiation & Vectors revision", time: "75 mins", done: true },
      { day: "Wednesday", task: "Chemistry 0620: Organic Reactions timed quiz", time: "60 mins", done: false },
      { day: "Thursday", task: "Full Paper 2 Timed AI Mock & Error Log review", time: "90 mins", done: false },
    ],
    balanced: [
      { day: "Monday", task: "Pure Math 9709: Integration by Parts & 5 questions", time: "45 mins", done: true },
      { day: "Wednesday", task: "Chemistry 9701: Energetics & Born-Haber cycle", time: "45 mins", done: false },
      { day: "Friday", task: "Biology 9700: Cell Signaling past paper questions", time: "40 mins", done: false },
      { day: "Saturday", task: "Weekly AI Diagnostic quiz & topic gap analysis", time: "50 mins", done: false },
    ],
    steady: [
      { day: "Tue & Thu", task: "O Level Math 4024: Geometry & Trigonometry focus", time: "30 mins", done: true },
      { day: "Saturday", task: "O Level Physics 5054: Waves & Optics video lessons", time: "35 mins", done: false },
      { day: "Sunday", task: "Flashcards revision & Formula Sheet quick test", time: "25 mins", done: false },
    ],
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden" id="study-planner">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>AI Study Planner & Timetable</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop Guessing What to Revise.{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Follow a Precision Schedule.
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Our AI Study Planner analyzes your Cambridge exam dates, current syllabus weak spots, and target grade to build an automated day-by-day revision roadmap.
          </p>
        </div>

        {/* Interactive Planner Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Cambridge Exam Countdown</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Syncs with May/June and Oct/Nov official Cambridge session dates, calculating dynamic daily targets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Topic Past Paper Planner</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically matches scheduled study sessions with specific paper variants and past questions that need practice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Adapts When Life Happens</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Miss a day? The AI automatically redistributes the workload smoothly so you never feel stressed or hopelessly behind.
              </p>
            </div>

            <Button asChild className="w-full sm:w-auto font-bold shadow-md">
              <Link to="/auth">
                Build My Free Study Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right Column: Live Interactive Planner Simulator */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl relative backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Revision Plan</span>
                <h4 className="text-xl font-bold text-foreground">Next 7 Days Roadmap</h4>
              </div>

              {/* Pace Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedPace("steady")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPace === "steady" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Steady
                </button>
                <button
                  onClick={() => setSelectedPace("balanced")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPace === "balanced" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Balanced
                </button>
                <button
                  onClick={() => setSelectedPace("intense")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPace === "intense" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Intensive (Exam Season)
                </button>
              </div>
            </div>

            {/* Schedule List */}
            <div className="py-6 space-y-3.5">
              {paceSchedules[selectedPace].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    item.done
                      ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                      : "bg-muted/30 border-border/60 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        item.done ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/30 text-transparent"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary font-mono">{item.day}</span>
                        {item.done && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mt-0.5">{item.task}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-muted-foreground shrink-0 bg-background/80 px-2.5 py-1 rounded-md border border-border/40">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom summary bar */}
            <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Updated in real-time based on your quiz accuracy
              </span>
              <span className="font-semibold text-primary">Syllabus on track: 88%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
