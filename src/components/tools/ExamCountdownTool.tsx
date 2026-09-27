import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, StudentTimetableItem } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Clock, 
  Calendar, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const ExamCountdownTool: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, programmeLabel } = useStudentProgramme();

  const [timetable, setTimetable] = useState<StudentTimetableItem[]>([]);
  const [activeSession, setActiveSession] = useState<'summer' | 'winter'>('summer');

  // Cambridge Official Dates
  const summerExamDate = new Date('2026-05-04T09:00:00');
  const winterExamDate = new Date('2026-10-05T09:00:00');

  const [countdown, setCountdown] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const userId = user?.id || profile.id;
    if (userId) {
      setTimetable(resourcesStore.getStudentTimetable(userId));
    }
  }, [user?.id, profile.id]);

  useEffect(() => {
    const target = activeSession === 'summer' ? summerExamDate : winterExamDate;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const nearestPersonalExam = timetable.length > 0 
    ? [...timetable].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-orange-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase mb-3">
              <Zap className="w-3.5 h-3.5" />
              Live Cambridge Exam Countdown
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Official Exam Countdowns
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time countdown widgets for May/June and Oct/Nov Cambridge examination series with targeted preparation milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSession('summer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSession === 'summer' 
                  ? 'bg-orange-500 text-slate-950 shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              May/June 2026 Series
            </button>
            <button
              onClick={() => setActiveSession('winter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSession === 'winter' 
                  ? 'bg-orange-500 text-slate-950 shadow-md' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Oct/Nov 2026 Series
            </button>
          </div>
        </div>

        {/* Big Live Digital Clock Units */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black text-orange-400">
              {countdown.days}
            </span>
            <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">Days</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black text-white">
              {countdown.hours.toString().padStart(2, '0')}
            </span>
            <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">Hours</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black text-white">
              {countdown.minutes.toString().padStart(2, '0')}
            </span>
            <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">Minutes</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black text-teal-400">
              {countdown.seconds.toString().padStart(2, '0')}
            </span>
            <span className="block text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">Seconds</span>
          </div>
        </div>
      </div>

      {/* Personalized Countdown & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nearest Exam Card */}
        <Card className="p-6 rounded-3xl border-border bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-xs font-bold">
                Your Next Scheduled Paper
              </Badge>
              {nearestPersonalExam && (
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  Target {nearestPersonalExam.target_grade || 'A*'}
                </span>
              )}
            </div>

            {nearestPersonalExam ? (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  {nearestPersonalExam.subject}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  {nearestPersonalExam.paper}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{new Date(nearestPersonalExam.exam_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-2xl border-border">
                No personal exams added to timetable yet.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between">
            <Button
              onClick={() => navigate('/resources/timetable-builder')}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold"
            >
              Open Timetable Builder <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Preparation Milestones */}
        <Card className="p-6 rounded-3xl border-border bg-card">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Cambridge Revision Phase Milestones
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-foreground">Phase 1: Syllabus Coverage (100% Concepts)</div>
                <div className="text-[11px] text-muted-foreground">Complete all video lessons and chapter notes</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-3">
              <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-foreground">Phase 2: Topical Past Paper Drilling</div>
                <div className="text-[11px] text-muted-foreground">Solve 2018–2024 topical questions by chapter</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
              <Flame className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-foreground">Phase 3: Timed Full-Length Mock Exams</div>
                <div className="text-[11px] text-muted-foreground">Take complete papers with exam timer to build pacing</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
