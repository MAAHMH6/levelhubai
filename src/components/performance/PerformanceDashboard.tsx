import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileDown, TrendingUp, BookOpen, AlertCircle, Sparkles, Loader2, PlayCircle, BarChart3 , CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { WeeklyReportExportModal } from "@/components/reporting/WeeklyReportExportModal";

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [writingHistory, setWritingHistory] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [{ data: asmt }, { data: qz }, { data: wr }] = await Promise.all([
        supabase.from("student_assessments").select("*").eq("user_id", user?.id).single(),
        supabase.from("quiz_sessions").select("*").eq("user_id", user?.id).eq("status", "completed").order("created_at", { ascending: true }),
        supabase.from("writing_history").select("*").eq("user_id", user?.id).order("created_at", { ascending: true })
      ]);
      if (asmt) setAssessment(asmt);
      if (qz) setQuizzes(qz);
      if (wr) setWritingHistory(wr);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAiReport = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-performance-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      if (!res.ok) throw new Error("Failed to generate report");
      
      toast({ title: "Report generated successfully!" });
      loadData(); // reload to get new ai_report_summary
    } catch (err: any) {
      toast({ title: "Error generating report", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    setReportModalOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!assessment) return null;

  const cognitiveData = [
    { subject: "Logical", A: assessment.logical_score, fullMark: 100 },
    { subject: "Verbal", A: assessment.verbal_score, fullMark: 100 },
    { subject: "Quantitative", A: assessment.quantitative_score, fullMark: 100 },
    { subject: "Problem Solving", A: assessment.problem_solving_score, fullMark: 100 },
    { subject: "Processing", A: assessment.processing_speed_score, fullMark: 100 },
  ];

  const overallCognitiveAvg = Math.round((assessment.logical_score + assessment.verbal_score + assessment.quantitative_score + assessment.problem_solving_score + assessment.processing_speed_score) / 5);
  
  const quizAvg = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / quizzes.length) 
    : 0;

  const writingAvg = writingHistory.length > 0
    ? Math.round(writingHistory.reduce((acc, w) => acc + (w.overall_score || 0), 0) / writingHistory.length)
    : 0;

  const overallPerformance = Math.round((overallCognitiveAvg * 0.2) + (quizAvg * 0.6) + (writingAvg * 0.2));

  const trendData = quizzes.map((q, i) => ({
    name: `Quiz ${i + 1}`,
    score: q.percentage
  }));

  const getLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Developing";
    return "Needs Improvement";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 print:m-0 print:p-0 print:max-w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Learning Performance</h1>
          <p className="text-muted-foreground mt-1">AI-powered insights based on your cognitive profile and quiz history.</p>
        </div>
        <div className="flex gap-3 print:hidden">
          {(assessment.needs_ai_refresh || !assessment.ai_report_summary) && (
             <Button onClick={generateAiReport} disabled={isGenerating} className="bg-gradient-primary">
               {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
               {assessment.ai_report_summary ? "Refresh AI Report" : "Generate AI Report"}
             </Button>
          )}
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* OVERALL SCORE */}
        <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 flex flex-col items-center justify-center py-8">
          <div className="text-6xl font-black text-primary mb-2">{overallPerformance}%</div>
          <div className="text-xl font-semibold text-foreground">{getLabel(overallPerformance)}</div>
          <p className="text-xs text-muted-foreground mt-2 text-center px-4">Weighted average of your cognitive indicators and academic quiz performance.</p>
        </Card>

        {/* QUICK STATS */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4">
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Quizzes</CardTitle></CardHeader>
             <CardContent><div className="text-2xl font-bold">{quizzes.length}</div></CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Quiz Avg</CardTitle></CardHeader>
             <CardContent><div className="text-2xl font-bold">{quizAvg}%</div></CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Writing Avg</CardTitle></CardHeader>
             <CardContent><div className="text-2xl font-bold">{writingAvg > 0 ? `${writingAvg}%` : '-'}</div></CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Learning</CardTitle></CardHeader>
             <CardContent><div className="text-lg font-semibold truncate">{assessment.learning_style || "Mixed"}</div></CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Motivation</CardTitle></CardHeader>
             <CardContent><div className="text-2xl font-bold">{assessment.motivation_score}/5</div></CardContent>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COGNITIVE RADAR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary"/> Cognitive Skill Indicators</CardTitle>
            <CardDescription>Based on your initial assessment. Not a clinical diagnosis.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={cognitiveData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PERFORMANCE TREND */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500"/> Performance Trend</CardTitle>
            <CardDescription>Your quiz scores over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {quizzes.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p>Complete at least 2 quizzes to see your trend.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI REPORT */}
      {assessment.ai_report_summary ? (
        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> AI Personalized Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Performance Summary</h3>
                <p className="text-muted-foreground leading-relaxed">{assessment.ai_report_summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Your Strengths</h3>
                  <ul className="space-y-2">
                    {assessment.ai_strengths?.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {assessment.ai_weaknesses?.map((weak: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">{weak.area}</span>
                          <p className="text-sm text-muted-foreground">{weak.action}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Recommended Study Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.ai_study_plan?.map((plan: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-semibold">{plan.subject} <span className="text-muted-foreground font-normal">({plan.topic})</span></div>
                      <div className="text-sm text-muted-foreground mt-1">{plan.action}</div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="print:hidden">
                      <Link to="/quiz/setup"><PlayCircle className="w-4 h-4 mr-2" /> Start</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Generate Your AI Report</h3>
            <p className="text-muted-foreground max-w-md mb-6">Our AI will analyze your cognitive profile and quiz history to create a deeply personalized study plan and insights report.</p>
            <Button onClick={generateAiReport} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QUIZ HISTORY TABLE */}
      {quizzes.length > 0 && (
        <Card>
          <CardHeader>
             <CardTitle>Recent Quiz History</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                         <th className="px-4 py-3 rounded-tl-lg">Date</th>
                         <th className="px-4 py-3">Subject</th>
                         <th className="px-4 py-3">Type</th>
                         <th className="px-4 py-3 rounded-tr-lg">Score</th>
                      </tr>
                   </thead>
                   <tbody>
                      {quizzes.slice(-10).reverse().map((q) => (
                         <tr key={q.id} className="border-b last:border-0">
                            <td className="px-4 py-3 font-medium">{new Date(q.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{q.subject_name || "Mixed"}</td>
                            <td className="px-4 py-3 capitalize">{q.scope}</td>
                            <td className="px-4 py-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  (q.percentage || 0) >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  (q.percentage || 0) >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                               }`}>
                                  {q.percentage}%
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </CardContent>
        </Card>
      )}

      {/* WEEKLY REPORT EXPORT MODAL */}
      <WeeklyReportExportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
    </div>
  );
}
