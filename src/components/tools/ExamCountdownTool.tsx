import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, StudentTimetableItem } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  AlertCircle,
  Plus,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const [customDialogOpen, setCustomDialogOpen] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('2026-04-15');

  // Cambridge Official Dates
  const summerExamDate = useMemo(() => new Date('2026-05-04T09:00:00'), []);
  const winterExamDate = useMemo(() => new Date('2026-10-05T09:00:00'), []);

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const userId = user?.id || profile.id;
    if (userId) {
      resourcesStore.getStudentTimetableAsync(userId).then(items => {
        setTimetable(items);
      });
    }
  }, [user?.id, profile.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (targetDate: Date): TimeLeft => {
    const distance = targetDate.getTime() - now;
    if (distance > 0) {
      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const currentSeriesTarget = activeSession === 'summer' ? summerExamDate : winterExamDate;
  const masterCountdown = calculateTimeLeft(currentSeriesTarget);

  const handleAddCustomCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customDate) return;

    const userId = user?.id || profile.id;
    if (!userId) return;

    const item = resourcesStore.saveStudentTimetableItem({
      user_id: userId,
      subject: customTitle,
      paper: 'Custom Target Exam',
      exam_date: customDate,
      start_time: '09:00 AM',
      duration_minutes: 120,
      target_grade: 'A*',
    });

    setTimetable(prev => [...prev, item]);
    setCustomDialogOpen(false);
    setCustomTitle('');
    toast.success(`Pinned countdown for ${customTitle}!`);
  };

  // Revision Sprint Milestones
  const sprintMilestones = [
    {
      title: 'Foundation & Syllabus Coverage',
      threshold: '60+ Days Out',
      active: masterCountdown.days >= 60,
      desc: 'Complete all video magnet lessons and topical classified question banks for every chapter.',
    },
    {
      title: 'Yearly Past Paper Drills (2019-2022)',
      threshold: '30-60 Days Out',
      active: masterCountdown.days < 60 && masterCountdown.days >= 30,
      desc: 'Work through full-length Cambridge past paper variants under un-timed conditions to master question patterns.',
    },
    {
      title: 'Timed AI Mock Exam Marathon',
      threshold: '14-30 Days Out',
      active: masterCountdown.days < 30 && masterCountdown.days >= 14,
      desc: 'Take timed exams under realistic exam room constraints with instant AI marking and grade prediction.',
    },
    {
      title: 'Formula Sheet & Active Recall Blitz',
      threshold: '7-14 Days Out',
      active: masterCountdown.days < 14 && masterCountdown.days >= 7,
      desc: 'Zero in on mandatory definitions, formula sheets, and Leitner flashcards to eliminate easy mark drops.',
    },
    {
      title: 'Final Taper & Peak Performance',
      threshold: '< 7 Days Out',
      active: masterCountdown.days < 7,
      desc: 'Light review only. Revisit mistakes journal, verify exam station equipment, and ensure 8+ hours of sleep.',
    },
  ];

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
              Real-time countdown clocks for official Cambridge examination sessions and your personalized exam timetable papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
            <Button
              onClick={() => setCustomDialogOpen(true)}
              variant="outline"
              className="rounded-xl text-xs font-bold border-orange-400/30 text-orange-200 hover:bg-orange-900/50 gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Add Custom Target</span>
            </Button>
          </div>
        </div>

        {/* Big Live Digital Clock Units */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-6 rounded-3xl text-center shadow-lg">
            <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
              {masterCountdown.days}
            </div>
            <div className="text-[11px] sm:text-xs uppercase font-extrabold text-orange-400 tracking-wider mt-1">
              Days Left
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-6 rounded-3xl text-center shadow-lg">
            <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
              {String(masterCountdown.hours).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1">
              Hours
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-6 rounded-3xl text-center shadow-lg">
            <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
              {String(masterCountdown.minutes).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1">
              Minutes
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-6 rounded-3xl text-center shadow-lg">
            <div className="text-4xl sm:text-6xl font-black text-orange-400 font-mono tracking-tight animate-pulse">
              {String(masterCountdown.seconds).padStart(2, '0')}
            </div>
            <div className="text-[11px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mt-1">
              Seconds
            </div>
          </div>
        </div>
      </div>

      {/* Student's Personal Exam Papers Countdown Cards */}
      {timetable.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Your Scheduled Exam Countdowns</span>
            </h3>

            <Button
              onClick={() => navigate('/quick-access/exam-timetable-builder')}
              variant="ghost"
              size="sm"
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-500/10"
            >
              Manage in Timetable Builder →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((item) => {
              const itemDate = new Date(`${item.exam_date}T09:00:00`);
              const itemCd = calculateTimeLeft(itemDate);
              const isPast = itemDate.getTime() < now;

              return (
                <Card
                  key={item.id}
                  className="p-5 rounded-3xl border-border bg-card hover:border-orange-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] font-bold border-orange-500/30 text-orange-600 dark:text-orange-400">
                        {item.paper}
                      </Badge>
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-black">
                        Target {item.target_grade || 'A*'}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-foreground">{item.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-muted/60 flex items-center justify-around font-mono text-center">
                      {isPast ? (
                        <div className="text-xs font-bold text-muted-foreground py-1">
                          Exam Completed
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="text-lg font-black text-foreground">{itemCd.days}</div>
                            <div className="text-[9px] uppercase font-bold text-muted-foreground">Days</div>
                          </div>
                          <div className="text-muted-foreground font-black">:</div>
                          <div>
                            <div className="text-lg font-black text-foreground">{String(itemCd.hours).padStart(2, '0')}</div>
                            <div className="text-[9px] uppercase font-bold text-muted-foreground">Hours</div>
                          </div>
                          <div className="text-muted-foreground font-black">:</div>
                          <div>
                            <div className="text-lg font-black text-foreground">{String(itemCd.minutes).padStart(2, '0')}</div>
                            <div className="text-[9px] uppercase font-bold text-muted-foreground">Mins</div>
                          </div>
                          <div className="text-muted-foreground font-black">:</div>
                          <div>
                            <div className="text-lg font-black text-orange-500">{String(itemCd.seconds).padStart(2, '0')}</div>
                            <div className="text-[9px] uppercase font-bold text-muted-foreground">Secs</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Revision Sprint Milestones Roadmap */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" />
          <span>Cambridge Preparation Sprint Roadmap</span>
        </h3>

        <div className="space-y-3">
          {sprintMilestones.map((ms, idx) => (
            <Card
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                ms.active 
                  ? 'border-orange-500/60 bg-orange-500/10 shadow-sm' 
                  : 'border-border bg-card opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    ms.active 
                      ? 'bg-orange-500 text-slate-950 shadow-xs' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>{ms.title}</span>
                      {ms.active && (
                        <Badge className="bg-orange-500 text-slate-950 font-bold text-[9px] px-2 py-0">
                          Current Stage
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ms.desc}</p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono shrink-0 self-start sm:self-auto border-border">
                  {ms.threshold}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Target Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Add Custom Exam / Mock Countdown
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCustomCountdown} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Title / Assessment Name</label>
              <Input
                placeholder="e.g. School Pre-Mock Physics Exam"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Target Date</label>
              <Input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCustomDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white">
                Pin Countdown
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
