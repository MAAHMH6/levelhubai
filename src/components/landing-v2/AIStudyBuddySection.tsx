import React from 'react';
import { BrainCircuit, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, Bot, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const STUDY_BUDDY_PILLARS = [
  {
    title: 'Performance Analysis',
    desc: 'Continuously monitors your solving speed, step accuracy, and common error patterns across every paper attempt.',
  },
  {
    title: 'Personalized Feedback',
    desc: 'Provides immediate constructive examiner critiques pointing out precisely where you lost method marks.',
  },
  {
    title: 'Weak-Topic Identification',
    desc: 'Locates hidden knowledge deficits (e.g. Organic Isomerism, Circular Motion) before they cost you on mock day.',
  },
  {
    title: 'Adaptive Recommendations',
    desc: 'Dynamically curates high-yield practice questions targeted exactly at your diagnostic vulnerability points.',
  },
  {
    title: 'Exam Preparation Guidance',
    desc: 'Advises on exam pacing, question selection strategy, and time allocation per mark under timed pressure.',
  },
  {
    title: 'Personalized Study Roadmap',
    desc: 'Builds a day-by-day revision calendar counting down directly to your official Cambridge exam date.',
  },
];

export const AIStudyBuddySection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            Autonomous Intelligence
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
            See Your AI Study Buddy in Action
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Our AI analyzes your performance and gives you personalized guidance. Never wonder what to study next — your study buddy analyzes your data to chart the fastest route to an A*.
          </p>
        </div>

        {/* Interactive Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left: Interactive Simulated AI Buddy Console (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-background border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold text-foreground">LevelHubAI Study Buddy Engine</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 font-mono">
                Active Analysis
              </Badge>
            </div>

            {/* Simulated Live Insight Card */}
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Diagnostic Finding</span>
                <span className="text-[10px] font-mono font-bold text-amber-500">Alert Generated</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                "In Mathematics (0580 / 4024), you answered 8/8 questions correctly in Algebra, but missed 2 marks on Trigonometry Bearings due to 2-digit angle notation. Cambridge requires 3 digits (e.g. 045°)."
              </p>
            </div>

            {/* Prescribed Action */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="text-xs font-bold text-foreground">Adaptive Recovery Recommendation</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Prescribed drill: 5 Topical Bearing Questions</span>
                <span className="font-mono text-teal-600 font-bold">Estimated: 12 Mins</span>
              </div>
              <Button asChild size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold mt-2">
                <Link to="/quiz-setup">Launch Recovery Drill Now →</Link>
              </Button>
            </div>
          </div>

          {/* Right: 6 Supporting Feature Points (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            {STUDY_BUDDY_PILLARS.map((pillar, i) => (
              <div key={i} className="p-4 rounded-2xl bg-background border border-border hover:border-teal-500/30 transition-all shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{pillar.title}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
