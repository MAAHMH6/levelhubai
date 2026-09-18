import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, FileText, Brain, Dumbbell, CheckCircle, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatSubjectSlug } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonDetails } from '@/hooks/useLessonDetails';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';
import { LessonNotes } from '@/components/lesson/LessonNotes';

import { LessonPractice } from '@/components/lesson/LessonPractice';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RequireSubjectAccess } from '@/components/billing/RequireSubjectAccess';
import { AITutorChat } from '@/components/ai/AITutorChat';
import { MessageSquare } from 'lucide-react';

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string; lesson_number: number } | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const {
    lesson,
    isLoadingLesson,
    progress,
    isLoadingProgress,
    initializeProgress,
    updateVideoProgress,
    markLessonComplete,
  } = useLessonDetails(lessonId);

  useEffect(() => {
    if (user && lessonId && !progress && !isLoadingProgress) {
      initializeProgress.mutate();
    }
  }, [user, lessonId, progress, isLoadingProgress]);

  // Fetch next lesson in the same unit
  useEffect(() => {
    if (!lesson) return;
    const fetchNextLesson = async () => {
      const { data } = await supabase
        .from('lessons')
        .select('id, title, lesson_number')
        .eq('unit_id', lesson.unit_id)
        .gt('lesson_number', lesson.lesson_number)
        .order('lesson_number', { ascending: true })
        .limit(1)
        .maybeSingle();
      setNextLesson(data);
    };
    fetchNextLesson();
  }, [lesson]);

  const handleVideoProgress = (position: number, percentage: number, completed: boolean) => {
    updateVideoProgress.mutate({ position, percentage, completed });
  };

  const handleMarkComplete = async () => {
    if (!user || !lesson || progress?.lesson_completed) return;
    setMarkingComplete(true);
    try {
      const result = await markLessonComplete.mutateAsync();
      const { track } = await import('@/lib/analytics');
      track('lesson_completed', { lesson_id: lesson.id, lesson_title: lesson.title, xp_earned: result.xpToAward });
      if (result.xpToAward) track('xp_earned', { amount: result.xpToAward, source: 'lesson' });
      navigate('/lesson-complete', {
        state: {
          lessonTitle: lesson.title,
          xpEarned: result.xpToAward,
          nextLessonId: nextLesson?.id,
          nextLessonTitle: nextLesson?.title,
          unitTitle: (lesson as any).units?.title || '',
          subjectSlug: subjectName.toLowerCase().replace(/\s+/g, '-'),
        }
      });

    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark lesson as complete.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNextLesson = () => {
    if (!nextLesson) return;
    navigate(`/lesson/${nextLesson.id}`);
  };

  if (isLoadingLesson) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Lesson not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const subjectName = (lesson as any).units?.subjects?.name || 'Mathematics';
  const qualification = (lesson as any).units?.subjects?.qualification;
  const unitTitle = (lesson as any).units?.title || '';
  const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');

  const videoCompleted = progress?.video_completed || false;
  const quizCompleted = progress?.quiz_status === 'passed';
  const practiceCompleted = progress?.practice_status === 'completed';
  const overallProgress = [videoCompleted, quizCompleted, practiceCompleted].filter(Boolean).length;

  return (
    <RequireSubjectAccess subject={formatSubjectSlug(subjectSlug)}>
      <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <nav className="text-sm text-muted-foreground mb-1">
                  <Link to={`/${qualification === 'a_level' ? 'a-level' : 'subjects'}/${subjectSlug}`} className="hover:text-primary">
                    {subjectName}
                  </Link>
                  {' / '}
                  <span>{unitTitle}</span>
                </nav>
                <h1 className="text-xl font-bold">{lesson.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{lesson.video_duration_display || '~10 min'}</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 text-xp" />
                {lesson.xp_reward} XP
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden md:flex"
                onClick={() => setShowAITutor(true)}
              >
                <MessageSquare className="w-4 h-4" />
                Ask Tutor
              </Button>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Progress value={(overallProgress / 3) * 100} className="h-2" />
            </div>
            <div className="flex items-center gap-2">
              <ProgressStep completed={videoCompleted} icon={Play} label="Video" />
              <ProgressStep completed={quizCompleted} icon={Brain} label="Quiz" />
              <ProgressStep completed={practiceCompleted} icon={Dumbbell} label="Practice" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="video" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="video" className="gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4">
            <VideoPlayer
              videoUrl={lesson.video_url}
              initialPosition={progress?.video_last_position_seconds || 0}
              onProgressUpdate={handleVideoProgress}
              lessonTitle={lesson.title}
            />
            {lesson.description && (
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">About this lesson</h3>
                <p className="text-muted-foreground">{lesson.description}</p>
              </div>
            )}

            {/* Mark as Complete & Next Lesson */}
            <div className="flex items-center justify-between pt-2 gap-3">
              {!progress?.lesson_completed ? (
                <Button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  {markingComplete ? 'Completing...' : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              ) : (
                <Badge variant="outline" className="gap-1.5 py-2 px-3 text-success border-success/30">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </Badge>
              )}

              {nextLesson && (
                <Button
                  onClick={handleNextLesson}
                  size="lg"
                  className="gap-2"
                >
                  Next: {nextLesson.title}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <LessonNotes lessonId={lessonId!} lessonTitle={lesson.title} />
          </TabsContent>

          <TabsContent value="quiz">
            <div className="rounded-xl border bg-card p-8 text-center space-y-4">
              <Brain className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h3 className="text-xl font-bold">Take this lesson's quiz in the Quizzes Hub</h3>
                <p className="text-sm text-muted-foreground mt-2">All quizzes are now AI-generated from the official curriculum in one place.</p>
              </div>
              <Button size="lg" onClick={() => navigate(`/quiz?tab=lesson&subject_id=${(lesson as any)?.units?.subject_id}&unit_id=${lesson?.unit_id}&lesson_id=${lesson?.id}`)}>
                Open Lesson Quiz
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="practice">
            <LessonPractice lessonId={lessonId!} lessonTitle={lesson.title} />
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Tutor Chat */}
      <AITutorChat 
        isOpen={showAITutor} 
        onClose={() => setShowAITutor(false)}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        unitTitle={unitTitle}
        subjectName={subjectName}
        qualification={qualification}
      />
    </div>
    </RequireSubjectAccess>
  );
}

function ProgressStep({ 
  completed, 
  icon: Icon, 
  label 
}: { 
  completed: boolean; 
  icon: React.ElementType; 
  label: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors",
      completed 
        ? "bg-success/10 text-success" 
        : "bg-muted text-muted-foreground"
    )}>
      {completed ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      <span className="hidden md:inline">{label}</span>
    </div>
  );
}
