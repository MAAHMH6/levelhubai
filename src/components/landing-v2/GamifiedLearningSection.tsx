import React from "react";
import { Gamepad2, Flame, Trophy, Zap, Award, Sparkles, CheckCircle2, ArrowRight, Star, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const GamifiedLearningSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden" id="gamification">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Gamified Cambridge Revision</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Gamified O-Level & IGCSE Learning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              Study Like a Game, Score Like a Pro
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Turn tedious exam revision into an engaging daily routine. Earn XP with every solved past paper question, maintain daily study streaks, unlock prestigious badges, and compete on live peer leaderboards.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Feature Highlights (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-background border border-border/80 hover:border-emerald-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Earn XP & Level Up</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Score +25 to +100 XP per question. Multi-part Cambridge past paper questions offer bonus multipliers when solved with step-by-step accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-background border border-border/80 hover:border-amber-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Daily Streak Challenge</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Maintain your daily revision streak to earn weekly milestone chests, streak freeze shields, and exclusive seasonal profile badges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-background border border-border/80 hover:border-cyan-500/40 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">1v1 Quiz Battles & Study Groups</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Challenge friends or study group peers to 5-minute timed syllabus battles. Compete on speed, accuracy, and method precision.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm px-7 shadow-sm">
                <Link to="/quiz-setup">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Earning XP Free →
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm px-6 font-semibold">
                <Link to="/challenges">
                  View Study Battles
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Simulated Live Gamification Console (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-background border border-border shadow-2xl space-y-6">
            
            {/* Header: Student Tier Status */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                  14
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Cambridge Master Tier</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      Top 2%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">12,450 / 15,000 XP to Tier 15</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-black text-amber-500 flex items-center gap-1 justify-end">
                  <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
                  <span>14 Day Streak</span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground font-semibold">
                <span>Current Tier Progress</span>
                <span>83%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden p-0.5 border border-border">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-500" style={{ width: '83%' }} />
              </div>
            </div>

            {/* 7-Day Streak Tracker */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Weekly Daily Practice Streak
                </span>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                  +500 Bonus XP Ready
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[
                  { day: 'Mon', completed: true },
                  { day: 'Tue', completed: true },
                  { day: 'Wed', completed: true },
                  { day: 'Thu', completed: true },
                  { day: 'Fri', completed: true },
                  { day: 'Sat', completed: true },
                  { day: 'Sun', completed: true, today: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      item.completed
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    <div className="text-[10px] font-medium">{item.day}</div>
                    <Flame className={`w-3.5 h-3.5 mx-auto mt-1 ${item.completed ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Unlocked Badges Showcase */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Recent Unlocked Badges
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: '100 Past Papers', icon: '📜', color: 'border-blue-500/30 bg-blue-500/5' },
                  { name: 'Pure Math Ace', icon: '📐', color: 'border-emerald-500/30 bg-emerald-500/5' },
                  { name: 'Lightning Speed', icon: '⚡', color: 'border-amber-500/30 bg-amber-500/5' },
                  { name: 'A* Predictor', icon: '👑', color: 'border-purple-500/30 bg-purple-500/5' },
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${badge.color} text-center space-y-1 hover:scale-105 transition-transform`}
                  >
                    <div className="text-xl">{badge.icon}</div>
                    <div className="text-[11px] font-bold text-foreground leading-tight">{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
