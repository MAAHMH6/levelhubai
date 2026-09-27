import React from 'react';
import { ShieldCheck, Bot, CheckCircle2, Clock, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const COACH_DUTIES = [
  { step: '01. Prepare', text: 'Build syllabus-locked study schedules and master core definitions before attempting papers.' },
  { step: '02. Practice', text: 'Simulate realistic exam scenarios with strict time limits, formula sheets, and calculator restrictions.' },
  { step: '03. Review', text: 'Break down every incorrect attempt with official Cambridge mark scheme rubrics and method marks.' },
  { step: '04. Identify Mistakes', text: 'Categorize errors into arithmetic slips, misread command words, or fundamental knowledge deficits.' },
  { step: '05. Improve Performance', text: 'Generate targeted recovery drills that directly turn low-scoring subtopics into guaranteed marks.' },
  { step: '06. Build Exam Confidence', text: 'Walk into your official exam hall knowing you have already solved 10+ years of verified past questions.' },
];

export const ExamCoachSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text & Coach Duties (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase">
              <Bot className="w-3.5 h-3.5" />
              Personal AI Mentorship
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
                Cambridge Exam Coach
              </span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              Think of LevelHubAI as your tireless AI coach by your side. Guiding your preparation, correcting your method, catching subtle traps, and building unshakeable exam hall confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {COACH_DUTIES.map((duty, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-background border border-border">
                  <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400 mb-1">
                    {duty.step}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{duty.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
                <Link to="/ai-tutor">Start Working With Your Coach Free →</Link>
              </Button>
            </div>
          </div>

          {/* Right Realistic Exam Visual Simulation (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-7 bg-background border border-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Simulated Cambridge Hall Examination</span>
              </div>
              <Badge className="bg-rose-500/10 text-rose-600 border-none font-mono text-[10px] font-bold">
                Time Left: 24m 10s
              </Badge>
            </div>

            {/* Exam Question Card */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3 text-xs">
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>Question 4 (b) [4 Marks]</span>
                <span>Physics 5054/22</span>
              </div>
              <p className="text-foreground font-medium leading-relaxed">
                "A car of mass 1200kg accelerates uniformly from rest to 24m/s in 8.0s. Calculate the resultant forward driving force acting on the car."
              </p>
            </div>

            {/* Coach Intervention Tip */}
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-extrabold">
                <Bot className="w-4 h-4" />
                <span>Coach Guidance On Pacing & Method:</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                "Remember: Always state the formula first (a = Δv / t) for the M1 method mark. Then apply F = ma for the second M1 mark before final arithmetic (A1)."
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Method Verified: 4/4 Full Credit
              </span>
              <span className="font-mono font-bold text-foreground">+50 XP Earned</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
