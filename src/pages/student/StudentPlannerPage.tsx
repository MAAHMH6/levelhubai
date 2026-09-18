import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  Target, 
  Flame,
  ArrowRight,
  X,
  Layers,
  Play
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { featureStorage, StudyPlanItem } from '@/integrations/supabase/featureClient';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ACTIVITY_COLORS: Record<string, string> = {
  notes: 'bg-blue-100 text-blue-800 border-blue-300',
  quiz: 'bg-teal-100 text-teal-800 border-teal-300',
  past_paper: 'bg-purple-100 text-purple-800 border-purple-300',
  flashcards: 'bg-amber-100 text-amber-800 border-amber-300',
  mock_exam: 'bg-rose-100 text-rose-800 border-rose-300',
  video: 'bg-sky-100 text-sky-800 border-sky-300',
};
const ACTIVITY_LABELS: Record<string, string> = {
  notes: 'Study Notes',
  quiz: 'Quiz Practice',
  past_paper: 'Past Paper',
  flashcards: 'Flashcards',
  mock_exam: 'Mock Exam',
  video: 'Video Lesson',
};

export const StudentPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, programmeLabel, freeSubjects, subjects } = useStudentProgramme();
  const { isPro } = useSubscription();
  const [plans, setPlans] = useState<StudyPlanItem[]>([]);
  const [activeView, setActiveView] = useState<'plan' | 'goals'>('plan');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Subject Picker Dialog
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const [selectedSubjectForPlan, setSelectedSubjectForPlan] = useState('');
  
  // Add Task Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskTopic, setNewTaskTopic] = useState('');
  const [newTaskType, setNewTaskType] = useState<StudyPlanItem['activity_type']>('quiz');
  const [newTaskDuration, setNewTaskDuration] = useState('30');

  // Available subjects based on plan type
  const availableSubjects = isPro ? subjects : freeSubjects;

  useEffect(() => {
    if (availableSubjects.length > 0 && !newTaskSubject) {
      setNewTaskSubject(availableSubjects[0]?.name || '');
      setSelectedSubjectForPlan(availableSubjects[0]?.name || '');
    }
  }, [availableSubjects]);

  useEffect(() => {
    loadPlans();
  }, [profile.id, profile.programme]);

  const loadPlans = async () => {
    const data = await featureStorage.getStudyPlans(profile.id, profile.programme);
    setPlans(data);
  };

  const handleToggleTask = async (id: string) => {
    await featureStorage.toggleStudyPlanComplete(id);
    setPlans(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
    toast.success('Task progress updated! +15 XP');
  };

  const handleCreateTask = async () => {
    if (!newTaskTopic.trim()) {
      toast.error('Please enter a topic or task description.');
      return;
    }
    const subj = availableSubjects.find(s => s.name === newTaskSubject) || availableSubjects[0];
    const slug = (subj?.name || 'mathematics').toLowerCase().replace(/\s+/g, '-');
    const prefix = subj?.qualification === 'a_level' ? 'a-level' : 'subjects';
    await featureStorage.saveStudyPlan({
      user_id: profile.id,
      programme: profile.programme,
      subject_id: subj?.id || 'subj-1',
      subject_name: newTaskSubject,
      topic_title: newTaskTopic,
      scheduled_date: new Date().toISOString().split('T')[0],
      duration_minutes: parseInt(newTaskDuration) || 30,
      activity_type: newTaskType,
      completed: false,
    });
    setNewTaskTopic('');
    setDialogOpen(false);
    await loadPlans();
    toast.success('New study task added!');
  };

  // Opens subject picker before generating plan
  const handlePlanWithAIClick = () => {
    setSubjectPickerOpen(true);
  };

  // Actually generate the weekly plan after subject chosen
  const handleGenerateWeeklyPlan = async () => {
    if (!selectedSubjectForPlan) {
      toast.error('Please select a subject first.');
      return;
    }
    setSubjectPickerOpen(false);
    setIsGenerating(true);

    try {
      const subj = availableSubjects.find(s => s.name === selectedSubjectForPlan) || availableSubjects[0];
      if (!subj) { toast.error('Subject not found.'); setIsGenerating(false); return; }

      // Fetch real units & lessons for this subject
      let unitsData: any[] = [];
      let lessonsData: any[] = [];
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subj.id);
      if (isUuid) {
        const { data: u } = await supabase
          .from('units')
          .select('id, title, unit_number')
          .eq('subject_id', subj.id)
          .order('unit_number')
          .limit(7);
        unitsData = u || [];
        if (unitsData.length > 0) {
          const unitIds = unitsData.map(u => u.id);
          const { data: l } = await supabase
            .from('lessons')
            .select('id, title, unit_id, duration_minutes')
            .in('unit_id', unitIds)
            .order('lesson_number')
            .limit(21);
          lessonsData = l || [];
        }
      }

      // Fallback curriculum if no DB data
      const fallbackUnits = [
        { id: 'u1', title: 'Fundamentals & Core Concepts', unit_number: 1 },
        { id: 'u2', title: 'Key Theories & Formulas', unit_number: 2 },
        { id: 'u3', title: 'Applied Problem Solving', unit_number: 3 },
        { id: 'u4', title: 'Past Paper Techniques', unit_number: 4 },
        { id: 'u5', title: 'Exam Practice & Revision', unit_number: 5 },
      ];
      const fallbackLessons = [
        { unit_id: 'u1', title: 'Introduction & Overview', duration_minutes: 20 },
        { unit_id: 'u1', title: 'Core Definitions & Terminology', duration_minutes: 25 },
        { unit_id: 'u2', title: 'Key Formulas & Theorems', duration_minutes: 30 },
        { unit_id: 'u2', title: 'Worked Examples', duration_minutes: 25 },
        { unit_id: 'u3', title: 'Structured Questions Practice', duration_minutes: 35 },
        { unit_id: 'u3', title: 'MCQ Drill Session', duration_minutes: 20 },
        { unit_id: 'u4', title: 'Past Paper: Section A', duration_minutes: 45 },
        { unit_id: 'u5', title: 'Mock Exam Practice', duration_minutes: 60 },
      ];
      const finalUnits = unitsData.length > 0 ? unitsData : fallbackUnits;
      const finalLessons = lessonsData.length > 0 ? lessonsData : fallbackLessons;

      const slug = subj.name.toLowerCase().replace(/\s+/g, '-');
      const prefix = subj.qualification === 'a_level' ? 'a-level' : 'subjects';
      const today = new Date();

      // Build 7-day plan: assign 1-2 lessons per day from sequential unit/lesson list
      const dayPlans: Omit<StudyPlanItem, 'id' | 'created_at'>[] = [];
      const activitySequence: StudyPlanItem['activity_type'][] = ['video', 'notes', 'quiz', 'flashcards', 'quiz', 'past_paper', 'mock_exam'];
      let lessonIdx = 0;

      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        const actType = activitySequence[day];

        // Primary lesson for the day
        const lesson = finalLessons[lessonIdx % finalLessons.length];
        const unit = finalUnits.find(u => u.id === lesson?.unit_id) || finalUnits[Math.floor(lessonIdx / 2) % finalUnits.length];

        dayPlans.push({
          user_id: profile.id,
          programme: profile.programme,
          subject_id: subj.id,
          subject_name: subj.name,
          topic_title: `${DAY_NAMES[day]} — ${unit?.title || 'Core Unit'}: ${lesson?.title || 'Lesson ' + (lessonIdx + 1)}`,
          scheduled_date: dateStr,
          duration_minutes: lesson?.duration_minutes || 25,
          activity_type: actType,
          completed: false,
          // Store navigation link as part of topic_title (we'll parse it on display)
          _link: `/${prefix}/${slug}`,
        } as any);

        lessonIdx++;

        // Add a second task on weekdays (Mon–Fri)
        if (day < 5) {
          const lesson2 = finalLessons[(lessonIdx) % finalLessons.length];
          const unit2 = finalUnits.find(u => u.id === lesson2?.unit_id) || unit;
          dayPlans.push({
            user_id: profile.id,
            programme: profile.programme,
            subject_id: subj.id,
            subject_name: subj.name,
            topic_title: `${DAY_NAMES[day]} (2) — ${unit2?.title || 'Practice'}: ${lesson2?.title || 'Review & Practice'}`,
            scheduled_date: dateStr,
            duration_minutes: 20,
            activity_type: 'quiz',
            completed: false,
          });
          lessonIdx++;
        }
      }

      // Clear old plans for this subject + save new
      for (const item of dayPlans) {
        await featureStorage.saveStudyPlan(item);
      }
      await loadPlans();
      setIsGenerating(false);
      toast.success(`7-Day study plan for ${subj.name} generated! ${dayPlans.length} tasks across the week.`);
    } catch (e) {
      console.error('Plan generation error:', e);
      setIsGenerating(false);
      toast.error('Error generating plan. Please try again.');
    }
  };

  // Group plans by date for calendar view
  const plansByDay = plans.reduce<Record<string, StudyPlanItem[]>>((acc, p) => {
    if (!acc[p.scheduled_date]) acc[p.scheduled_date] = [];
    acc[p.scheduled_date].push(p);
    return acc;
  }, {});
  const sortedDates = Object.keys(plansByDay).sort();

  const todayStr = new Date().toISOString().split('T')[0];
  const completedCount = plans.filter(p => p.completed).length;
  const totalCount = plans.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Guided Weekly Study Planner
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {programmeLabel} • Exam {profile.examYear} • {completedCount}/{totalCount} tasks done
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePlanWithAIClick}
            disabled={isGenerating}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold h-10 px-5 shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            {isGenerating ? 'Generating Plan...' : 'Plan with AI'}
          </Button>

          <Button variant="outline" onClick={() => setDialogOpen(true)} className="rounded-xl text-xs font-bold h-10 border-slate-200 dark:border-slate-700">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600 dark:text-slate-400">Weekly Progress</span>
              <span className="text-teal-600">{completionPct}% Complete</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-black text-teal-600">{completedCount}</div>
            <div className="text-[11px] text-slate-400">of {totalCount} done</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveView('plan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeView === 'plan' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          My Schedule ({plans.length})
        </button>
        <button
          onClick={() => setActiveView('goals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeView === 'goals' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Exam Goals
        </button>
      </div>

      {/* SCHEDULE VIEW */}
      {activeView === 'plan' && (
        <div className="space-y-6">
          {plans.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7 text-teal-600" />
              </div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">No study tasks yet</div>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Click "Plan with AI" to pick a subject and generate a full 7-day weekly breakdown with units, lessons, and daily tasks.
              </p>
              <Button onClick={handlePlanWithAIClick} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold mt-2">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate My Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(date => {
                const dayTasks = plansByDay[date];
                const dayDate = new Date(date);
                const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
                const displayDate = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isToday = date === todayStr;
                const isPast = date < todayStr;
                const dayComplete = dayTasks.every(t => t.completed);
                const subjectName = dayTasks[0]?.subject_name || '';
                const slug = subjectName.toLowerCase().replace(/\s+/g, '-');
                const subj = availableSubjects.find(s => s.name === subjectName);
                const prefix = subj?.qualification === 'a_level' ? 'a-level' : 'subjects';
                const subjectLink = `/${prefix}/${slug}`;

                return (
                  <div key={date} className="space-y-3">
                    {/* Day Header */}
                    <div className={`flex items-center justify-between pb-2 border-b ${
                      isToday ? 'border-teal-300 dark:border-teal-700' : 'border-slate-200/80 dark:border-slate-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                          isToday 
                            ? 'bg-teal-600 text-white' 
                            : isPast 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' 
                              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}>
                          {isToday ? 'Today' : dayName}
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">{displayDate}</span>
                        {dayComplete && (
                          <Badge className="bg-teal-100 text-teal-800 border-teal-300 text-[10px] font-bold">
                            ✓ Day Complete
                          </Badge>
                        )}
                      </div>
                      {subjectName && (
                        <button
                          onClick={() => navigate(subjectLink)}
                          className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 hover:underline"
                        >
                          Open {subjectName} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Day Tasks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            task.completed 
                              ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70' 
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-teal-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                                task.completed 
                                  ? 'bg-teal-500 border-teal-500 text-white' 
                                  : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge className={`text-[10px] font-bold border ${ACTIVITY_COLORS[task.activity_type] || 'bg-slate-100 text-slate-700'}`}>
                                  {ACTIVITY_LABELS[task.activity_type] || task.activity_type}
                                </Badge>
                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {task.duration_minutes}m
                                </span>
                              </div>

                              <div className={`text-sm font-semibold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.topic_title.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(\s\(\d+\))?\s—\s/, '')}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <Badge className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 text-[10px] font-bold">
                                  {task.subject_name}
                                </Badge>
                                <button
                                  onClick={() => navigate(subjectLink)}
                                  className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-0.5"
                                >
                                  <Play className="w-2.5 h-2.5 fill-teal-600" /> Start
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GOALS VIEW */}
      {activeView === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              Target Academic Grade
            </h3>
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Target Cambridge Grade</div>
                <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">{profile.targetGrade}</div>
              </div>
              <Badge className="bg-teal-600 text-white text-xs">On Track</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your current progress and daily study streak ({profile.streakDays} days), you are meeting the benchmark for an {profile.targetGrade}.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Consistency & Streak
            </h3>
            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Next Milestone</div>
                <div className="text-2xl font-extrabold text-orange-700 dark:text-orange-400">7 Days</div>
              </div>
              <span className="text-xs font-bold text-orange-600">{profile.streakDays} / 7 Days</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Study 2 more consecutive days to earn the "Weekly Champion" badge and +150 bonus XP.
            </p>
          </div>
        </div>
      )}

      {/* SUBJECT PICKER DIALOG */}
      <Dialog open={subjectPickerOpen} onOpenChange={setSubjectPickerOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Generate 7-Day Study Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-sm text-slate-500">
              Choose a subject and we'll create a personalized 7-day weekly study plan with daily units and lessons.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Subject</label>
              <Select value={selectedSubjectForPlan} onValueChange={setSelectedSubjectForPlan}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Choose a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                        {s.subscription_tier === 'free' && (
                          <Badge className="bg-teal-100 text-teal-800 text-[9px] font-bold ml-1">Free</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isPro && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                Free plan: plan available for Math, Physics, and ICT. Upgrade to Pro for all subjects.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              {['Mon–Sun', '7 Days', '2x/day'].map((label, i) => (
                <div key={i} className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl">
                  <div className="text-sm font-extrabold text-teal-700 dark:text-teal-400">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {i === 0 ? 'Coverage' : i === 1 ? 'Duration' : 'Tasks/Day'}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSubjectPickerOpen(false)} 
                className="flex-1 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateWeeklyPlan}
                disabled={!selectedSubjectForPlan || isGenerating}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-bold"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD TASK DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Custom Study Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
              <Select value={newTaskSubject} onValueChange={setNewTaskSubject}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Topic / Task Title</label>
              <Input 
                placeholder="e.g. Unit 3 Past Paper Revision" 
                value={newTaskTopic}
                onChange={(e) => setNewTaskTopic(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Activity Type</label>
                <Select value={newTaskType} onValueChange={(v: any) => setNewTaskType(v)}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="video">Video Lesson</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="past_paper">Past Paper</SelectItem>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                    <SelectItem value="mock_exam">Mock Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Mins)</label>
                <Input 
                  type="number" 
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <Button onClick={handleCreateTask} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold mt-2">
              Save to Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
