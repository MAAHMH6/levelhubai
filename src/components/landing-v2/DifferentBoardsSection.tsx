import React from 'react';
import { Layers, CheckCircle2, Globe, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const DifferentBoardsSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase">
              <Layers className="w-3.5 h-3.5" />
              Unified Learning Cockpit
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Different Boards. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
                One Dashboard.
              </span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              Taking Cambridge O Level for Sciences, Cambridge IGCSE for First Language English, and AS/A Level for Mathematics? No need for four different fragmented revision websites.
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>Switch Programmes Instantly:</strong> Toggle between Cambridge O Level, IGCSE, and A Level in your account settings anytime.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>Zero Curriculum Overlap:</strong> Syllabi, past paper references, and mark schemes strictly adapt to your selected board.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-foreground">
                  <strong>Single Progress Record:</strong> All XP, streaks, badges, and diagnostic scores are preserved across every board transition.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm px-8">
                <Link to="/auth">Experience The Unified Platform Free</Link>
              </Button>
            </div>
          </div>

          {/* Right Visual (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl p-7 bg-background border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <span className="font-bold text-foreground">Enrolled Qualifications Cockpit</span>
              <span className="text-teal-600 font-mono font-bold">1 Active Account</span>
            </div>

            {/* Board Cards */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-foreground">Cambridge O Level</div>
                  <div className="text-[10px] text-muted-foreground">Physics (5054) • Chemistry (5070) • Math D (4024)</div>
                </div>
                <Badge className="bg-teal-500 text-white text-[10px] font-bold">Active</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-foreground">Cambridge IGCSE</div>
                  <div className="text-[10px] text-muted-foreground">First Language English (0500) • Computer Science (0478)</div>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">Enabled</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-foreground">Cambridge International A Level</div>
                  <div className="text-[10px] text-muted-foreground">Pure Mathematics (9709) • Mechanics (9709/42)</div>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-500/40 text-[10px] font-bold">Advanced</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
