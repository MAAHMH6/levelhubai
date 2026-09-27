import React from 'react';
import { Users, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const FamilyCtaSection: React.FC = () => {
  const handleFamilyBundle = () => {
    window.open('https://wa.me/923098444501?text=Hi%20LevelHubAI!%20I%20am%20interested%20in%20Family%20Bundles%20for%20my%20children.', '_blank');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-teal-900/40 via-background to-indigo-900/40 border-y border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="p-8 sm:p-12 rounded-3xl bg-card/80 border border-teal-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase">
              <Users className="w-3.5 h-3.5" />
              Multi-Student Families & Siblings
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Preparing Siblings for Cambridge Exams?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Get dedicated parent oversight across multiple student accounts with bundled discounted family pricing and shared family progress reports.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm px-6 h-12 shadow-sm">
              <Link to="/auth">Sign Up Free</Link>
            </Button>

            <Button
              onClick={handleFamilyBundle}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold rounded-2xl text-xs sm:text-sm px-6 h-12 gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
              <span>Ask About Family Bundles</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
