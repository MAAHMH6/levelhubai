import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const FREE_SUBJECTS = [
  {
    name: 'Physics',
    codes: '5054 / 0625 / 9702',
    desc: 'Complete topical revision notes, formula sheets, interactive motion graphs, and past paper video solutions.',
    cta: 'Start Learning Physics',
    color: '#8B5CF6',
    route: '/subjects?code=5054',
  },
  {
    name: 'Mathematics',
    codes: '4024 / 0580 / 9709',
    desc: 'Over 2,000+ auto-graded Cambridge MCQs, calculus method guides, trigonometry formula sheets, and mock tests.',
    cta: 'Start Learning Mathematics',
    color: '#0D9488',
    route: '/subjects?code=4024',
  },
  {
    name: 'Chemistry',
    codes: '5070 / 0620 / 9701',
    desc: 'Electrolysis half-equation builders, organic chemistry mechanism maps, and practical test notes.',
    cta: 'Start Learning Chemistry',
    color: '#06B6D4',
    route: '/subjects?code=5070',
  },
  {
    name: 'Biology',
    codes: '5090 / 0610 / 9700',
    desc: 'High-yield labeled biological diagrams, genetic cross calculators, and physiological process summaries.',
    cta: 'Start Learning Biology',
    color: '#10B981',
    route: '/subjects?code=5090',
  },
  {
    name: 'English Language',
    codes: '1123 / 0500 / 9093',
    desc: 'Directed writing sample Band 8 essays, reading comprehension question guides, and summary writing templates.',
    cta: 'Start Learning English Language',
    color: '#2563EB',
    route: '/subjects?code=1123',
  },
  {
    name: 'Computer Science',
    codes: '2210 / 0478 / 9618',
    desc: 'Pseudocode algorithm guides, logic gate truth table simulators, and computer architecture notes.',
    cta: 'Start Learning Computer Science',
    color: '#6366F1',
    route: '/subjects?code=2210',
  },
];

export const FreeResourcesSection: React.FC = () => {

  return (
    <>
      <section id="free-resources" className="py-24 relative bg-card border-y border-border overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Zero Paywalls • No Sign-Up Required
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
              Free IGCSE, O Level & A-Level Resources
            </h2>

            <div className="text-lg sm:text-xl font-extrabold text-foreground mb-2">
              All Resources Are Completely Free
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No hidden costs. No sign-up required. Start learning right away and transform your grades with official Cambridge syllabus study materials.
            </p>
          </div>

          {/* Subjects Grid with Custom CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {FREE_SUBJECTS.map((sub, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-background border border-border hover:border-teal-500/40 transition-all duration-300 shadow-md flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      {sub.codes}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {sub.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button asChild size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs">
                    <Link to={sub.route} className="flex items-center justify-center gap-1.5">
                      <span>{sub.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Dual Action Bottom Bar */}
          {/* Bottom CTA */}
          <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
              <Link to="/auth">Get Started Free</Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm font-bold border-border gap-2">
              <Link to="/subjects">
                <span>Explore All Subjects</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
