import { useState } from 'react';
import { Dumbbell, Sparkles, Check, X, ArrowRight, Loader2, RotateCcw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAIPractice } from '@/hooks/useAIContent';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonPracticeProps {
  lessonId: string;
  lessonTitle: string;
  onComplete?: (correct: number, total: number) => void;
}

export function LessonPractice({ lessonId, lessonTitle, onComplete }: LessonPracticeProps) {
  const { practice, isLoading, generatePractice } = useAIPractice(lessonId);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const handleGeneratePractice = () => {
    generatePractice.mutate({ lessonTitle });
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !practice?.questions) return;

    const isCorrect = selectedAnswer === practice.questions[currentQuestion].correctAnswer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    setShowResult(true);
    setShowHint(false);
  };

  const handleNextQuestion = () => {
    if (!practice?.questions) return;

    if (currentQuestion < practice.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setPracticeCompleted(true);
      const finalCorrect = correctCount + (selectedAnswer === practice.questions[currentQuestion].correctAnswer ? 1 : 0);
      onComplete?.(finalCorrect, practice.questions.length);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setShowHint(false);
    setPracticeCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!practice?.is_ready || !practice.questions?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-accent" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Generate Practice</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Get 25 practice questions to reinforce your learning and identify areas for improvement.
            </p>
          </div>
          <Button 
            onClick={handleGeneratePractice}
            disabled={generatePractice.isPending}
            className="gap-2"
          >
            {generatePractice.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Practice
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (practiceCompleted) {
    const percentage = Math.round((correctCount / practice.questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-8"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <Dumbbell className="w-12 h-12 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Practice Complete!</h2>
          <p className="text-muted-foreground">
            You got {correctCount} out of {practice.questions.length} correct ({percentage}%)
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = practice.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / practice.questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {practice.questions.length}
          </span>
          <div className="flex items-center gap-3">
            {question.topic && (
              <Badge variant="secondary">{question.topic}</Badge>
            )}
            <span className="font-medium text-accent">
              {correctCount} correct
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg leading-relaxed flex-1">
                {question.question}
              </CardTitle>
              {!showResult && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="shrink-0"
                >
                  <Lightbulb className={cn("w-4 h-4", showHint && "text-yellow-500")} />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {showHint && !showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4"
                >
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    💡 Think about the key concepts from this lesson...
                  </p>
                </motion.div>
              )}

              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border-2 transition-all",
                    selectedAnswer === index && !showResult && "border-accent bg-accent/5",
                    showResult && index === question.correctAnswer && "border-success bg-success/10",
                    showResult && selectedAnswer === index && index !== question.correctAnswer && "border-destructive bg-destructive/10",
                    !showResult && selectedAnswer !== index && "hover:border-accent/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      selectedAnswer === index && !showResult && "bg-accent text-accent-foreground",
                      showResult && index === question.correctAnswer && "bg-success text-success-foreground",
                      showResult && selectedAnswer === index && index !== question.correctAnswer && "bg-destructive text-destructive-foreground",
                      !showResult && selectedAnswer !== index && "bg-muted"
                    )}>
                      {showResult ? (
                        index === question.correctAnswer ? <Check className="w-4 h-4" /> : 
                        selectedAnswer === index ? <X className="w-4 h-4" /> : 
                        String.fromCharCode(65 + index)
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {showResult && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-muted/50 border"
            >
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end">
        {!showResult ? (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < practice.questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'See Results'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
