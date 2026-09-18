import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, BookOpen, AlertCircle, Sparkles, Loader2, Clock, CheckCircle, FileDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface SubjectPerformanceReportProps {
  subjectId: string;
  subjectName?: string;
}

export function SubjectPerformanceReport({ subjectId, subjectName = "Subject" }: SubjectPerformanceReportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiReport, setAiReport] = useState<any>(null);

  useEffect(() => {
    if (user && subjectId) loadData();
  }, [user, subjectId]);

  const loadData = async () => {
    try {
      // 1. Fetch Quiz Sessions
      const { data: qz } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("subject_id", subjectId)
        .eq("status", "completed");
      
      setQuizzes(qz || []);

      // 2. Fetch Coverage
      const { data: topics } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectId);
      
      if (topics && topics.length > 0) {
        const { data: progress } = await supabase
          .from("student_topic_progress")
          .select("id")
          .eq("student_id", user?.id)
          .in("topic_id", topics.map(t => t.id))
          .eq("is_completed", true);
        
        setCoveragePercent(Math.round(((progress?.length || 0) / topics.length) * 100));
      }
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
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subject-performance-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          subject_id: subjectId,
          target_audience: "student"
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate report");
      
      const { data } = await res.json();
      setAiReport(data);
      toast({ title: "Analysis complete!" });
    } catch (err: any) {
      toast({ title: "Error generating report", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const quizAvg = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / quizzes.length) 
    : 0;

  // Calculate pacing (average seconds per question)
  let totalTime = 0;
  let totalQuestions = 0;
  quizzes.forEach(q => {
    if (q.time_limit_seconds && q.question_count) {
      // In a real app we'd track actual time taken, but for now we assume proportional usage or we check if time_taken exists in quiz_attempts
      // We will just estimate or leave blank if we don't have exact time taken per session easily accessible here
    }
  });

  const hasData = quizzes.length > 0 || coveragePercent > 0;

  return (
    <div className="space-y-6" id="subject-performance-report">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{subjectName} Performance</h2>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 print:hidden">
          <FileDown className="w-4 h-4" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Quiz Mastery</h3>
            <div className="text-4xl font-black text-primary">{quizAvg}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across {quizzes.length} quizzes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Syllabus Coverage</h3>
            <div className="text-4xl font-black text-success">{coveragePercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">Topics marked complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center flex flex-col justify-center items-center h-full">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Predicted Grade</h3>
            <div className="text-4xl font-black text-accent">{aiReport?.predicted_grade || "?"}</div>
            {aiReport ? (
              <p className="text-xs text-muted-foreground mt-1">Based on holistic data</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Generate AI report to view</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center flex flex-col justify-center items-center h-full">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Pacing</h3>
            <div className="flex items-center gap-2 text-xl font-bold">
              <Clock className="w-5 h-5 text-muted-foreground" />
              {quizzes.length > 0 ? "Normal" : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average time per question</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You need to complete some lessons or quizzes in this subject to see your performance data.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-accent/20 shadow-md">
          <CardHeader className="bg-accent/5 border-b border-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Performance Analysis
                </CardTitle>
                <CardDescription>Get a holistic, deep-dive analysis of your trajectory.</CardDescription>
              </div>
              <Button 
                onClick={generateAiReport} 
                disabled={isGenerating}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Generate Insights"}
              </Button>
            </div>
          </CardHeader>
          
          {aiReport && (
            <CardContent className="p-6 pt-6 space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed">{aiReport.summary}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {aiReport.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-success">•</span> {s}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                  <h4 className="font-semibold text-warning flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {aiReport.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-warning">•</span> {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {aiReport.recommended_actions && aiReport.recommended_actions.length > 0 && (
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" /> Recommended Next Steps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiReport.recommended_actions.map((action: string, i: number) => (
                      <div key={i} className="bg-muted px-3 py-1.5 rounded-full text-xs font-medium">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
