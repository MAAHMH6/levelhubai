import React from 'react';
import { Users2, ShieldCheck, Printer, CheckCircle2, Lock, Eye, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const ParentMonitoringSection: React.FC = () => {
  return (
    <section id="parent-monitoring" className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Users2 className="w-3.5 h-3.5" />
            Family Peace of Mind
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
            See Exactly What Your Child Is Actually Doing
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Link a parent account to your child and see exactly what they have covered across every subject and every exam board — without having to hover over their shoulder.
          </p>
        </div>

        {/* 2-Column Parent Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Left: What Parents See (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-background border border-border shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Lessons & Topics Completed</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                Monitor syllabus completion rates across Mathematics, Physics, Chemistry, and English with exact chapter timestamps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Quiz & Past Paper Accuracy</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                See scores on timed past papers, mock exams, and topical quizzes with real-time grade projections (A*, A, B...).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Strengths & Vulnerability Alerts</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                Immediate notifications when a sub-topic requires extra revision, so you know where tuition or study effort is needed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border shadow-xs">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Print-Ready Academic Progress Reports</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                Generate clean, official weekly PDF reports detailing study hours and achievements to share with school teachers.
              </p>
            </div>
          </div>

          {/* Right: Parent Dashboard Mockup Visual (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-6 bg-background border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  👨‍👩‍👧
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Parent Live Oversight</div>
                  <div className="text-[10px] text-muted-foreground">Connected to Child Student UID</div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                Live Synced
              </Badge>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground">Weekly Study</div>
                <div className="text-sm font-black font-mono text-foreground mt-0.5">16.2 Hours</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground">Topics Done</div>
                <div className="text-sm font-black font-mono text-emerald-500 mt-0.5">28 Lessons</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground">Predicted Grade</div>
                <div className="text-sm font-black font-mono text-teal-600 mt-0.5">Grade A*</div>
              </div>
            </div>

            {/* Subject Status Rows */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Cambridge O Level Math (4024)</span>
                  <div className="text-[10px] text-muted-foreground">18 past papers solved • 91% accuracy</div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px]">
                  Strength
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">Cambridge Physics (5054)</span>
                  <div className="text-[10px] text-muted-foreground">Needs review on Electromagnetism</div>
                </div>
                <Badge className="bg-rose-500/10 text-rose-600 border-none font-bold text-[10px]">
                  Needs Review
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Section CTAs */}
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
            <Link to="/parent/dashboard">Open Parent Portal Demo</Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm font-bold border-border">
            <Link to="/auth">Link Student Account Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
