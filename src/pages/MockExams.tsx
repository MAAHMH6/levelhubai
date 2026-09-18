import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, 
  FileText, 
  Sparkles, 
  Play, 
  Clock, 
  CheckCircle, 
  Award, 
  Flame, 
  Brain, 
  ArrowRight,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { featureStorage } from "@/integrations/supabase/featureClient";

export default function MockExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [myExams, setMyExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const [bpRes, exRes] = await Promise.all([
      supabase.from("exam_blueprints").select("*, subjects(name)").order("created_at", { ascending: false }),
      supabase.from("mock_exams").select("*, subjects(name), exam_blueprints(title)").eq("user_id", user?.id).order("started_at", { ascending: false })
    ]);
    
    if (bpRes.data) setBlueprints(bpRes.data);
    if (exRes.data) setMyExams(exRes.data);
    
    setLoading(false);
  };

  const { isPro, isSchool } = useSubscription();

  const generateExam = async (blueprint: any) => {
    if (!user) return;

    // Limit check for free tier students
    if (!isPro && !isSchool) {
      const daily = featureStorage.getDailyUsage();
      if (daily.mock_exam_used >= 1 || myExams.length >= 1) {
        toast({ 
          title: "Mock Exam Limit Reached", 
          description: "Free accounts include 1 AI Mock Exam. Upgrade to Cambridge Pro for unlimited mock exams and automatic mark scheme grading.",
          variant: "destructive" 
        });
        navigate('/billing');
        return;
      }
    }

    setGeneratingId(blueprint.id);
    toast({ title: "Generating Exam", description: "The AI is creating your unique mock exam. This takes about 30 seconds..." });
    
    const { data, error } = await supabase.functions.invoke("generate-mock-exam", {
      body: { 
        blueprint_id: blueprint.id, 
        user_id: user.id
      }
    });

    setGeneratingId(null);

    if (error || (data && data.error)) {
      toast({ title: "Failed to generate exam", description: error?.message || data?.error, variant: "destructive" });
    } else {
      featureStorage.incrementUsage('mock_exam');
      toast({ title: "Exam Ready!", description: "Your custom mock exam has been generated." });
      load();
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin w-8 h-8 text-teal-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Cambridge Mock Exam Blueprints...</p>
      </div>
    );
  }

  const completedExams = myExams.filter(e => e.score != null);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Cambridge Exam Simulator & Mark Scheme Grading</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Mock Exams
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Simulate actual Cambridge examination conditions with timed papers, real mark schemes, and instant AI assessment.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1">Available Blueprints</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{blueprints.length}</div>
          <div className="text-[10px] text-teal-600 font-semibold mt-1">Official Cambridge formats</div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="text-xs text-slate-400 mb-1">My Generated Exams</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{myExams.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{completedExams.length} attempted</div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 mb-1">Exam Mode</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Strict Timed</div>
          <div className="text-[10px] text-slate-400 mt-1">Anti-cheat + Auto submit</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <TabsTrigger value="available" className="rounded-xl font-bold text-xs px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-teal-600 data-[state=active]:shadow-xs">
            Available Templates ({blueprints.length})
          </TabsTrigger>
          <TabsTrigger value="my_exams" className="rounded-xl font-bold text-xs px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-teal-600 data-[state=active]:shadow-xs">
            My Generated Exams ({myExams.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Available Blueprints */}
        <TabsContent value="available" className="space-y-4">
          {blueprints.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Mock Exam Templates Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Cambridge exam blueprints are being indexed for your syllabus. Please check back shortly.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {blueprints.map((bp) => (
                <Card 
                  key={bp.id} 
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className="bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-xs font-bold">
                        {bp.subjects?.name || "Cambridge"}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 dark:border-slate-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {bp.structural_metadata?.metadata?.time_allowed || "120 mins"}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {bp.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      {bp.structural_metadata?.metadata?.total_marks || 80} Marks • {bp.structural_metadata?.metadata?.total_questions || 10} Questions
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Generates unique Cambridge questions matching syllabus structure.</span>
                    </p>
                    <Button 
                      className="w-full rounded-xl font-bold text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-xs" 
                      onClick={() => generateExam(bp)}
                      disabled={generatingId === bp.id}
                    >
                      {generatingId === bp.id ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Generating Exam...</>
                      ) : (
                        <>Generate Custom Exam <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Generated Exams */}
        <TabsContent value="my_exams" className="space-y-4">
          {myExams.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Sparkles className="w-12 h-12 mx-auto text-teal-500/40 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Generated Exams Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Select an exam template from the Available Templates tab to generate your first custom Cambridge mock exam.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myExams.map((exam) => (
                <Card 
                  key={exam.id} 
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {exam.status === "ready" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                          Ready to Take
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 animate-pulse text-xs">
                          Generating...
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 dark:border-slate-700">
                        {exam.time_limit_minutes ? `${exam.time_limit_minutes} mins` : "120 mins"}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {exam.exam_blueprints?.title ? `Mock: ${exam.exam_blueprints.title}` : "Cambridge Mock Exam"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Generated on {new Date(exam.started_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Score</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        {exam.score != null ? `${exam.score} / ${exam.total_marks || 100}` : "Not Attempted"}
                      </span>
                    </div>

                    {exam.status === "ready" ? (
                      <Button 
                        className="w-full rounded-xl font-bold text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                        onClick={() => navigate(`/take-mock-exam/${exam.id}`)}
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5" /> 
                        {exam.score != null ? "Review Exam Answers" : "Start Timed Exam"}
                      </Button>
                    ) : (
                      <Button className="w-full rounded-xl font-bold text-xs h-9" disabled variant="outline">
                        <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Preparing Exam...
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
