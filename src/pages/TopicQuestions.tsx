import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
  Clock,
  Trophy,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatSubjectSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
  xp_reward: number;
  time_limit_seconds: number;
}

interface UnitInfo {
  id: string;
  title: string;
  icon_emoji: string;
}

const TopicQuestions = () => {
  const navigate = useNavigate();
  const { subjectSlug, unitId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!unitId || !user) return;

      try {
        // Fetch unit info
        const { data: unitData, error: unitError } = await supabase
          .from("units")
          .select("id, title, icon_emoji, subject_id")
          .eq("id", unitId)
          .single();

        if (unitError) throw unitError;
        setUnit(unitData);

        // Fetch questions for topics related to this unit's subject
        const { data: topics } = await supabase
          .from("topics")
          .select("id")
          .eq("subject_id", unitData.subject_id);

        if (topics && topics.length > 0) {
          const topicIds = topics.map((t) => t.id);
          const { data: questionsData, error: questionsError } = await supabase
            .from("quiz_questions")
            .select("*")
            .in("topic_id", topicIds)
            .limit(15);

          if (questionsError) throw questionsError;

          const formatted = (questionsData || []).map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string || "[]"),
          }));

          // Shuffle questions
          setQuestions(formatted.sort(() => Math.random() - 0.5));
        }
      } catch (error) {
        console.error("Error loading topic questions:", error);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [unitId, user]);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0 || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, showResult]);

  // Start timer when question loads
  useEffect(() => {
    if (questions.length > 0 && !isComplete && !showResult) {
      const currentQuestion = questions[currentIndex];
      setTimeLeft(currentQuestion?.time_limit_seconds || 30);
      setIsTimerActive(true);
    }
  }, [currentIndex, questions, isComplete]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    setShowResult(true);
    setIsCorrect(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !user) return;

    setIsTimerActive(false);
    const currentQuestion = questions[currentIndex];
    const correct = selectedAnswer === currentQuestion.correct_answer;

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + currentQuestion.xp_reward);
    }

    // Record attempt
    try {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        is_correct: correct,
        xp_earned: correct ? currentQuestion.xp_reward : 0,
        time_taken_seconds: currentQuestion.time_limit_seconds - timeLeft,
      });
    } catch (error) {
      console.error("Error recording attempt:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setXpEarned(0);
    setIsComplete(false);
    setQuestions((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unit || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <HelpCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Questions Available</h2>
        <p className="text-muted-foreground">Topic questions will be available soon.</p>
        <Button onClick={() => navigate(`/subjects/${subjectSlug}/unit/${unitId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Unit
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                <Trophy className="h-12 w-12 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-muted-foreground mb-6">
                You answered {score} out of {questions.length} questions correctly
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="text-3xl font-bold text-primary">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </Card>
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <div className="text-3xl font-bold text-accent flex items-center justify-center gap-1">
                    <Zap className="h-6 w-6" />
                    {xpEarned}
                  </div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </Card>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(`/subjects/${subjectSlug}/unit/${unitId}`)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Unit
                </Button>
                <Button onClick={handleRestart}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <RequireSubjectAccess subject={formatSubjectSlug(subjectSlug)}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/subjects/${subjectSlug}/unit/${unitId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{unit.icon_emoji}</span>
              <span className="font-medium text-sm hidden sm:inline">{unit.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <HelpCircle className="h-3 w-3" />
              {currentIndex + 1} / {questions.length}
            </Badge>
            <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft}s
            </Badge>
          </div>
        </div>
        <Progress value={progressPercent} className="h-1 rounded-none" />
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      currentQuestion.difficulty === 1 && "bg-green-100 text-green-800",
                      currentQuestion.difficulty === 2 && "bg-yellow-100 text-yellow-800",
                      currentQuestion.difficulty === 3 && "bg-red-100 text-red-800"
                    )}
                  >
                    {currentQuestion.difficulty === 1 ? "Easy" : currentQuestion.difficulty === 2 ? "Medium" : "Hard"}
                  </Badge>
                  <div className="flex items-center gap-1 text-accent">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">{currentQuestion.xp_reward} XP</span>
                  </div>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = option === currentQuestion.correct_answer;
                  
                  let optionStyle = "border-2 border-border hover:border-primary/50";
                  if (showResult) {
                    if (isCorrectOption) {
                      optionStyle = "border-2 border-green-500 bg-green-50";
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = "border-2 border-red-500 bg-red-50";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-2 border-primary bg-primary/5";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all",
                        optionStyle,
                        !showResult && !isSelected && "hover:bg-secondary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm shrink-0",
                            showResult && isCorrectOption
                              ? "bg-green-500 text-white"
                              : showResult && isSelected && !isCorrectOption
                              ? "bg-red-500 text-white"
                              : isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          )}
                        >
                          {showResult && isCorrectOption ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : showResult && isSelected && !isCorrectOption ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Explanation */}
            {showResult && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(
                  "mb-6",
                  isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={cn(
                          "font-medium mb-1",
                          isCorrect ? "text-green-800" : "text-red-800"
                        )}>
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {!showResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg">
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    "View Results"
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </RequireSubjectAccess>
  );
};

export default TopicQuestions;
