import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Star, ChevronRight, ArrowLeft, Trophy, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LessonCompleteState {
  lessonTitle: string;
  xpEarned: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
  unitTitle?: string;
  subjectSlug?: string;
}

export default function LessonComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LessonCompleteState | null;

  useEffect(() => {
    // Fire confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No lesson data</h1>
          <Button onClick={() => navigate('/learn')}>Go to Learn</Button>
        </div>
      </div>
    );
  }

  const handleNextLesson = () => {
    if (state.nextLessonId) {
      navigate(`/lesson/${state.nextLessonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Trophy icon */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-success" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold">Lesson Complete! 🎉</h1>
          <p className="text-muted-foreground text-lg">{state.lessonTitle}</p>
          {state.unitTitle && (
            <p className="text-sm text-muted-foreground">{state.unitTitle}</p>
          )}
        </motion.div>

        {/* XP earned */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl px-8 py-6 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              <span className="text-4xl font-bold text-primary">+{state.xpEarned}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">XP Earned</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <CheckCircle className="w-5 h-5 text-success mx-auto" />
            <p className="text-xs text-muted-foreground">Video</p>
            <p className="text-sm font-semibold">Done</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <Zap className="w-5 h-5 text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Quiz</p>
            <p className="text-sm font-semibold">Ready</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <Target className="w-5 h-5 text-accent mx-auto" />
            <p className="text-xs text-muted-foreground">Practice</p>
            <p className="text-sm font-semibold">Ready</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-3"
        >
          {state.nextLessonId && state.nextLessonTitle && (
            <Button
              onClick={handleNextLesson}
              size="lg"
              className="w-full gap-2 text-base"
            >
              Next: {state.nextLessonTitle}
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lesson
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/learn')}
            >
              All Subjects
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
