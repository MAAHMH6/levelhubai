import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle,
  Zap,
  Timer,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSubjectSlug } from '@/lib/utils';
import { toast } from 'sonner';
import { summarizePaper } from '@/services/aiService';
import { generatePaper } from '@/services/aiService';
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";

interface PaperQuestion {
  question: string;
  answer: string;
  marks?: number;
  topic?: string;
}

const PaperView = () => {
  const { subjectSlug, paperId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view'; // view, practice, timed
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paper, setPaper] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PaperQuestion[]>([]);
  const [showAnswers, setShowAnswers] = useState(mode === 'view');
  const [generating, setGenerating] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Timed mode state
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [finishedEarly, setFinishedEarly] = useState(false);

  // Practice/Timed AI mode state
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPaper();
  }, [paperId]);

  // Timer logic
  useEffect(() => {
    if (!timerStarted || examFinished || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setExamFinished(true);
          setShowAnswers(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, examFinished, timeRemaining]);

  const fetchPaper = async () => {
    try {
      const { data: paperData } = await supabase
        .from('past_papers')
        .select('*, subjects(id, name, color)')
        .eq('id', paperId)
        .single();

      if (paperData) {
        setPaper(paperData);
        setSubject((paperData as any).subjects);
        
        const qData = paperData.questions_data as any;
        if (Array.isArray(qData) && qData.length > 0) {
          setQuestions(qData as PaperQuestion[]);
        }

        if (mode === 'timed' && paperData.duration_minutes) {
          setTimeRemaining(paperData.duration_minutes * 60);
        }

        // For practice/timed AI mode, generate questions
        if ((mode === 'practice' || mode === 'timed') && (!Array.isArray(qData) || qData.length === 0)) {
          await generateAIPaper(paperData);
        }
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPaper = async (paperData: any) => {
    setGenerating(true);
    try {
      const subjectName = (paperData as any).subjects?.name || subjectSlug || 'General';
      const content = await generatePaper({ subject: subjectName });
      
      // Parse the generated content into questions
      const lines = content.split('\n');
      const parsedQuestions: any[] = [];
      let currentQ: any = null;

      for (const line of lines) {
        const qMatch = line.match(/^\d+[\.\)]\s*(.*)/);
        const optMatch = line.match(/^[A-D][\.\)]\s*(.*)/i);
        const ansMatch = line.match(/^(?:Answer|Correct).*?:\s*([A-D])/i);

        if (qMatch && !optMatch) {
          if (currentQ) parsedQuestions.push(currentQ);
          currentQ = { question: qMatch[1], options: [], correctAnswer: 0 };
        } else if (optMatch && currentQ) {
          currentQ.options.push(optMatch[1]);
        } else if (ansMatch && currentQ) {
          currentQ.correctAnswer = 'ABCD'.indexOf(ansMatch[1].toUpperCase());
        }
      }
      if (currentQ && currentQ.options.length >= 2) parsedQuestions.push(currentQ);

      if (parsedQuestions.length > 0) {
        setAiQuestions(parsedQuestions);
      } else {
        // Fallback: show raw content
        setQuestions([{ question: content, answer: 'AI Generated Paper' }]);
      }
    } catch (error) {
      console.error('Error generating paper:', error);
      toast.error('Failed to generate paper. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const paperText = questions.map((q, i) => 
        `Question ${i + 1}: ${q.question}\nAnswer: ${q.answer}`
      ).join('\n\n');

      const result = await summarizePaper({ paperText });
      setSummary(result);
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleAnswerSelect = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setShowAnswers(true);
    if (mode === 'timed') {
      setFinishedEarly(timeRemaining > 0);
      setExamFinished(true);
    }

    // Calculate score
    const total = aiQuestions.length;
    let correct = 0;
    aiQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) correct++;
    });

    // Award XP
    if (user && paper) {
      const percentage = Math.round((correct / total) * 100);
      const xpEarned = Math.round((percentage / 100) * (paper.xp_reward || 250));

      try {
        await supabase.from('past_paper_attempts').insert({
          user_id: user.id,
          paper_id: paper.id,
          mode,
          score: correct,
          total_marks: total,
          percentage,
          xp_earned: xpEarned,
          time_taken_seconds: mode === 'timed' ? (paper.duration_minutes * 60 - timeRemaining) : null,
          completed_at: new Date().toISOString(),
        });

        // Update profile XP
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp_points, coins')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase.from('profiles').update({
            xp_points: profile.xp_points + xpEarned,
            coins: profile.coins + Math.floor(xpEarned / 2),
          }).eq('id', user.id);
        }

        toast.success(`+${xpEarned} XP earned!`);
      } catch (error) {
        console.error('Error saving attempt:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    let correct = 0;
    aiQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) correct++;
    });
    return { correct, total: aiQuestions.length, percentage: Math.round((correct / aiQuestions.length) * 100) };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Generating Paper...</h2>
          <p className="text-muted-foreground">AI is creating your {mode === 'timed' ? 'timed exam' : 'practice paper'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <RequireSubjectAccess subject={formatSubjectSlug(subjectSlug)}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">
                {subject?.name} / {paper?.session} {paper?.year}
              </p>
              <h1 className="font-bold text-lg">
                Paper {paper?.paper_number}
                {paper?.variant ? ` (Variant ${paper.variant})` : ''}
                {mode === 'timed' ? ' — Timed Exam' : mode === 'practice' ? ' — Practice' : ' — Summary'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode === 'view' && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" /> AI Summarized
              </Badge>
            )}
            {paper?.duration_minutes && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" /> {paper.duration_minutes} min
              </Badge>
            )}
            {paper?.total_marks && (
              <Badge variant="outline">{paper.total_marks} marks</Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" /> {paper?.xp_reward || 250} XP
            </Badge>
          </div>
        </div>
      </header>

      {/* Timer bar for timed mode */}
      {mode === 'timed' && timerStarted && !examFinished && (
        <div className="bg-primary/10 border-b border-primary/20 py-2">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <Button size="sm" onClick={handleSubmit}>Done — Submit</Button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Paper info card */}
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold">Cambridge {paper?.exam_board} · {subject?.name} Paper {paper?.paper_number}</h2>
                <p className="text-sm text-muted-foreground">
                  {paper?.session} {paper?.year} — Variant {paper?.variant || 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-primary font-bold">+{paper?.xp_reward || 250} XP</span>
              <p className="text-xs text-muted-foreground">{paper?.total_marks} marks</p>
            </div>
          </CardContent>
        </Card>

        {/* Timed mode start button */}
        {mode === 'timed' && !timerStarted && aiQuestions.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Timer className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
              <p className="text-muted-foreground mb-6">
                You have {paper?.duration_minutes || 60} minutes to complete this paper.
              </p>
              <Button size="lg" onClick={() => setTimerStarted(true)}>
                Start Exam
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion message */}
        {submitted && aiQuestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-6 border-primary bg-primary/5">
              <CardContent className="p-6 text-center">
                <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
                {finishedEarly ? (
                  <h2 className="text-xl font-bold mb-1">Finished Early! 🎉</h2>
                ) : examFinished && mode === 'timed' ? (
                  <h2 className="text-xl font-bold mb-1">Time's Up! ⏰</h2>
                ) : (
                  <h2 className="text-xl font-bold mb-1">Paper Complete!</h2>
                )}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">{getScore().correct}/{getScore().total}</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{getScore().percentage}%</p>
                    <p className="text-sm text-muted-foreground">Percentage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI-generated MCQ questions (practice/timed) */}
        {aiQuestions.length > 0 && (mode === 'timed' ? timerStarted : true) && (
          <div className="space-y-4">
            {aiQuestions.map((q, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <p className="font-medium mb-3">
                    <span className="text-primary font-bold mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid gap-2">
                    {(q.options || []).map((opt: string, oi: number) => {
                      const isSelected = userAnswers[i] === oi;
                      const isCorrect = q.correctAnswer === oi;
                      const showResult = submitted;

                      return (
                        <button
                          key={oi}
                          onClick={() => handleAnswerSelect(i, oi)}
                          disabled={submitted}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            showResult && isCorrect
                              ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-500'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-500'
                              : isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="font-medium mr-2">{'ABCD'[oi]}.</span>
                          {opt}
                          {showResult && isCorrect && <CheckCircle className="inline h-4 w-4 ml-2 text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {!submitted && (mode === 'practice' || (mode === 'timed' && timerStarted)) && (
              <Button size="lg" className="w-full" onClick={handleSubmit}>
                Done — Submit Paper
              </Button>
            )}
          </div>
        )}

        {/* Real paper questions (view mode) */}
        {questions.length > 0 && mode === 'view' && (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold text-lg">Q{i + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{q.question}</p>
                      {q.marks && (
                        <Badge variant="outline" className="mb-2 text-xs">{q.marks} marks</Badge>
                      )}
                      {q.topic && (
                        <Badge variant="secondary" className="mb-2 ml-2 text-xs">{q.topic}</Badge>
                      )}
                      {showAnswers && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Answer:
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No questions message for view mode */}
        {questions.length === 0 && aiQuestions.length === 0 && mode === 'view' && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">No Questions Added Yet</h3>
            <p className="text-muted-foreground">
              Questions and answers for this paper will be added soon.
            </p>
          </Card>
        )}

        {/* Summarize button */}
        {(questions.length > 0 || aiQuestions.length > 0) && (
          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSummarize}
              disabled={summarizing}
            >
              {summarizing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating Summary...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Summarize Paper</>
              )}
            </Button>
          </div>
        )}

        {/* Summary display */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mt-6 border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Paper Summary
                  </CardTitle>
                  <Badge variant="secondary">Auto-Generated</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                  {summary}
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

export default PaperView;
