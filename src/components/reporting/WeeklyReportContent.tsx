import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { 
  Award, 
  Brain, 
  Download, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ThumbsUp, 
  Printer, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { toast } from 'sonner';

interface WeeklyReportContentProps {
  childId?: string;
  studentName?: string;
  programmeName?: string;
  onPrint?: () => void;
}

const getSubjectColor = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('account')) return '#F43F5E';
  if (lower.includes('bio')) return '#10B981';
  if (lower.includes('busin')) return '#F59E0B';
  if (lower.includes('chem')) return '#06B6D4';
  if (lower.includes('comp') || lower.includes('cs')) return '#6366F1';
  if (lower.includes('econ')) return '#F97316';
  if (lower.includes('eng')) return '#3B82F6';
  if (lower.includes('ict')) return '#0EA5E9';
  if (lower.includes('math')) return '#0D9488';
  if (lower.includes('phys')) return '#8B5CF6';
  if (lower.includes('psych')) return '#EC4899';
  return '#00B4B6';
};

export const WeeklyReportContent: React.FC<WeeklyReportContentProps> = ({
  childId,
  studentName,
  programmeName,
  onPrint,
}) => {
  const { profile, subjects, programmeLabel } = useStudentProgramme();

  const [loading, setLoading] = useState(false);
  const [hasRealAssessment, setHasRealAssessment] = useState(false);
  const [assessment, setAssessment] = useState({
    logical: 0,
    verbal: 0,
    quantitative: 0,
    problemSolving: 0,
    processingSpeed: 0,
  });
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
  });

  const effectiveName = studentName || profile.displayName || 'Student';
  const effectiveProgramme = programmeName || programmeLabel;

  useEffect(() => {
    const targetUserId = childId || profile.id;
    if (!targetUserId || targetUserId === 'guest_student') return;

    const fetchRealData = async () => {
      setLoading(true);
      try {
        // 1. Fetch real student assessment for spider web chart
        const { data: asmt } = await supabase
          .from('student_assessments')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (asmt) {
          setHasRealAssessment(true);
          setAssessment({
            logical: asmt.logical_score || 0,
            verbal: asmt.verbal_score || 0,
            quantitative: asmt.quantitative_score || 0,
            problemSolving: asmt.problem_solving_score || 0,
            processingSpeed: asmt.processing_speed_score || 0,
          });
        } else {
          setHasRealAssessment(false);
          setAssessment({
            logical: 0,
            verbal: 0,
            quantitative: 0,
            problemSolving: 0,
            processingSpeed: 0,
          });
        }

        // 2. Fetch real quizzes from both quiz_attempts and quiz_sessions
        const [attemptsRes, sessionsRes] = await Promise.all([
          supabase.from('quiz_attempts').select('percentage').eq('user_id', targetUserId),
          supabase.from('quiz_sessions').select('percentage').eq('user_id', targetUserId).eq('status', 'completed'),
        ]);

        const allQuizzes = [
          ...(attemptsRes.data || []),
          ...(sessionsRes.data || []),
        ];

        if (allQuizzes.length > 0) {
          const sum = allQuizzes.reduce((acc, a) => acc + (a.percentage || 0), 0);
          setQuizStats({
            totalQuizzes: allQuizzes.length,
            averageScore: Math.round(sum / allQuizzes.length),
          });
        } else {
          setQuizStats({
            totalQuizzes: 0,
            averageScore: 0,
          });
        }
      } catch (err) {
        console.error('Error fetching weekly report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, [childId, profile.id]);

  const radarData = [
    { subject: "Logical Reasoning", A: assessment.logical, fullMark: 100 },
    { subject: "Verbal Aptitude", A: assessment.verbal, fullMark: 100 },
    { subject: "Quantitative Math", A: assessment.quantitative, fullMark: 100 },
    { subject: "Problem Solving", A: assessment.problemSolving, fullMark: 100 },
    { subject: "Processing Speed", A: assessment.processingSpeed, fullMark: 100 },
  ];

  const assessmentAvg = hasRealAssessment
    ? Math.round((assessment.logical + assessment.verbal + assessment.quantitative + assessment.problemSolving + assessment.processingSpeed) / 5)
    : 0;

  const overallScore = quizStats.averageScore > 0 ? quizStats.averageScore : assessmentAvg;

  const goodPoints = subjects.flatMap(s => s.strongTopics.map(st => ({ subject: s.name, strength: st }))).slice(0, 3);
  const weakAreas = subjects.flatMap(s => s.weakTopics.map(w => ({ subject: s.name, topic: w }))).slice(0, 3);

  const handleDownloadCSV = () => {
    const csvContent = `LevelHubAI Cambridge Academic Report
Student Name: ${effectiveName}
Programme: ${effectiveProgramme}
Target Cambridge Grade: ${profile.targetGrade}
Date: ${new Date().toLocaleDateString()}

KPI SUMMARY
Overall Score: ${overallScore}%
Quizzes Completed: ${quizStats.totalQuizzes}
Streak Days: ${profile.streakDays}
Total XP: ${profile.xpPoints}

COGNITIVE ASSESSMENT RADAR
Logical Reasoning: ${assessment.logical}%
Verbal Aptitude: ${assessment.verbal}%
Quantitative Math: ${assessment.quantitative}%
Problem Solving: ${assessment.problemSolving}%
Processing Speed: ${assessment.processingSpeed}%

CAMBRIDGE SUBJECTS PROGRESS
${subjects.map(s => `${s.name}: ${s.progressPercent}% (${s.completedTopics}/${s.totalTopics} topics)`).join('\n')}
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cambridge_Academic_Report_${effectiveName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Report CSV downloaded successfully!');
  };

  return (
    <div id="weekly-report-printable" className="space-y-6 text-slate-900 dark:text-slate-100 p-2 print:p-6 print:bg-white print:text-black">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-slate-900 text-white shadow-md print:bg-none print:text-black print:border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-2.5 py-0.5 text-xs font-semibold">
              Weekly Progress & Academic Assessment
            </Badge>
            <span className="text-xs text-teal-100">• Real-Time Performance</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{effectiveName}&apos;s Weekly Report</h2>
          <p className="text-xs text-teal-100 mt-1">
            {effectiveProgramme} • Cambridge Target Grade: <strong className="text-white font-bold">{profile.targetGrade}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            className="rounded-xl self-start sm:self-auto bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold text-xs gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-200" />
            <span>Download CSV</span>
          </Button>

          {onPrint && (
            <Button
              onClick={onPrint}
              variant="outline"
              className="rounded-xl self-start sm:self-auto bg-white text-teal-800 hover:bg-teal-50 border-none font-bold text-xs gap-2 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Score</div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{overallScore}%</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Grade {profile.targetGrade} Pace</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Completed</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{quizStats.totalQuizzes}</div>
          <div className="text-[10px] text-slate-400 mt-1">Past paper questions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Study Streak</div>
          <div className="text-2xl font-black text-orange-500 mt-1 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-orange-500" />
            <span>{profile.streakDays}d</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Continuous learning</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total XP Earned</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{profile.xpPoints.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">Level {profile.level} Scholar</div>
        </div>
      </div>

      {/* Spider Web Radar Chart & Key Strengths / Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-teal-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Spider Web Cognitive Assessment Radar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Multi-axial analysis of reasoning, problem-solving, and speed.
          </p>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#0d9488', fontSize: 11, fontWeight: 700 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} opacity={0.3} />
                <Radar 
                  name="Student Assessment" 
                  dataKey="A" 
                  stroke="#00B4B6" 
                  strokeWidth={2}
                  fill="#00B4B6" 
                  fillOpacity={0.4} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Key Strengths */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ThumbsUp className="w-4 h-4" />
              <span>Key Strengths & Mastered Concepts</span>
            </div>
            <div className="space-y-2">
              {goodPoints.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No mastered topics recorded yet. Take practice quizzes to track your strengths.
                </div>
              ) : (
                goodPoints.map((gp, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{gp.strength}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-none">
                      {gp.subject}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Identified Weak Areas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/50 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Key Areas for Improvement</span>
            </div>
            <div className="space-y-2">
              {weakAreas.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No weak areas identified yet. Practice quizzes to diagnose your learning gaps.
                </div>
              ) : (
                weakAreas.map((wa, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{wa.topic}</span>
                    <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold border-none">
                      {wa.subject}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Subjects & Overall Scores */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>All Cambridge Subjects Progress ({subjects.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Syllabus Completion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {subjects.map((s) => {
            const color = getSubjectColor(s.name);
            return (
              <div key={s.id} className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">{s.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s.progressPercent}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
