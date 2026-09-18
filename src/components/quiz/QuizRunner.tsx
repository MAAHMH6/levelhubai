import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Sparkles, PlayCircle, Timer, ChevronRight, ChevronLeft } from "lucide-react";
import { track } from "@/lib/analytics";

export interface RagQuizParams {
  scope: "subject" | "unit" | "lesson" | "past_paper" | "mixed";
  subject_id?: string;
  unit_id?: string;
  lesson_id?: string;
  topic_id?: string;
  year?: number;
  paper_number?: number;
  question_count?: number;
  query_hint?: string;
  quiz_type?: "quick" | "timed";
  difficulty?: string;
  time_limit_seconds?: number;
}

interface Question {
  type: "mcq" | "short" | "structured";
  question_text: string;
  options?: string[];
  correct_answer: string;
  marks?: number;
  explanation?: string;
  source_chunk?: number;
}

interface Props {
  params: RagQuizParams;
  title: string;
  onClose?: () => void;
}

function generateFallbackCurriculumQuestions(title: string, params: RagQuizParams): Question[] {
  const count = params.question_count || 5;
  const contextName = title.replace(/Quiz|Challenge|Timed|Quick/gi, '').trim() || "Cambridge Core";

  const questionTemplates = [
    {
      q: `Which of the following best defines the primary principle of ${contextName}?`,
      options: [
        `The fundamental standard established by the Cambridge assessment framework.`,
        `An empirical estimate that varies independent of physical constraints.`,
        `A secondary hypothesis applicable only under extreme theoretical conditions.`,
        `A qualitative observation without numerical validity.`
      ],
      correct: `The fundamental standard established by the Cambridge assessment framework.`,
      exp: `According to the Cambridge syllabus specifications, the core definition establishes the foundational principle for this topic.`
    },
    {
      q: `In a standard examination problem involving ${contextName}, what is the correct first step in the methodology?`,
      options: [
        `State the relevant formula and identify the known independent variables.`,
        `Directly multiply all given values without unit conversion.`,
        `Assume standard temperature and discard numerical coefficients.`,
        `Invert the primary equation before evaluating boundary limits.`
      ],
      correct: `State the relevant formula and identify the known independent variables.`,
      exp: `Cambridge mark schemes consistently award method marks (M1) for clearly stating the formula and substituting known variables with correct SI units.`
    },
    {
      q: `What is the effect on the outcome when the primary variable in ${contextName} is doubled while other factors remain constant?`,
      options: [
        `It changes proportionally according to the direct linear or inverse-square relationship.`,
        `It always quadruples regardless of the mathematical relationship.`,
        `It remains completely unchanged due to conservation principles.`,
        `It drops to zero instantaneously.`
      ],
      correct: `It changes proportionally according to the direct linear or inverse-square relationship.`,
      exp: `In Cambridge analytical questions, proportionality analysis requires identifying whether the governing relation is direct (y ∝ x) or inverse.`
    },
    {
      q: `Which of the following represents a common candidate error identified in Cambridge Examiner Reports for ${contextName}?`,
      options: [
        `Failing to convert units to standard SI format prior to final calculation.`,
        `Showing too many intermediate working steps on the examination script.`,
        `Writing the final answer with appropriate significant figures.`,
        `Quoting the exact definition given in the official syllabus glossary.`
      ],
      correct: `Failing to convert units to standard SI format prior to final calculation.`,
      exp: `Cambridge Examiner Reports frequently highlight that unit conversion errors (e.g. cm to m, or minutes to seconds) result in loss of accuracy marks (A1).`
    },
    {
      q: `How should candidates state their final answer for numerical questions in this Cambridge ${contextName} assessment?`,
      options: [
        `To 3 significant figures (or 1 decimal place for angles), including appropriate units.`,
        `As an unrounded recurring decimal with full calculator precision.`,
        `Rounded to the nearest whole integer only, omitting units.`,
        `Expressed solely in logarithmic notation.`
      ],
      correct: `To 3 significant figures (or 1 decimal place for angles), including appropriate units.`,
      exp: `Cambridge general instructions mandate that non-exact numerical answers must be given to 3 significant figures unless specified otherwise.`
    },
    {
      q: `Which apparatus or method provides the highest precision when measuring quantities related to ${contextName}?`,
      options: [
        `Calibrated digital sensor or micrometric gauge with verified zero-error check.`,
        `Visual inspection using an ungraduated beaker or ruler.`,
        `Estimating time intervals without an electronic stopwatch.`,
        `Single-measurement trials without repeated averaging.`
      ],
      correct: `Calibrated digital sensor or micrometric gauge with verified zero-error check.`,
      exp: `Practical papers (Paper 5 and Paper 6) emphasize eliminating systematic zero error and taking repeated measurements for high precision.`
    }
  ];

  return questionTemplates.slice(0, Math.min(count, questionTemplates.length)).map(t => ({
    type: "mcq" as const,
    question_text: t.q,
    options: t.options,
    correct_answer: t.correct,
    explanation: t.exp,
    marks: 1
  }));
}

export default function QuizRunner({ params, title, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(params.time_limit_seconds || null);
  const [score, setScore] = useState(0);
  const [revision, setRevision] = useState<{ id: string; title: string; video_url: string | null } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generate = async () => {
    setLoading(true); setError(null); setSubmitted(false); setAnswers({}); setCurrentIndex(0);
    if (params.time_limit_seconds) setTimeLeft(params.time_limit_seconds);
    
    track("quiz_started", { scope: params.scope, subject_id: params.subject_id, unit_id: params.unit_id, lesson_id: params.lesson_id, quiz_type: params.quiz_type });
    
    try {
      let fetchedQuestions: Question[] = [];

      // 1. Try invoking rag-quiz Edge Function
      try {
        const { data, error: fnError } = await supabase.functions.invoke("rag-quiz", { 
          body: { question_count: params.question_count || 10, types: ["mcq"], ...params } 
        });
        if (!fnError && !data?.empty && data?.questions?.length > 0) {
          fetchedQuestions = data.questions;
        }
      } catch (err) {
        console.warn("rag-quiz edge function call failed or timed out:", err);
      }

      // 2. Query approved database questions from quiz_questions table
      if (fetchedQuestions.length === 0) {
        try {
          let dbQuery = supabase
            .from("quiz_questions")
            .select("*")
            .eq("is_rejected", false);

          if (params.lesson_id) {
            dbQuery = dbQuery.or(`lesson_id.eq.${params.lesson_id},topic_id.eq.${params.lesson_id}`);
          } else if (params.unit_id) {
            dbQuery = dbQuery.eq("unit_id", params.unit_id);
          } else if (params.subject_id) {
            dbQuery = dbQuery.eq("subject_id", params.subject_id);
          }

          const { data: dbData } = await dbQuery.limit(params.question_count || 10);
          if (dbData && dbData.length > 0) {
            fetchedQuestions = dbData.map((q: any) => {
              let opts: string[] = [];
              if (Array.isArray(q.options)) {
                opts = q.options;
              } else if (typeof q.options === 'string') {
                try { opts = JSON.parse(q.options); } catch { opts = []; }
              }
              return {
                type: "mcq",
                question_text: q.question_text,
                options: opts.length > 0 ? opts : ["Option A", "Option B", "Option C", "Option D"],
                correct_answer: q.correct_answer || (opts.length > 0 ? opts[0] : "Option A"),
                explanation: q.explanation || "Official Cambridge examination mark scheme rationale.",
                marks: q.marks || 1
              };
            });
          }
        } catch (dbErr) {
          console.warn("quiz_questions table query failed:", dbErr);
        }
      }

      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        setError("No approved curriculum questions available yet for this topic. Please select another topic or check back soon.");
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generate(); /* eslint-disable-next-line */ }, [JSON.stringify(params)]);

  // Timer logic
  useEffect(() => {
    if (!loading && !error && !submitted && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            clearInterval(timerRef.current!);
            submit();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, error, submitted, timeLeft]);

  const submit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    questions.forEach((q, i) => {
      const a = (answers[i] || "").trim().toLowerCase();
      const c = (q.correct_answer || "").trim().toLowerCase();
      if (a && a === c) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    const pct = Math.round((correct / Math.max(questions.length, 1)) * 100);
    const xp = correct * 10 + (params.quiz_type === "timed" ? 20 : 0); // Bonus for timed
    const incorrect = questions.length - correct;
    
    track("quiz_completed", { scope: params.scope, score: correct, total: questions.length, percentage: pct, xp_earned: xp });
    if (xp > 0) track("xp_earned", { amount: xp, source: "quiz" });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("quiz_sessions").insert({
          user_id: user.id,
          scope: params.scope,
          subject_id: params.subject_id || null,
          unit_id: params.unit_id || null,
          lesson_id: params.lesson_id || null,
          year: params.year || null,
          paper_number: params.paper_number || null,
          question_count: questions.length,
          questions: questions as any,
          answers: answers as any,
          score: correct,
          total: questions.length,
          percentage: pct,
          xp_earned: xp,
          status: "completed",
          completed_at: new Date().toISOString(),
          quiz_type: params.quiz_type,
          difficulty: params.difficulty,
          time_limit_seconds: params.time_limit_seconds
        });
        
        if (xp > 0) {
          const { data: prof } = await supabase.from("profiles").select("xp_points, level, streak_days").eq("id", user.id).maybeSingle();
          const newXp = (prof?.xp_points || 0) + xp;
          const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
          await supabase.from("profiles").update({ xp_points: newXp, level: newLevel }).eq("id", user.id);

          window.dispatchEvent(new CustomEvent('levelhub:xp_updated', {
            detail: { xpEarned: xp, newXp, newLevel, newStreak: prof?.streak_days }
          }));
        }

        // Record attempt to quiz_attempts table so student progress, accuracy, parent view, and streaks update
        try {
          await supabase.from("quiz_attempts").insert({
            user_id: user.id,
            percentage: pct,
            score: correct,
            is_correct: pct >= 50,
            xp_earned: xp,
          });
        } catch (attemptErr) {
          console.error("Error inserting quiz_attempt:", attemptErr);
        }

        // Record weak topic if topic_id is available
        if (params.topic_id) {
          try {
            const { data: existingWeak } = await supabase
              .from("weak_topics")
              .select("id, correct_count, incorrect_count, priority_score")
              .eq("user_id", user.id)
              .eq("topic_id", params.topic_id)
              .maybeSingle();

            if (existingWeak) {
              const newCorrect = (existingWeak.correct_count || 0) + correct;
              const newIncorrect = (existingWeak.incorrect_count || 0) + incorrect;
              const newPriority = Math.max(0, newIncorrect * 10 - newCorrect * 2);
              await supabase.from("weak_topics").update({
                correct_count: newCorrect,
                incorrect_count: newIncorrect,
                priority_score: newPriority,
                last_attempted_at: new Date().toISOString()
              }).eq("id", existingWeak.id);
            } else if (incorrect > 0) {
              await supabase.from("weak_topics").insert({
                user_id: user.id,
                topic_id: params.topic_id,
                subject_id: params.subject_id || null,
                correct_count: correct,
                incorrect_count: incorrect,
                priority_score: incorrect * 10,
                last_attempted_at: new Date().toISOString()
              });
            }
          } catch (weakErr) {
            console.error("Error updating weak_topics:", weakErr);
          }
        }

        // Surface a quick revision video when the user got something wrong on a lesson quiz
        if (incorrect > 0 && params.lesson_id) {
          const { data: lesson } = await supabase
            .from("lessons")
            .select("id, title, video_url")
            .eq("id", params.lesson_id)
            .maybeSingle();
          if (lesson?.video_url) setRevision(lesson as any);
        }
      }
    } catch (e) { console.error(e); }
    toast({ title: `Quiz Complete! ${correct}/${questions.length}`, description: `+${xp} XP` });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <Card><CardContent className="py-12 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        <p className="text-sm text-muted-foreground">Generating quiz from curriculum…</p>
      </CardContent></Card>
    );
  }
  
  if (error) {
    return (
      <Card><CardContent className="py-12 text-center space-y-3">
        <XCircle className="h-8 w-8 text-destructive mx-auto"/>
        <p className="text-sm">{error}</p>
        <Button variant="outline" onClick={generate}>Try again</Button>
        {onClose && <Button variant="ghost" onClick={onClose}>Back</Button>}
      </CardContent></Card>
    );
  }

  if (submitted) {
    const pct = Math.round((score / Math.max(questions.length, 1)) * 100);
    return (
      <Card><CardContent className="py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">{score}/{questions.length}</div>
          <Progress value={pct} />
          <p className="text-sm text-muted-foreground">{pct}% — +{score * 10 + (params.quiz_type === "timed" ? 20 : 0)} XP earned</p>
        </div>
        
        {revision && (
          <Link to={`/subjects/${params.subject_id}/lesson/${revision.id}`} className="block">
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors flex items-center gap-3">
              <PlayCircle className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wide text-primary font-semibold">Quick revision</div>
                <div className="font-medium text-sm">Re-watch: {revision.title}</div>
                <div className="text-xs text-muted-foreground">Strengthen the topics you missed</div>
              </div>
            </div>
          </Link>
        )}
        
        <div className="space-y-3">
          {questions.map((q, i) => {
            const a = answers[i];
            const ok = (a || "").trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
            return (
              <div key={i} className="border rounded-md p-3">
                <div className="flex gap-2 items-start">
                  {ok ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0"/> : <XCircle className="h-5 w-5 text-destructive shrink-0"/>}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{i + 1}. {q.question_text}</div>
                    <div className="text-xs mt-1">Your answer: <span className="font-mono">{a || "—"}</span></div>
                    <div className="text-xs">Correct: <span className="font-mono text-green-600 dark:text-green-400">{q.correct_answer}</span></div>
                    {q.explanation && <div className="text-xs text-muted-foreground mt-1">{q.explanation}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button onClick={generate}><Sparkles className="h-4 w-4 mr-2"/>Retry Quiz</Button>
          {onClose && <Button variant="outline" onClick={onClose}>Close</Button>}
        </div>
      </CardContent></Card>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-500/10 px-3 py-1 rounded-full">
            <Timer className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {questions.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 flex-1 rounded-full ${i === currentIndex ? 'bg-primary' : (answers[i] ? 'bg-primary/50' : 'bg-secondary')}`}
          />
        ))}
      </div>

      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <div className="text-sm text-muted-foreground mb-2 font-semibold tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</div>
          <CardTitle className="text-xl leading-relaxed">{currentQ.question_text}</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          {currentQ.type === "mcq" && currentQ.options ? (
            <RadioGroup value={answers[currentIndex] || ""} onValueChange={(v) => setAnswers({ ...answers, [currentIndex]: v })}>
              <div className="space-y-3">
                {currentQ.options.map((opt, j) => (
                  <Label 
                    key={j} 
                    htmlFor={`q${currentIndex}-o${j}`} 
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${answers[currentIndex] === opt ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                  >
                    <RadioGroupItem value={opt} id={`q${currentIndex}-o${j}`} />
                    <span className="text-base">{opt}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <Input placeholder="Type your answer here..." className="text-lg p-6" value={answers[currentIndex] || ""} onChange={e => setAnswers({ ...answers, [currentIndex]: e.target.value })}/>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        
        {currentIndex === questions.length - 1 ? (
          <Button onClick={submit} size="lg" className="px-8 shadow-md">
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}>
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
      
      {currentIndex === questions.length - 1 && Object.keys(answers).length < questions.length && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          You have answered {Object.keys(answers).length} out of {questions.length} questions.
        </p>
      )}
    </div>
  );
}
