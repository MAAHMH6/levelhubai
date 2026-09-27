import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CANONICAL_O_LEVEL_SUBJECTS } from '@/lib/canonicalOLevelSubjects';
import { CANONICAL_IGCSE_SUBJECTS } from '@/lib/canonicalIGCSESubjects';
import { CANONICAL_A_LEVEL_SUBJECTS } from '@/lib/canonicalALevelSubjects';

export const SubjectCoverageSection: React.FC = () => {
  const [activeProg, setActiveProg] = useState<'igcse' | 'olevel' | 'alevel'>('igcse');

  const subjectsList =
    activeProg === 'igcse' ? CANONICAL_IGCSE_SUBJECTS :
    activeProg === 'olevel' ? CANONICAL_O_LEVEL_SUBJECTS :
    CANONICAL_A_LEVEL_SUBJECTS;

  const counts = {
    igcse: '19 IGCSE Subjects',
    olevel: '17 O Level Subjects',
    alevel: '18 AS & A Level Subjects',
  };

  return (
    <section id="subjects-coverage" className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Comprehensive Curriculum Index
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Full Subject Coverage Across <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Cambridge IGCSE, O Level & A Level
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
            Every subject includes topical past paper banks, interactive unit lessons, AI marking rubrics, and downloadable syllabus formula sheets.
          </p>

          {/* Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border max-w-xl mx-auto">
            <button
              onClick={() => setActiveProg('igcse')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeProg === 'igcse' ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              19 IGCSE Subjects
            </button>
            <button
              onClick={() => setActiveProg('olevel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeProg === 'olevel' ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              17 O Level Subjects
            </button>
            <button
              onClick={() => setActiveProg('alevel')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeProg === 'alevel' ? 'bg-teal-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              18 AS & A Level Subjects
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-12">
          {subjectsList.slice(0, 12).map((s) => (
            <Link
              key={s.id}
              to={`/subjects?code=${s.code}`}
              className="p-4 rounded-2xl bg-card border border-border hover:border-teal-500/50 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.hex }} />
                <div>
                  <h3 className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">
                    {s.name}
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                    Code: {s.code}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>

        {/* Bottom CTA: More Subjects */}
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm">
            <Link to="/subjects" className="flex items-center gap-2">
              <span>More Subjects (Explore All 54)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm font-bold border-border">
            <Link to="/past-papers">Browse Past Paper Finder</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
