import React, { useState } from 'react';
import { BarChart2, Clock, Zap, TrendingUp, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const PerformanceDashboardSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'score' | 'speed'>('score');

  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <BarChart2 className="w-3.5 h-3.5" />
            Dual-Engine Analytics
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Performance Cockpits: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Score Tracking & Exam Speed Analytics
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            Passing Cambridge requires accuracy and speed. Our platform gives you twin diagnostic views to master both method scoring and time management.
          </p>

          {/* Toggle Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-muted/70 border border-border">
            <button
              onClick={() => setActiveTab('score')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'score' ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard 1 — Score Tracking
            </button>
            <button
              onClick={() => setActiveTab('speed')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'speed' ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard 2 — Speed Tracker
            </button>
          </div>
        </div>

        {/* Dashboard 1: Score Tracking View */}
        {activeTab === 'score' && (
          <div className="max-w-5xl mx-auto p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Cockpit View 01</span>
                <h3 className="text-lg font-black text-foreground">Score Tracking & Grade Trajectory</h3>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 font-bold border-none text-xs">
                Real Cambridge Mark Distribution
              </Badge>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Average Mock Score</div>
                <div className="text-2xl font-black text-foreground font-mono mt-1">87.4%</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ +14% this month</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Predicted Grade</div>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">Grade A*</div>
                <div className="text-[10px] text-muted-foreground mt-1">Threshold: 82% min</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Questions Solved</div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">1,420 Qs</div>
                <div className="text-[10px] text-muted-foreground mt-1">Across 18 Past Papers</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Method Mark Rate</div>
                <div className="text-2xl font-black text-emerald-500 font-mono mt-1">94.8%</div>
                <div className="text-[10px] text-muted-foreground mt-1">B1/M1 Rubric Compliant</div>
              </div>
            </div>

            {/* Subject Breakdown Bar */}
            <div className="p-5 rounded-2xl bg-muted/20 border border-border space-y-3 text-xs">
              <div className="font-bold text-foreground">Recent Mock Exam Papers (2024 Series)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-card border border-border flex justify-between items-center">
                  <span>Mathematics (4024/12)</span>
                  <span className="font-mono font-bold text-emerald-500">76 / 80 (A*)</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border flex justify-between items-center">
                  <span>Physics Theory (5054/22)</span>
                  <span className="font-mono font-bold text-teal-600">68 / 75 (A*)</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border flex justify-between items-center">
                  <span>Chemistry Theory (5070/22)</span>
                  <span className="font-mono font-bold text-amber-500">61 / 75 (A)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard 2: Speed Tracker View */}
        {activeTab === 'speed' && (
          <div className="max-w-5xl mx-auto p-7 sm:p-9 rounded-3xl bg-card border border-border shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Cockpit View 02</span>
                <h3 className="text-lg font-black text-foreground">Exam Speed & Pacing Analytics</h3>
              </div>
              <Badge className="bg-purple-500/10 text-purple-600 font-bold border-none text-xs">
                Pacing vs Official Exam Time
              </Badge>
            </div>

            {/* Speed Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Average Time / Question</div>
                <div className="text-2xl font-black text-foreground font-mono mt-1">1m 18s</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">22% faster than average</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Questions Per Minute</div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">0.77 Q/min</div>
                <div className="text-[10px] text-muted-foreground mt-1">Optimal Paper 1 Pacing</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Paper Completion Reserve</div>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">+14 Mins</div>
                <div className="text-[10px] text-muted-foreground mt-1">Left for final checking</div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="text-[10px] text-muted-foreground font-semibold">Speed Improvement</div>
                <div className="text-2xl font-black text-emerald-500 font-mono mt-1">+38%</div>
                <div className="text-[10px] text-muted-foreground mt-1">Over 30 days of timed practice</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-600 shrink-0" />
              <span>
                <strong>Mark Scheme Insight:</strong> Over 40% of Cambridge marks are lost not due to lack of knowledge, but due to rushing the final 3 questions. LevelHubAI pacing drills train you to finish with a minimum 10-minute review buffer.
              </span>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
            <Link to={user ? "/performance" : "/auth?tab=signup"}>
              {user ? "Go to Performance Dashboard →" : "Sign Up Free to View Performance Dashboard →"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
