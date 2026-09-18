import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TakeMockExam() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (user && id) load();
  }, [user, id]);

  const load = async () => {
    setLoading(true);
    const [examRes, qRes] = await Promise.all([
      supabase.from("mock_exams").select("*").eq("id", id).single(),
      supabase.from("quiz_questions").select("*").eq("mock_exam_id", id).order("created_at")
    ]);
    
    if (examRes.data) setExam(examRes.data);
    if (qRes.data) setQuestions(qRes.data);
    
    if (examRes.data?.score != null) {
      setSubmitted(true);
      setScore(examRes.data.score);
    }
    
    if (examRes.data?.student_answers) {
      setAnswers(examRes.data.student_answers);
    }
    
    setLoading(false);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };
  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit your mock exam?")) return;
    
    let earned = 0;
    questions.forEach(q => {
      if (q.options && q.options.length > 0) {
        if (answers[q.id] === q.correct_answer) earned += (q.marks || 1);
      }
    });

    const { error } = await supabase.from("mock_exams").update({ 
      score: earned,
      student_answers: answers 
    }).eq("id", id);
    if (error) {
      toast({ title: "Error submitting exam", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Exam Submitted", description: `You scored ${earned} marks!` });
      setScore(earned);
      setSubmitted(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (!exam || questions.length === 0) return <div className="p-8 text-center">Exam not found or no questions.</div>;

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mock-exams")}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-xl font-bold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">{exam.time_allowed} • {exam.total_marks} Marks</p>
            </div>
          </div>
          {submitted && (
            <div className="font-bold text-xl text-primary bg-primary/10 px-4 py-2 rounded-md">
              Score: {score} / {exam.total_marks}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-muted-foreground">Question {currentIdx + 1} of {questions.length}</span>
              <div className="flex gap-2">
                {currentQ.command_words?.map((cw: string) => (
                  <span key={cw} className="text-xs bg-muted px-2 py-1 rounded">{cw}</span>
                ))}
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                  [{currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}]
                </span>
              </div>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQ.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQ.options && currentQ.options.length > 0 ? (
              <RadioGroup
                value={answers[currentQ.id]}
                onValueChange={(val) => !submitted && setAnswers({ ...answers, [currentQ.id]: val })}
                className="space-y-4"
              >
                {currentQ.options.map((opt: string, i: number) => {
                  const isSelected = answers[currentQ.id] === opt;
                  const isCorrect = submitted && opt === currentQ.correct_answer;
                  const isWrong = submitted && isSelected && !isCorrect;

                  let borderClass = "border-border";
                  if (isSelected) borderClass = "border-primary bg-primary/5";
                  if (submitted) {
                    if (isCorrect) borderClass = "border-green-500 bg-green-500/10";
                    else if (isWrong) borderClass = "border-red-500 bg-red-500/10";
                  }

                  return (
                    <Label
                      key={i}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${borderClass} ${submitted ? 'opacity-80' : 'hover:border-primary/50'}`}
                    >
                      <RadioGroupItem value={opt} id={`q${currentQ.id}-opt${i}`} disabled={submitted} />
                      <span className="flex-1 text-base">{opt}</span>
                      {submitted && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {submitted && isWrong && <XCircle className="w-5 h-5 text-red-500" />}
                    </Label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <Textarea 
                  placeholder="Type your answer here..." 
                  className="min-h-[150px] resize-y text-base"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => !submitted && setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                  disabled={submitted}
                />
              </div>
            )}

            {submitted && !currentQ.options?.length && (
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-md">
                <h4 className="font-semibold text-primary mb-2">Examiner Expected Answer / Marking Scheme</h4>
                <p className="text-sm whitespace-pre-wrap">{currentQ.correct_answer || currentQ.explanation || "No explanation provided."}</p>
                
                {currentQ.correct_answer && currentQ.explanation && currentQ.explanation !== currentQ.correct_answer && (
                  <>
                    <h4 className="font-semibold text-primary mt-4 mb-2">Explanation</h4>
                    <p className="text-sm whitespace-pre-wrap">{currentQ.explanation}</p>
                  </>
                )}
              </div>
            )}

            {submitted && currentQ.options?.length > 0 && currentQ.explanation && (
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-md">
                <h4 className="font-semibold text-primary mb-2">Examiner Explanation</h4>
                <p className="text-sm">{currentQ.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            
            {currentIdx < questions.length - 1 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              !submitted && (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  Submit Exam
                </Button>
              )
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
