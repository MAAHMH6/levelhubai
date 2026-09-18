import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, BookOpen, AlertCircle, Sparkles, Loader2, Clock, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ChildAcademicReportProps {
  childId: string;
}

interface SubjectData {
  id: string;
  name: string;
  color?: string;
}

export function ChildAcademicReport({ childId }: ChildAcademicReportProps) {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Store reports by subject_id
  const [reports, setReports] = useState<Record<string, any>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  useEffect(() => {
    if (childId) loadSubjects();
  }, [childId]);

  const loadSubjects = async () => {
    try {
      // Find what subjects the child has progress in
      const { data: progress } = await supabase
        .from("subject_progress")
        .select("subject_id, subjects(id, name, color)")
        .eq("user_id", childId);
      
      if (progress) {
        // deduplicate and extract subject data
        const uniqueSubjects = new Map();
        progress.forEach((p: any) => {
          if (p.subjects && !uniqueSubjects.has(p.subject_id)) {
            uniqueSubjects.set(p.subject_id, {
              id: p.subjects.id,
              name: p.subjects.name,
              color: p.subjects.color
            });
          }
        });
        setSubjects(Array.from(uniqueSubjects.values()));
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error loading subjects", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (subjectId: string, subjectName: string) => {
    setGeneratingFor(subjectId);
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
          target_audience: "parent",
          student_id: childId
        })
      });
      
      if (!res.ok) throw new Error("Failed to generate report");
      
      const { data } = await res.json();
      setReports(prev => ({ ...prev, [subjectId]: data }));
      toast({ title: `${subjectName} analysis complete!` });
    } catch (err: any) {
      toast({ title: "Error generating report", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingFor(null);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Your child has not started any subjects yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subjects.map((subject) => {
        const report = reports[subject.id];
        const isGenerating = generatingFor === subject.id;

        return (
          <Collapsible key={subject.id} className="border rounded-lg bg-card overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: subject.color || "hsl(var(--primary))" }}
                >
                  {subject.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground flex gap-2 items-center">
                    {report?.predicted_grade ? (
                      <span className="text-primary font-medium">Trajectory: {report.predicted_grade}</span>
                    ) : (
                      <span>Click to view detailed progress</span>
                    )}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 pt-0 border-t bg-muted/20">
                {!report ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Generate an AI-powered holistic report for {subject.name} combining quiz scores, reading engagement, and time management.</p>
                    <Button 
                      onClick={() => generateReport(subject.id, subject.name)}
                      disabled={isGenerating}
                      variant="default"
                    >
                      {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Child Data...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Detailed Report</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    
                    {/* The 4 Core Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-background rounded-md border p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Predicted Grade</div>
                        <div className="text-2xl font-black text-primary">{report.predicted_grade || "?"}</div>
                      </div>
                      <div className="bg-background rounded-md border p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Study Habit</div>
                        <div className="text-sm font-bold flex items-center justify-center gap-1 mt-2">
                          <CheckCircle className="w-4 h-4 text-success" /> Consistent
                        </div>
                      </div>
                      <div className="bg-background rounded-md border p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Time Mgmt</div>
                        <div className="text-sm font-bold flex items-center justify-center gap-1 mt-2">
                          <Clock className="w-4 h-4 text-warning" /> Needs Work
                        </div>
                      </div>
                      <div className="bg-background rounded-md border p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Coverage</div>
                        <div className="text-sm font-bold flex items-center justify-center gap-1 mt-2">
                          <BookOpen className="w-4 h-4 text-primary" /> On Track
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-primary" /> AI Summary
                      </h4>
                      <p className="text-sm leading-relaxed">{report.summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                        <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {report.strengths?.map((s: string, i: number) => (
                            <li key={i} className="flex gap-2"><span className="text-success">•</span> {s}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <h4 className="font-semibold text-warning flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4" /> Growth Areas
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {report.weaknesses?.map((w: string, i: number) => (
                            <li key={i} className="flex gap-2"><span className="text-warning">•</span> {w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
