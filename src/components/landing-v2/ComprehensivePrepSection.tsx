import React from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  Video,
  FileText,
  FileCheck2,
  TrendingUp,
  Trophy,
  Compass,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PREP_FEATURES = [
  {
    icon: Bot,
    title: 'AI Feedback on Every Attempt',
    desc: 'Instant step-by-step diagnostic feedback on every numerical problem or theory answer according to official mark schemes.',
    color: '#0D9488',
  },
  {
    icon: Compass,
    title: 'Adaptive Learning Paths',
    desc: 'The algorithm automatically tunes difficulty and practice pace based on your strengths and historical quiz mistakes.',
    color: '#0284C7',
  },
  {
    icon: FileCheck2,
    title: 'Timed Mock Exams',
    desc: 'Full exam simulations with strict countdown clocks and historical Cambridge threshold grade boundary tables.',
    color: '#8B5CF6',
  },
  {
    icon: Video,
    title: 'Curated Video Lessons',
    desc: 'Concise, high-yield concept breakdowns mapped unit-by-unit to official Cambridge learning objectives.',
    color: '#EA580C',
  },
  {
    icon: FileText,
    title: 'Syllabus-Aligned Lesson Notes',
    desc: 'Downloadable summary revision sheets with verified definitions, labeled scientific diagrams, and formula sheets.',
    color: '#10B981',
  },
  {
    icon: Sparkles,
    title: 'Interactive AI Quizzes',
    desc: 'Topic-level diagnostic tests generating authentic Cambridge MCQs, structured questions, and evaluation problems.',
    color: '#F59E0B',
  },
  {
    icon: Brain,
    title: '24/7 AI Tutor',
    desc: 'Available around the clock to answer complex doubts, clarify past paper steps, and review essay drafts.',
    color: '#6366F1',
  },
  {
    icon: TrendingUp,
    title: 'Diagnostic Progress Tracking',
    desc: 'Real-time performance dashboards tracking topic completion percentages, accuracy metrics, and predicted exam grades.',
    color: '#06B6D4',
  },
  {
    icon: Trophy,
    title: 'Gamification & Streaks',
    desc: '25 unlockable Cambridge badges, daily XP multipliers, and school rivalry leaderboards to make prep rewarding.',
    color: '#E11D48',
  },
];

export const ComprehensivePrepSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            Complete Academic Ecosystem
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            The World's Most <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Comprehensive Exam Prep System
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
            From foundational understanding to timed exam mastery. Supported across all premier qualifications:
          </p>

          {/* Supported Qualifications Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {['Cambridge IGCSE', 'Cambridge O Level', 'Cambridge AS Level', 'Cambridge A Level'].map((board) => (
              <span
                key={board}
                className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-xs font-extrabold text-foreground shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>{board}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 9 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PREP_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-card border border-border hover:border-teal-500/40 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: feature.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
