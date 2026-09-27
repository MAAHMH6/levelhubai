import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, StudentTimetableItem } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Share2,
  CalendarCheck2
} from 'lucide-react';
import { toast } from 'sonner';

export const TimetableBuilderTool: React.FC = () => {
  const { user } = useAuth();
  const { profile, subjects, programmeLabel } = useStudentProgramme();

  const [timetable, setTimetable] = useState<StudentTimetableItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Form state
  const [newSubject, setNewSubject] = useState<string>('');
  const [newPaper, setNewPaper] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('2026-05-12');
  const [newTime, setNewTime] = useState<string>('09:00 AM');
  const [newDuration, setNewDuration] = useState<string>('120');
  const [newRoom, setNewRoom] = useState<string>('Main Exam Hall');
  const [newTargetGrade, setNewTargetGrade] = useState<string>('A*');

  useEffect(() => {
    if (subjects.length > 0 && !newSubject) {
      setNewSubject(subjects[0].name);
    }
  }, [subjects]);

  useEffect(() => {
    loadTimetable();
  }, [user?.id, profile.id]);

  const loadTimetable = () => {
    const userId = user?.id || profile.id;
    if (!userId) return;
    const items = resourcesStore.getStudentTimetable(userId);
    setTimetable(items);
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newPaper || !newDate) {
      toast.error('Please complete all required exam fields.');
      return;
    }

    const userId = user?.id || profile.id;
    const item = resourcesStore.saveStudentTimetableItem({
      user_id: userId,
      subject: newSubject,
      paper: newPaper,
      exam_date: newDate,
      start_time: newTime,
      duration_minutes: parseInt(newDuration) || 120,
      room: newRoom,
      target_grade: newTargetGrade,
    });

    setTimetable(prev => [...prev, item]);
    setDialogOpen(false);
    setNewPaper('');
    toast.success(`Added ${newSubject} ${newPaper} to your timetable.`);
  };

  const handleDelete = (id: string) => {
    const userId = user?.id || profile.id;
    resourcesStore.deleteStudentTimetableItem(userId, id);
    setTimetable(prev => prev.filter(i => i.id !== id));
    toast.info('Exam paper removed from timetable.');
  };

  // Sort upcoming exams chronologically
  const sortedTimetable = [...timetable].sort((a, b) => {
    return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
  });

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-purple-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Cambridge Schedule Organizer
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Exam Timetable Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Build and personalize your Cambridge examination timetable. Track exact dates, start times, rooms, and live days remaining until each paper.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setDialogOpen(true)}
              className="rounded-xl text-xs font-black px-4 h-10 bg-purple-600 hover:bg-purple-500 text-white shadow-md gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Paper</span>
            </Button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Total Scheduled Papers</div>
            <div className="text-2xl font-black text-white mt-1">{sortedTimetable.length}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">First Exam In</div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {sortedTimetable.length > 0 ? `${getDaysUntil(sortedTimetable[0].exam_date)} days` : 'N/A'}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Target Series</div>
            <div className="text-2xl font-black text-amber-400 mt-1">May/June 2026</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Target Grades</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">Straight A*</div>
          </div>
        </div>
      </div>

      {/* Timetable List */}
      {sortedTimetable.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <CalendarCheck2 className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No examination papers scheduled yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click "Add Exam Paper" to input your Cambridge exam dates and start organizing your revision calendar.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Your First Exam
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTimetable.map((item) => {
            const daysLeft = getDaysUntil(item.exam_date);
            return (
              <Card
                key={item.id}
                className="p-5 rounded-3xl border-border bg-card hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="outline" className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      daysLeft <= 7 ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                      daysLeft <= 30 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} Days Remaining` : daysLeft === 0 ? 'Today!' : 'Completed'}
                    </Badge>

                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-black">
                      Target {item.target_grade || 'A*'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.subject}
                  </h3>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {item.paper}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-semibold text-foreground">{new Date(item.exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>{item.start_time} ({item.duration_minutes} minutes)</span>
                    </div>

                    {item.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-500" />
                        <span>{item.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 rounded-xl text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Exam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Schedule Cambridge Exam Paper
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddExam} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Subject</label>
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Paper Component</label>
              <Input
                placeholder="e.g. Paper 12 (Multiple Choice)"
                value={newPaper}
                onChange={e => setNewPaper(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Exam Date</label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Start Time</label>
                <Input
                  placeholder="09:00 AM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Duration (Minutes)</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Target Grade</label>
                <Select value={newTargetGrade} onValueChange={setNewTargetGrade}>
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {['A*', 'A', 'B', 'C'].map(g => (
                      <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Exam Room / Center</label>
              <Input
                placeholder="e.g. Hall A, Seat 42"
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white">
                Save to Timetable
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
