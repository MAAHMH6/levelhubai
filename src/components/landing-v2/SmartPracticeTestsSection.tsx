import React from 'react';
import { Target, Zap, TrendingUp, AlertTriangle, Compass, Sparkles, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SMART_PILLARS = [
  {
    icon: TrendingUp,
    badge: 'Pillar 01',
    title: 'Your Future Grade',
    desc: 'Continuous performance-based grade projection that calculates where you stand against official Cambridge grade boundaries (A*, A, B, C) based on real test attempts.',
    accent: 'border-teal-500/30 text-teal-600 dark:text-teal-400',
    color: '#0D9488',
  },
  {
    icon: Zap,
    badge: 'Pillar 02',
    title: 'Your Superpower',
    desc: 'Discovers the specific subtopics where you naturally excel and score 90%+ with rapid solving speed, so you build unshakeable confidence in core sections.',
    accent: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    color: '#10B981',
  },
  {
    icon: AlertTriangle,
    badge: 'Pillar 03',
    title: 'Weak Spots',
    desc: 'Immediately surfaces hidden deficits, misread command words, and calculation slips so you can eliminate errors before mock exams and finals.',
    accent: 'border-rose-500/30 text-rose-600 dark:text-rose-400',
    color: '#E11D48',
  },
  {
    icon: Compass,
    badge: 'Pillar 04',
    title: 'Your Personal Study Roadmap',
    desc: 'A dynamic, automated study timeline tailored to your exam session (May/June or Oct/Nov), daily available hours, weak topics, and progress history.',
    accent: 'border-purple-500/30 text-purple-600 dark:text-purple-400',
    color: '#8B5CF6',
  },
];

export const SmartPracticeTestsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Target className="w-3.5 h-3.5" />
            Outcome-Driven Testing
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
            Smart Practice Tests <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              That Actually Help
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Standard past paper testing gives you a score and nothing else. LevelHubAI diagnostics reveal your future grade, your academic superpowers, and your exact revision roadmap.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {SMART_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="p-7 rounded-3xl bg-background border border-border hover:border-teal-500/40 transition-all duration-300 shadow-sm hover:shadow-xl group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: pillar.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${pillar.accent}`}>
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
            <Link to="/quiz-setup">Take Your First Diagnostic Test Free →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
