import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectCurriculum } from "@/hooks/useSubjectCurriculum";
import { SyllabusPlanner } from "@/components/subjects/SyllabusPlanner";
import { SubjectPerformanceReport } from "@/components/performance/SubjectPerformanceReport";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  Zap, 
  FileText, 
  Bot,
  Lock,
  CheckCircle,
  ChevronRight,
  Clock,
  Trophy,
  Target,
  Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn, formatSubjectSlug } from "@/lib/utils";
import { AITutorChat } from "@/components/ai/AITutorChat";
import { SubjectQuizTab } from "@/components/quiz/SubjectQuizTab";
import { SubjectBadgeShowcase } from "@/components/badges/SubjectBadgeShowcase";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";
import { SubjectRelatedBlogs } from "@/components/blog/SubjectRelatedBlogs";

const SubjectOverview = () => {
  const navigate = useNavigate();
  const { subjectSlug, subjectId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [showAITutor, setShowAITutor] = useState(false);
  
  const rawParam = subjectSlug || subjectId || '';
  const isParamUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam);
  const subjectName = isParamUuid ? rawParam : formatSubjectSlug(rawParam);
  
  const isALevelRoute = location.pathname.startsWith('/a-level');
  const { units, loading, error, getTotalStats, exactSubjectName } = useSubjectCurriculum(subjectName, isALevelRoute ? 'a_level' : undefined);

  // Fetch subject data including subject_code
  const { data: subjectData } = useQuery({
    queryKey: ['subject-by-name', subjectName, location.pathname],
    queryFn: async () => {
      if (isParamUuid) {
        const { data: byId } = await supabase
          .from('subjects')
          .select('id, name, icon, description, subject_code, qualification')
          .eq('id', rawParam)
          .maybeSingle();
        if (byId) return byId;
      }

      // Check subject_code
      let codeQuery = supabase
        .from('subjects')
        .select('id, name, icon, description, subject_code, qualification')
        .eq('subject_code', rawParam);
      if (isALevelRoute) {
        codeQuery = codeQuery.eq('qualification', 'a_level');
      }
      const { data: byCode } = await codeQuery.limit(1).maybeSingle();
      if (byCode) return byCode;
      
      let query = supabase
        .from('subjects')
        .select('id, name, icon, description, subject_code, qualification')
        .ilike('name', subjectName);
        
      if (isALevelRoute) {
        query = query.eq('qualification', 'a_level');
      } else {
        query = query.neq('qualification', 'a_level');
      }

      let { data, error } = await query.limit(1).maybeSingle();
      
      if (!data) {
        const fallbackQuery = subjectName.replace(/-/g, ' ').replace(/ /g, '%');
        let fbQuery = supabase
          .from('subjects')
          .select('id, name, icon, description, subject_code, qualification')
          .ilike('name', `%${fallbackQuery}%`);
          
        if (isALevelRoute) {
          fbQuery = fbQuery.eq('qualification', 'a_level');
        } else {
          fbQuery = fbQuery.neq('qualification', 'a_level');
        }
          
        const { data: fallbackData } = await fbQuery.limit(1).maybeSingle();
        data = fallbackData;
      }
      return data;
    },
    enabled: !!subjectName,
  });

  const subjectCodeDisplay = (subjectData as any)?.subject_code || subjectName;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Command Center
        </Button>
      </div>
    );
  }

  const stats = getTotalStats();
  const firstUnlockedUnit = units.find(u => u.progress?.is_unlocked);

  return (
    <RequireSubjectAccess subject={exactSubjectName || subjectData?.name || subjectName}>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/learn")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:block">LevelHubAI</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">
                  {(() => {
                    const n = (subjectName || '').toLowerCase();
                    if (n.includes('ict') || n.includes('computer')) return '💻';
                    if (n.includes('physic')) return '⚡';
                    if (n.includes('chem')) return '🧪';
                    if (n.includes('bio')) return '🧬';
                    if (n.includes('econ') || n.includes('account') || n.includes('business')) return '📊';
                    if (n.includes('english') || n.includes('urdu') || n.includes('islam') || n.includes('pakistan')) return '📖';
                    return '📐';
                  })()}
                </span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{subjectName}</h1>
                  <p className="text-muted-foreground">{subjectCodeDisplay}</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Master {subjectName.toLowerCase()} with our comprehensive curriculum covering all O-Level and IGCSE topics.
              </p>
            </div>
            
            <div className="flex flex-col items-start lg:items-end gap-2">
              <div className="text-sm text-muted-foreground">Overall Progress</div>
              <div className="text-3xl font-bold text-primary">{stats.overallProgress}%</div>
              <Progress value={stats.overallProgress} className="w-48 h-3" />
              <div className="text-sm text-muted-foreground">
                {stats.completedLessons} / {stats.totalLessons} lessons completed
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {/* Start Learning */}
          <Card 
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-primary/20 hover:border-primary/50"
            onClick={() => firstUnlockedUnit && navigate(`/subjects/${subjectSlug}/unit/${firstUnlockedUnit.id}`)}
          >
            <CardContent className="p-5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Start Learning</h3>
              <p className="text-xs text-muted-foreground">Begin with Unit 1</p>
            </CardContent>
          </Card>

          {/* Quick Quiz */}
          <Card 
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-accent/50"
            onClick={() => {
              if (subjectData?.id) {
                navigate(`/quiz?tab=subject&subject_id=${subjectData.id}`);
              }
            }}
          >
            <CardContent className="p-5">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">Quick Quiz</h3>
              <p className="text-xs text-muted-foreground">
                {stats.completedLessons > 0 ? "5 random questions" : "Complete a lesson first"}
              </p>
            </CardContent>
          </Card>

          {/* Past Papers */}
          <Card 
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-level/50"
            onClick={() => navigate(`/subjects/${subjectSlug}/past-papers`)}
          >
            <CardContent className="p-5">
              <div className="w-12 h-12 bg-level/10 rounded-xl flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-level" />
              </div>
              <h3 className="font-semibold mb-1">Past Papers</h3>
              <p className="text-xs text-muted-foreground">20 complete papers</p>
            </CardContent>
          </Card>

          {/* AI Tutor */}
          <Card 
            className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-success/50"
            onClick={() => setShowAITutor(true)}
          >
            <CardContent className="p-5">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-3">
                <Bot className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1">AI Tutor</h3>
              <p className="text-xs text-muted-foreground">Get instant help</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Learning Path, Quiz, and Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="units" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="units" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger 
                value="quiz" 
                className="gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  if (subjectData?.id) {
                    navigate(`/quiz?tab=subject&subject_id=${subjectData.id}`);
                  } else {
                    navigate('/quiz');
                  }
                }}
              >
                <Target className="h-4 w-4" />
                Subject Quiz
              </TabsTrigger>
              <TabsTrigger value="syllabus" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Syllabus
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-2">
                <Trophy className="h-4 w-4" />
                Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="units">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold">Learning Path</h2>
                <Badge variant="secondary">{units.length} Units</Badge>
              </div>

              <div className="grid gap-4">
                {units.map((unit, index) => {
                  const isUnlocked = unit.progress?.is_unlocked ?? (index === 0);
                  const progress = unit.progress?.progress_percentage ?? 0;
                  const isCompleted = progress >= 100;
                  const isInProgress = progress > 0 && progress < 100;

                  return (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "transition-all",
                          isUnlocked 
                            ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
                            : "opacity-60 border-2 border-dashed",
                          isCompleted && "border-success/50 bg-success/5",
                          isInProgress && "border-primary/30"
                        )}
                        onClick={() => {
                          const navSlug = subjectSlug || (subjectData?.name ? subjectData.name.toLowerCase().replace(/\s+/g, '-') : rawParam);
                          if (isUnlocked) navigate(`/subjects/${navSlug}/unit/${unit.id}`);
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Unit Icon & Number */}
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                                isUnlocked ? "bg-primary/10" : "bg-muted"
                              )}>
                                {isUnlocked ? unit.icon_emoji : <Lock className="h-6 w-6 text-muted-foreground" />}
                              </div>
                              <div className="md:hidden">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">Unit {unit.unit_number}</span>
                                  {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                                </div>
                                <h3 className="font-semibold">{unit.title}</h3>
                              </div>
                            </div>

                            {/* Unit Info */}
                            <div className="flex-1 hidden md:block">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">Unit {unit.unit_number}</span>
                                {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                              </div>
                              <h3 className="font-semibold text-lg">{unit.title}</h3>
                              {unit.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{unit.description}</p>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{unit.duration_weeks || "2-3 weeks"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span>{unit.lessons.length} lessons</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-accent" />
                                <span className="font-medium">{unit.total_xp.toLocaleString()} XP</span>
                              </div>
                            </div>

                            {/* Progress & Action */}
                            <div className="flex items-center gap-4">
                              {isUnlocked && (
                                <div className="w-24">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              )}
                              
                              {isUnlocked ? (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {units.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No units available yet. Check back soon!</p>
                  <Button variant="outline" onClick={() => navigate("/learn")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Command Center
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quiz">
              <div className="rounded-xl border bg-card p-8 text-center space-y-4">
                <Target className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Subject quizzes have moved to the Quizzes Hub</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">All Subject, Unit, Lesson and Past Paper practice is now in one central place — generated live from the curriculum.</p>
                  <Button 
                    onClick={() => {
                      if (subjectData?.id) {
                        navigate(`/quiz?tab=subject&subject_id=${subjectData.id}`);
                      } else {
                        navigate('/quiz');
                      }
                    }}
                  >
                    Open Quizzes Hub
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="syllabus">
              <SyllabusPlanner subjectId={subjectData?.id} />
            </TabsContent>

            <TabsContent value="performance">
              <SubjectPerformanceReport subjectId={subjectData?.id} subjectName={subjectData?.name} />
            </TabsContent>

            <TabsContent value="badges">
              {subjectData?.id && (
                <SubjectBadgeShowcase 
                  subjectId={subjectData.id}
                  subjectName={subjectName}
                />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Related Blogs Section */}
        {subjectData && (
          <SubjectRelatedBlogs 
            program={isALevelRoute ? "A Level" : (window.location.hostname.includes("igcse") ? "IGCSE" : "O Level")} 
            subject={exactSubjectName || subjectData.name} 
          />
        )}
      </main>

      {/* AI Tutor Chat */}
      <AITutorChat 
        isOpen={showAITutor} 
        onClose={() => setShowAITutor(false)}
        subjectName={subjectData?.name}
        qualification={subjectData?.qualification}
      />
    </div>
    </RequireSubjectAccess>
  );
};

export default SubjectOverview;
