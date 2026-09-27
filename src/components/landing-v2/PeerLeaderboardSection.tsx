import React from 'react';
import { Trophy, Flame, Crown, Medal, ArrowUp, Sparkles, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MOCK_LEADERS = [
  { rank: 1, name: 'Zainab M.', school: 'Karachi Grammar School', xp: '18,450 XP', delta: '+2', prog: 'A Level 9709', badge: 'Diamond' },
  { rank: 2, name: 'Hamza K.', school: 'Lahore Grammar School', xp: '16,210 XP', delta: '+1', prog: 'O Level 5054', badge: 'Gold' },
  { rank: 3, name: 'Sara A.', school: 'Dubai College', xp: '15,840 XP', delta: '0', prog: 'IGCSE 0580', badge: 'Silver' },
  { rank: 4, name: 'Ahmed R.', school: 'Beaconhouse Defence', xp: '14,200 XP', delta: '+3', prog: 'O Level 4024', badge: 'Bronze' },
  { rank: 5, name: 'You (Demo)', school: 'Cambridge Academy', xp: '12,980 XP', delta: '+5', prog: 'IGCSE 0620', badge: 'Scholar' },
];

export const PeerLeaderboardSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Competitive Academic Motivation
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
            See How You Stack Up <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-teal-500">
              Against Your Peers
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every question you answer earns academic XP, levels up your national standing, and pushes your school up the real-time leaderboard.
          </p>
        </div>

        {/* Live Leaderboard Display */}
        <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-background border border-border shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-foreground">Live National Cambridge Standings</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Updates</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {MOCK_LEADERS.map((student) => {
              const isCurrentUser = student.rank === 5;
              return (
                <div
                  key={student.rank}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isCurrentUser
                      ? 'bg-teal-500/10 border-teal-500/40 shadow-xs'
                      : 'bg-card border-border/70 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl font-black font-mono flex items-center justify-center text-xs ${
                        student.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                        student.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        student.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-muted text-foreground'
                      }`}
                    >
                      {student.rank}
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                        <span>{student.name}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-teal-500 text-white">
                            You
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                          {student.prog}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{student.school}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <ArrowUp className="w-3 h-3" />
                      <span>{student.delta}</span>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-black text-amber-500 font-mono">
                        {student.xp}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        {student.badge}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              Rankings reset every Sunday at 11:59 PM. Top 3 students receive Pro Scholar bonus credits.
            </span>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs">
              <Link to="/challenges">View Full Leaderboard →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
