import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUnitDetails } from "@/hooks/useUnitDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  Play,
  HelpCircle,
  GraduationCap,
  Trophy
} from "lucide-react";
import { formatSubjectSlug } from "@/lib/utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";

const UnitDetail = () => {
  const navigate = useNavigate();
  const { subjectSlug, unitId } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const { unit, lessons, unitProgress, loading, error, getUnitStats } = useUnitDetails(unitId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">{error || "Unit not found"}</p>
        <Button onClick={() => navigate(`/subjects/${subjectSlug}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subject
        </Button>
      </div>
    );
  }

  const stats = getUnitStats();
  const unitQuizUnlocked = stats.progress >= 50;

  const getLessonStatus = (lesson: typeof lessons[0]) => {
    if (!lesson.isUnlocked) return "locked";
    if (lesson.progress?.lesson_completed) return "completed";
    if (lesson.progress?.video_completed || lesson.progress?.quiz_attempts > 0) return "in_progress";
    return "not_started";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Completed" };
      case "in_progress":
        return { icon: Play, color: "text-primary", bg: "bg-primary/10", label: "Continue" };
      case "not_started":
        return { icon: Play, color: "text-foreground", bg: "bg-secondary", label: "Start" };
      default:
        return { icon: Lock, color: "text-muted-foreground", bg: "bg-muted", label: "Locked" };
    }
  };

  return (
    <RequireSubjectAccess subject={formatSubjectSlug(subjectSlug)}>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/subjects/${subjectSlug}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">← Back to All Units</span>
          </div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Unit Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                {unit.icon_emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">Unit {unit.unit_number}</Badge>
                  {unit.duration_weeks && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {unit.duration_weeks}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{unit.title}</h1>
                {unit.description && (
                  <p className="text-muted-foreground max-w-2xl">{unit.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 bg-card p-4 rounded-xl border">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{lessons.length}</div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{unit.total_xp.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">XP Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.progress}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress value={stats.progress} className="w-full h-3" />
            </div>
          </div>
        </motion.div>

        {/* Learning Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {/* Video Lessons */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Video Lessons</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.completedLessons} / {stats.totalLessons} completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Quiz */}
          <Card 
            className={cn(
              "border-2 transition-all",
              unitQuizUnlocked 
                ? "cursor-pointer hover:border-accent/50 hover:shadow-md" 
                : "opacity-60 border-dashed"
            )}
            onClick={() => {
              if (unitQuizUnlocked && unitId) {
                navigate(`/quiz?tab=unit&unit_id=${unitId}`);
              }
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  unitQuizUnlocked ? "bg-accent/10" : "bg-muted"
                )}>
                  {unitQuizUnlocked ? (
                    <HelpCircle className="h-6 w-6 text-accent" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Unit Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    {unitQuizUnlocked 
                      ? "AI quiz from this unit's curriculum" 
                      : `Complete ${Math.ceil(lessons.length * 0.5) - stats.completedLessons} more lessons`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topic Questions */}
          <Card 
            className="cursor-pointer hover:border-level/50 hover:shadow-md border-2 transition-all"
            onClick={() => navigate(`/subjects/${subjectSlug}/unit/${unitId}/questions`)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-level/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-level" />
                </div>
                <div>
                  <h3 className="font-semibold">Topic Questions</h3>
                  <p className="text-sm text-muted-foreground">Practice past paper questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lessons List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Lessons</h2>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const config = getStatusConfig(status);
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card 
                    className={cn(
                      "transition-all",
                      lesson.isUnlocked 
                        ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 border hover:border-primary/30"
                        : "opacity-50 border-dashed"
                    )}
                    onClick={() => lesson.isUnlocked && navigate(`/subjects/${subjectSlug}/lesson/${lesson.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Lesson Number */}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0",
                          config.bg,
                          config.color
                        )}>
                          {status === "completed" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : status === "locked" ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            lesson.lesson_number
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {lesson.topic_name && (
                              <span className="text-xs text-muted-foreground">{lesson.topic_name}</span>
                            )}
                          </div>
                          <h3 className="font-medium truncate">{lesson.title}</h3>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                          {lesson.video_duration_display && (
                            <div className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              <span>{lesson.video_duration_display}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-accent" />
                            <span>{lesson.xp_reward} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            <span>{lesson.quiz_question_count}q</span>
                          </div>
                        </div>

                        {/* Progress / Action */}
                        {lesson.isUnlocked && (
                          <div className="flex items-center gap-3">
                            {lesson.progress && lesson.progress.video_watch_percentage > 0 && status !== "completed" && (
                              <div className="w-16 hidden sm:block">
                                <Progress value={lesson.progress.video_watch_percentage} className="h-1.5" />
                              </div>
                            )}
                            <Badge 
                              variant={status === "completed" ? "default" : "secondary"}
                              className={cn(
                                "gap-1",
                                status === "completed" && "bg-success hover:bg-success/90"
                              )}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {lessons.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No lessons available in this unit yet.</p>
              <Button variant="outline" onClick={() => navigate(`/subjects/${subjectSlug}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Units
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Unit Completion Badge Preview */}
        {stats.progress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Complete this unit to earn</h3>
                    <p className="text-muted-foreground">
                      🏆 <span className="font-semibold text-foreground">{unit.title} Master</span> badge
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
    </RequireSubjectAccess>
  );
};

export default UnitDetail;
