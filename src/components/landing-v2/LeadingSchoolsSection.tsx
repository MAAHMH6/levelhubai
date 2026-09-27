import React from 'react';
import { School, Users, ShieldCheck, Star, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LEADING_SCHOOLS = [
  { name: 'Karachi Grammar School', region: 'Pakistan', students: '120+ Students' },
  { name: 'Lahore Grammar School', region: 'Pakistan', students: '160+ Students' },
  { name: 'Aitchison College', region: 'Pakistan', students: '90+ Students' },
  { name: 'Beaconhouse Defence', region: 'Pakistan', students: '110+ Students' },
  { name: 'Dubai College', region: 'UAE', students: '45+ Students' },
  { name: 'Raffles Institution', region: 'Singapore', students: '35+ Students' },
];

export const LeadingSchoolsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <School className="w-3.5 h-3.5" />
            Institutional Trust
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Why Students From Leading Schools <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Choose LevelHubAI
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
            Join 500+ students from premier Cambridge schools who supplement their classroom instruction with our 24/7 AI Marking and verified past paper engines.
          </p>
        </div>

        {/* 6 School Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {LEADING_SCHOOLS.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-card border border-border/80 flex items-center justify-between hover:border-teal-500/40 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                <span className="text-xs text-muted-foreground">{s.region}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold font-mono">
                {s.students}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-8 shadow-sm gap-2"
          >
            <Link to="/auth">
              <Sparkles className="w-4 h-4" />
              <span>Get Started Free</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="rounded-2xl text-xs sm:text-sm font-bold border-border">
            <Link to="/subjects">Explore Free Resources</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
