import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentProgramme } from "@/contexts/StudentProgrammeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  FileText, 
  Sparkles, 
  Timer, 
  Zap, 
  Clock, 
  Flame, 
  Star, 
  CheckCircle2,
  Compass,
  AlertCircle,
  Crown,
  History,
  RotateCcw
} from "lucide-react";
import QuizRunner, { type RagQuizParams } from "@/components/quiz/QuizRunner";
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface Subject { id: string; name: string; qualification: string; }
interface Unit { id: string; title: string; subject_id: string; unit_number: number }
interface Lesson { id: string; title: string; unit_id: string; lesson_number: number }

type QuizMode = "quick" | "timed" | "center" | "history";

export default function QuizSetup() {
  const { user, loading } = useAuth();
  const { isPro, isSchool } = useSubscription();
  const { programmeLabel, subjects: ctxSubjects } = useStudentProgramme();
  const isPremium = isPro || isSchool;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { type: routeType } = useParams<{ type?: string }>();
  
  // Determine mode from path parameter or query string
  const initialMode: QuizMode = 
    routeType === "timed" || searchParams.get("type") === "timed" 
      ? "timed" 
      : routeType === "center" || searchParams.get("type") === "center"
      ? "center"
      : routeType === "history" || searchParams.get("type") === "history"
      ? "history"
      : "quick";

  const [activeMode, setActiveMode] = useState<QuizMode>(initialMode);
  const [centerTab, setCenterTab] = useState<"subject" | "unit" | "lesson">("subject");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Selection states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Options
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(initialMode === "timed" ? "10" : "5");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialMode === "timed" ? "10" : "0");

  const [running, setRunning] = useState<RagQuizParams | null>(null);
  const [runTitle, setRunTitle] = useState("");
  const [limits, setLimits] = useState({ lesson: 0, unit: 0, subject: 0 });
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setQuizHistory(data);
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  // Sync mode changes with URL
  const handleModeChange = (mode: QuizMode) => {
    setActiveMode(mode);
    setSearchParams({ type: mode });
    if (mode === "timed") {
      setQuestionCount("10");
      setTimeLimitMinutes("10");
    } else {
      setQuestionCount("5");
      setTimeLimitMinutes("0");
    }
  };

  // Parse incoming parameters from URL
  useEffect(() => {
    const sId = searchParams.get("subject_id");
    const uId = searchParams.get("unit_id");
    const lId = searchParams.get("lesson_id");
    const tabParam = searchParams.get("tab");
    const modeParam = searchParams.get("type");

    if (sId) setSelectedSubjectId(sId);
    if (uId) setSelectedUnitId(uId);
    if (lId) setSelectedLessonId(lId);

    if (modeParam === "timed" || modeParam === "quick" || modeParam === "center") {
      setActiveMode(modeParam as QuizMode);
    } else if (tabParam === "unit" || tabParam === "lesson" || uId || lId) {
      setActiveMode("center");
      if (tabParam === "unit" || (uId && !lId)) setCenterTab("unit");
      if (tabParam === "lesson" || lId) setCenterTab("lesson");
    }
  }, [searchParams]);

  // Fetch usage limits
  useEffect(() => {
    if (!user) return;
    const fetchLimits = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_quiz_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();
      if (data) {
        setLimits({
          lesson: data.lesson_quizzes_used,
          unit: data.unit_quizzes_used,
          subject: data.subject_quizzes_used
        });
      }
    };
    fetchLimits();
  }, [user, running]);

  // Fetch subjects
  useEffect(() => {
    supabase
      .from("subjects")
      .select("id, name, qualification")
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSubjects(data);
          const incomingSubject = searchParams.get("subject_id");
          if (incomingSubject && data.some(s => s.id === incomingSubject)) {
            setSelectedSubjectId(incomingSubject);
          } else if (!selectedSubjectId) {
            setSelectedSubjectId(data[0].id);
          }
        }
      });
  }, []);

  // Fetch units when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      supabase
        .from("units")
        .select("id, title, subject_id, unit_number")
        .eq("subject_id", selectedSubjectId)
        .order("unit_number")
        .then(({ data }) => {
          setUnits(data || []);
          const incomingUnit = searchParams.get("unit_id");
          if (incomingUnit && data?.some(u => u.id === incomingUnit)) {
            setSelectedUnitId(incomingUnit);
          } else {
            setSelectedUnitId(prev => (data?.some(u => u.id === prev) ? prev : ""));
          }
        });
    }
  }, [selectedSubjectId, searchParams]);

  // Fetch lessons when unit changes
  useEffect(() => {
    if (selectedUnitId) {
      supabase
        .from("lessons")
        .select("id, title, unit_id, lesson_number")
        .eq("unit_id", selectedUnitId)
        .order("lesson_number")
        .then(({ data }) => {
          setLessons(data || []);
          const incomingLesson = searchParams.get("lesson_id");
          if (incomingLesson && data?.some(l => l.id === incomingLesson)) {
            setSelectedLessonId(incomingLesson);
          } else {
            setSelectedLessonId(prev => (data?.some(l => l.id === prev) ? prev : ""));
          }
        });
    } else {
      setLessons([]);
      setSelectedLessonId("");
    }
  }, [selectedUnitId, searchParams]);

  const startQuiz = (params: Omit<RagQuizParams, "quiz_type" | "difficulty" | "question_count" | "time_limit_seconds">, title: string) => {
    setRunning({
      ...params,
      quiz_type: activeMode === "timed" ? "timed" : "quick",
      difficulty,
      question_count: parseInt(questionCount),
      time_limit_seconds: activeMode === "timed" ? parseInt(timeLimitMinutes) * 60 : 0
    });
    setRunTitle(title);
  };

  // IF QUIZ IS RUNNING: RENDER INSIDE STUDENT INTERFACE (NOT FULLSCREEN TAKEOVER)
  if (running) {
    const s = running.subject_id ? subjects.find(x => x.id === running.subject_id) : null;
    return (
      <RequireSubjectAccess subject={s?.name || ""}>
        <div className="space-y-6 max-w-4xl mx-auto pb-16">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRunning(null)} 
                className="rounded-xl text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Exit Quiz
              </Button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <h1 className="font-bold text-base text-slate-900 dark:text-white">{runTitle}</h1>
                <p className="text-[11px] text-slate-400">Difficulty: {difficulty} • {questionCount} Questions</p>
              </div>
            </div>

            {running.quiz_type === "timed" && running.time_limit_seconds! > 0 && (
              <Badge className="bg-orange-500/10 text-orange-600 border border-orange-200/60 font-mono font-bold text-xs px-3 py-1 gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                Timed Exam Mode
              </Badge>
            )}
          </div>

          <Card className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <QuizRunner 
              params={running} 
              title={runTitle} 
              onClose={() => setRunning(null)} 
            />
          </Card>
        </div>
      </RequireSubjectAccess>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header with Tutopiya Teal Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Cambridge Smart Quiz Engine • {programmeLabel}</span>
            </div>

            {isPremium && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Pro Subscription Active</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quizzes & Practice
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate past-paper quizzes, test yourself against the clock, or drill down by subject, unit, and lesson.
          </p>
        </div>
      </div>

      {/* 4 Main Modes Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
        <button
          onClick={() => handleModeChange("quick")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeMode === "quick"
              ? "bg-teal-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick Quiz</span>
        </button>

        <button
          onClick={() => handleModeChange("timed")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeMode === "timed"
              ? "bg-orange-500 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Timed Quiz</span>
        </button>

        <button
          onClick={() => handleModeChange("center")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeMode === "center"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quiz Center</span>
        </button>

        <button
          onClick={() => handleModeChange("history")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeMode === "history"
              ? "bg-teal-700 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Quiz History ({quizHistory.length})</span>
        </button>
      </div>

      {/* MODE 1: QUICK QUIZ */}
      {activeMode === "quick" && (
        <Card className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Instant Quick Quiz</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Generate a fast 5 or 10 question quiz instantly from Cambridge past paper questions and mark schemes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Cambridge Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.qualification === 'a_level' ? 'A Level' : s.qualification === 'igcse' ? 'IGCSE' : 'O Level'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                  <SelectItem value="easy">Foundation (Easy)</SelectItem>
                  <SelectItem value="medium">Standard (Medium)</SelectItem>
                  <SelectItem value="hard">Advanced (Hard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions (Fast)</SelectItem>
                  <SelectItem value="10">10 Questions (Standard)</SelectItem>
                  <SelectItem value="15">15 Questions (Thorough)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Quizzes Remaining</div>
                <div className="text-[11px] text-slate-400">
                  {isPremium ? "Unlimited Access (Pro)" : `${Math.max(0, 5 - limits.subject)} / 5 free remaining`}
                </div>
              </div>
              <Badge variant="outline" className="border-teal-300 text-teal-700 font-bold">
                +20 XP Each
              </Badge>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => {
                const s = subjects.find(x => x.id === selectedSubjectId);
                startQuiz({ scope: "subject", subject_id: selectedSubjectId }, `${s?.name || 'Cambridge'} Quick Quiz`);
              }}
              disabled={!selectedSubjectId}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 h-11 shadow-md shadow-teal-600/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch Quick Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* MODE 2: TIMED QUIZ */}
      {activeMode === "timed" && (
        <Card className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Timed Exam Challenge</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Train your speed and precision under real Cambridge countdown conditions with instant marking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Cambridge Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.qualification === 'a_level' ? 'A Level' : s.qualification === 'igcse' ? 'IGCSE' : 'O Level'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Limit</Label>
              <Select value={timeLimitMinutes} onValueChange={setTimeLimitMinutes}>
                <SelectTrigger className="h-11 rounded-xl font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Minutes (Sprint)</SelectItem>
                  <SelectItem value="10">10 Minutes (Standard)</SelectItem>
                  <SelectItem value="15">15 Minutes (Extended)</SelectItem>
                  <SelectItem value="20">20 Minutes (Full Section)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed Questions</SelectItem>
                  <SelectItem value="medium">Cambridge Exam Standard</SelectItem>
                  <SelectItem value="hard">Challenging Grade 9/A*</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Count</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => {
                const s = subjects.find(x => x.id === selectedSubjectId);
                startQuiz({ scope: "subject", subject_id: selectedSubjectId }, `${s?.name || 'Cambridge'} Timed Challenge`);
              }}
              disabled={!selectedSubjectId}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-8 h-11 shadow-md shadow-orange-500/20"
            >
              <Timer className="w-4 h-4 mr-2" />
              Start Timed Challenge
            </Button>
          </div>
        </Card>
      )}

      {/* MODE 3: QUIZ CENTER (DEEP DRILL-DOWN) */}
      {activeMode === "center" && (
        <Card className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Custom Quiz Center</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Target specific units and individual syllabus lessons for pinpoint revision.
              </p>
            </div>
          </div>

          {/* Subtabs: Subject / Unit / Lesson */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setCenterTab("subject")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                centerTab === "subject" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              By Subject
            </button>
            <button
              onClick={() => setCenterTab("unit")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                centerTab === "unit" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              By Unit
            </button>
            <button
              onClick={() => setCenterTab("lesson")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                centerTab === "lesson" ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              By Lesson / Topic
            </button>
          </div>

          {/* Subject Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cambridge Subject</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.qualification === 'a_level' ? 'A Level' : s.qualification === 'igcse' ? 'IGCSE' : 'O Level'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Dropdown if unit or lesson mode */}
            {(centerTab === "unit" || centerTab === "lesson") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Unit</Label>
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={units.length === 0}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={units.length === 0 ? "No units found" : "Choose Unit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        Unit {u.unit_number}: {u.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Lesson Dropdown if lesson mode */}
          {centerTab === "lesson" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Lesson</Label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={lessons.length === 0}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={lessons.length === 0 ? "Select a unit first" : "Choose Lesson"} />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.lesson_number}. {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Difficulty & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Questions Count</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => {
                const s = subjects.find(x => x.id === selectedSubjectId);
                const u = units.find(x => x.id === selectedUnitId);
                const l = lessons.find(x => x.id === selectedLessonId);

                if (centerTab === "lesson" && selectedLessonId) {
                  startQuiz({ 
                    scope: "lesson", 
                    subject_id: selectedSubjectId, 
                    unit_id: selectedUnitId, 
                    lesson_id: selectedLessonId 
                  }, `${l?.title || 'Lesson'} Quiz`);
                } else if (centerTab === "unit" && selectedUnitId) {
                  startQuiz({ 
                    scope: "unit", 
                    subject_id: selectedSubjectId, 
                    unit_id: selectedUnitId 
                  }, `Unit ${u?.unit_number}: ${u?.title} Quiz`);
                } else {
                  startQuiz({ 
                    scope: "subject", 
                    subject_id: selectedSubjectId 
                  }, `${s?.name || 'Subject'} Full Quiz`);
                }
              }}
              disabled={
                !selectedSubjectId || 
                (centerTab === "unit" && !selectedUnitId) || 
                (centerTab === "lesson" && !selectedLessonId)
              }
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-8 h-11 shadow-md shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Syllabus Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* MODE 4: QUIZ HISTORY */}
      {activeMode === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              <span>Past Quiz Attempts & Performance</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing last {quizHistory.length} quiz sessions
            </span>
          </div>

          {quizHistory.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No past quiz attempts yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Take a quick quiz or syllabus test above to begin recording your results, XP gains, and subject mastery.
              </p>
              <Button 
                onClick={() => handleModeChange("quick")} 
                size="sm" 
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold mt-2"
              >
                Take Quick Quiz
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {quizHistory.map((q, idx) => {
                const pct = q.percentage || 0;
                const dateStr = q.created_at || q.completed_at ? new Date(q.created_at || q.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                const subjectObj = subjects.find(s => s.id === q.subject_id);

                return (
                  <Card key={q.id || idx} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-300 transition-all shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        pct >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200' :
                        pct >= 50 ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                      }`}>
                        {pct}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {subjectObj?.name || 'Cambridge Assessment Quiz'}
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-semibold capitalize bg-slate-100 dark:bg-slate-800">
                            {q.quiz_type || 'Practice'}
                          </Badge>
                          {q.difficulty && (
                            <Badge variant="outline" className="text-[10px] font-medium capitalize border-slate-300">
                              {q.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>Score: {q.score} / {q.total || 5}</span>
                          {q.xp_earned > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">+{q.xp_earned} XP</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (q.subject_id) setSelectedSubjectId(q.subject_id);
                          handleModeChange("quick");
                        }}
                        className="rounded-xl text-xs font-bold border-slate-200 h-9"
                      >
                        Retake <RotateCcw className="w-3.5 h-3.5 ml-1.5 text-teal-600" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
