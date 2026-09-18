import { useState } from 'react';
import { Brain, Sparkles, Check, X, ArrowRight, Loader2, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAIQuiz } from '@/hooks/useAIContent';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonQuizProps {
  lessonId: string;
  lessonTitle: string;
  onComplete?: (score: number, total: number) => void;
}

export function LessonQuiz({ lessonId, lessonTitle, onComplete }: LessonQuizProps) {
  const { quiz, isLoading, generateQuiz } = useAIQuiz(lessonId);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleGenerateQuiz = () => {
    generateQuiz.mutate(lessonTitle);
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !quiz?.questions) return;

    const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correctAnswer;
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswers([...answers, isCorrect]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!quiz?.questions) return;

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      onComplete?.(score + (selectedAnswer === quiz.questions[currentQuestion].correctAnswer ? 1 : 0), quiz.questions.length);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz?.is_ready || !quiz.questions?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Generate Quiz</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Test your understanding with AI-generated questions tailored to this lesson.
            </p>
          </div>
          <Button 
            onClick={handleGenerateQuiz}
            disabled={generateQuiz.isPending}
            className="gap-2"
          >
            {generateQuiz.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted) {
    const finalScore = score;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-8"
      >
        <div className={cn(
          "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
          passed ? "bg-success/10" : "bg-destructive/10"
        )}>
          <Trophy className={cn("w-12 h-12", passed ? "text-success" : "text-destructive")} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Great job!' : 'Keep practicing!'}
          </h2>
          <p className="text-muted-foreground">
            You scored {finalScore} out of {totalQuestions} ({percentage}%)
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="font-medium text-primary">
            Score: {score}
          </span>
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
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border-2 transition-all",
                    selectedAnswer === index && !showResult && "border-primary bg-primary/5",
                    showResult && index === question.correctAnswer && "border-success bg-success/10",
                    showResult && selectedAnswer === index && index !== question.correctAnswer && "border-destructive bg-destructive/10",
                    !showResult && selectedAnswer !== index && "hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      selectedAnswer === index && !showResult && "bg-primary text-primary-foreground",
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
            {currentQuestion < quiz.questions.length - 1 ? (
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
