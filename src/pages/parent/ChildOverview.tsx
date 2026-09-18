import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Brain, Activity, Target, Loader2, LogOut, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AIParentAssistant } from "@/components/parent/AIParentAssistant";
import { ChildAcademicReport } from "@/components/parent/ChildAcademicReport";
import { WeeklyReportContent } from "@/components/reporting/WeeklyReportContent";

export default function ChildOverview() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: child, isLoading } = useQuery({
    queryKey: ["child_details", childId],
    enabled: !!childId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", childId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  if (authLoading || isLoading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (!child) {
    return <div className="p-8 text-center text-destructive">Child not found or access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/parent/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-xl">{child.display_name}'s Performance</h1>
              <p className="text-sm text-muted-foreground">Grade 8 • Last active today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.print()} 
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Weekly Report</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 overflow-x-auto whitespace-nowrap w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Overview</TabsTrigger>
            <TabsTrigger value="weekly-report" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">Weekly Report & Spider Web</TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Academic</TabsTrigger>
            <TabsTrigger value="cognitive" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Cognitive</TabsTrigger>
            <TabsTrigger value="action-plan" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">Action Plan</TabsTrigger>
            <TabsTrigger value="assistant" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Performance</CardTitle>
                  <Activity className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <Progress value={78} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Academic</CardTitle>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82%</div>
                  <Progress value={82} className="h-1 mt-2 bg-blue-100 [&>div]:bg-blue-500" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cognitive</CardTitle>
                  <Brain className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76%</div>
                  <Progress value={76} className="h-1 mt-2 bg-purple-100 [&>div]:bg-purple-500" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Taken</CardTitle>
                  <Target className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground mt-2">+3 this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex gap-2 items-start">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-0.5">
                        <Target className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Strong Verbal Reasoning</p>
                        <p className="text-xs text-muted-foreground">Consistently performs well in language comprehension.</p>
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-0.5">
                        <Target className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Mathematical Accuracy</p>
                        <p className="text-xs text-muted-foreground">High accuracy rate in algebra and equations.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Growth Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex gap-2 items-start">
                      <div className="bg-warning/20 text-warning rounded-full p-1 mt-0.5">
                        <Target className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Problem Solving</p>
                        <p className="text-xs text-muted-foreground">Struggles with multi-step word problems. Needs more practice.</p>
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="bg-warning/20 text-warning rounded-full p-1 mt-0.5">
                        <Target className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Time Management</p>
                        <p className="text-xs text-muted-foreground">Often runs out of time on timed quizzes.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="academic">
            <div className="py-6 max-w-4xl mx-auto">
              <ChildAcademicReport childId={child.id} />
            </div>
          </TabsContent>

          <TabsContent value="weekly-report" className="space-y-6">
            <div className="py-4 max-w-5xl mx-auto">
              <WeeklyReportContent 
                childId={child.id} 
                studentName={child.display_name} 
                onPrint={() => window.print()} 
              />
            </div>
          </TabsContent>

          <TabsContent value="cognitive">
            <div className="py-4 max-w-5xl mx-auto">
              <WeeklyReportContent 
                childId={child.id} 
                studentName={child.display_name} 
                onPrint={() => window.print()} 
              />
            </div>
          </TabsContent>

          <TabsContent value="action-plan">
             <div className="text-center py-12 text-muted-foreground">
              Action Plan content goes here.
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <div className="py-6 max-w-3xl mx-auto">
              <AIParentAssistant childId={child.id} childName={child.display_name || "Student"} />
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
