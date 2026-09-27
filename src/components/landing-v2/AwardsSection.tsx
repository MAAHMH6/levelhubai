import React from 'react';
import { Award, Trophy, Star, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AWARDS_LIST = [
  {
    icon: '🏆',
    title: 'Top in Cambridge Subject',
    tier: 'Legendary',
    desc: 'Awarded to candidates who maintain 95%+ accuracy across 5 full mock exam series in a single syllabus.',
    bg: 'from-amber-500/10 to-amber-600/5',
  },
  {
    icon: '🎖️',
    title: 'Past Paper Centurion',
    tier: 'Diamond',
    desc: 'Awarded upon successfully completing 100 verified Cambridge past paper components.',
    bg: 'from-cyan-500/10 to-teal-600/5',
  },
  {
    icon: '⚡',
    title: '30-Day Master Streak',
    tier: 'Epic',
    desc: 'Demonstrating daily consistency without missing a single day of active revision throughout exam season.',
    bg: 'from-purple-500/10 to-indigo-600/5',
  },
  {
    icon: '📜',
    title: 'Verified Cambridge Certificate',
    tier: 'Official',
    desc: 'Earn printable academic achievement certificates upon scoring Grade A* on LevelHubAI proctored mock sessions.',
    bg: 'from-emerald-500/10 to-teal-600/5',
  },
];

export const AwardsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Award className="w-3.5 h-3.5" />
            Achievements & Recognition
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Earn Prestigious Cambridge <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Awards, Badges & Certificates
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every breakthrough in your revision journey is immortalized. Unlock rare badges, celebrate milestones, and print verified academic certificates.
          </p>
        </div>

        {/* Awards Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AWARDS_LIST.map((award, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl bg-card border border-border hover:border-teal-500/40 transition-all duration-300 shadow-md flex flex-col justify-between group hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 rounded-2xl bg-muted/50 border border-border shadow-xs group-hover:scale-110 transition-transform">
                    {award.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                    {award.tier}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                  {award.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {award.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>LevelHubAI Verified Badge</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
