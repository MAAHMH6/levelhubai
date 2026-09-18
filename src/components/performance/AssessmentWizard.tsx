import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Question = {
  id: string;
  category: "logical" | "verbal" | "quantitative" | "problem_solving" | "processing_speed" | "learning_style" | "motivation" | "confidence" | "study_time" | "study_frequency";
  text: string;
  options: { label: string; value: string | number; score?: number }[];
};

const questions: Question[] = [
  {
    id: "l1",
    category: "logical",
    text: "If all Zs are Ys, and some Ys are Xs, which of the following MUST be true?",
    options: [
      { label: "All Zs are Xs", value: "a", score: 0 },
      { label: "Some Zs are Xs", value: "b", score: 0 },
      { label: "Some Ys are Zs", value: "c", score: 100 },
      { label: "No Zs are Xs", value: "d", score: 0 }
    ]
  },
  {
    id: "v1",
    category: "verbal",
    text: "Choose the word most similar in meaning to 'ABUNDANT':",
    options: [
      { label: "Scarce", value: "a", score: 0 },
      { label: "Plentiful", value: "b", score: 100 },
      { label: "Brief", value: "c", score: 0 },
      { label: "Complex", value: "d", score: 0 }
    ]
  },
  {
    id: "q1",
    category: "quantitative",
    text: "If a shirt costs $20 after a 20% discount, what was its original price?",
    options: [
      { label: "$24", value: "a", score: 0 },
      { label: "$25", value: "b", score: 100 },
      { label: "$30", value: "c", score: 0 },
      { label: "$40", value: "d", score: 0 }
    ]
  },
  {
    id: "ps1",
    category: "problem_solving",
    text: "You have two hourglasses: a 7-minute one and an 11-minute one. Can you time exactly 15 minutes?",
    options: [
      { label: "Yes", value: "a", score: 100 },
      { label: "No", value: "b", score: 0 },
    ]
  },
  {
    id: "ps2",
    category: "processing_speed",
    text: "How quickly do you usually grasp new concepts taught in class?",
    options: [
      { label: "Immediately, I rarely need it repeated", value: "a", score: 100 },
      { label: "After a few examples", value: "b", score: 75 },
      { label: "It takes me a while and careful study", value: "c", score: 50 },
    ]
  },
  {
    id: "ls1",
    category: "learning_style",
    text: "When studying for an exam, you prefer to:",
    options: [
      { label: "Draw mind maps and watch videos", value: "Visual" },
      { label: "Read textbooks and rewrite notes", value: "Reading/Writing" },
      { label: "Listen to lectures or podcasts", value: "Auditory" },
      { label: "Do practice questions and past papers", value: "Practice-Based" }
    ]
  },
  {
    id: "m1",
    category: "motivation",
    text: "How motivated are you to study for your O-Level exams?",
    options: [
      { label: "Extremely motivated", value: 5 },
      { label: "Quite motivated", value: 4 },
      { label: "Neutral", value: 3 },
      { label: "Struggling to find motivation", value: 2 }
    ]
  },
  {
    id: "c1",
    category: "confidence",
    text: "How confident do you feel about passing your upcoming exams?",
    options: [
      { label: "Very confident (A/A* expected)", value: 5 },
      { label: "Confident (B/C expected)", value: 4 },
      { label: "Unsure (Passing is borderline)", value: 3 },
      { label: "Not confident at all", value: 2 }
    ]
  },
  {
    id: "st1",
    category: "study_time",
    text: "When are you most productive?",
    options: [
      { label: "Early Morning", value: "Morning" },
      { label: "Afternoon", value: "Afternoon" },
      { label: "Late at Night", value: "Night" }
    ]
  },
  {
    id: "sf1",
    category: "study_frequency",
    text: "How often do you study outside of school?",
    options: [
      { label: "Every day", value: "Daily" },
      { label: "3-4 times a week", value: "A few times a week" },
      { label: "Only right before exams", value: "Cramming before exams" }
    ]
  }
];

export default function AssessmentWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Calculate scores
      let logical = 50, verbal = 50, quantitative = 50, problem = 50, processing = 50;
      
      if (answers["l1"] === "c") logical = 90; else logical = 40;
      if (answers["v1"] === "b") verbal = 95; else verbal = 45;
      if (answers["q1"] === "b") quantitative = 85; else quantitative = 35;
      if (answers["ps1"] === "a") problem = 80; else problem = 40;
      if (answers["ps2"] === "a") processing = 90;
      else if (answers["ps2"] === "b") processing = 70;
      else processing = 45;

      const payload = {
        user_id: user.id,
        logical_score: logical,
        verbal_score: verbal,
        quantitative_score: quantitative,
        problem_solving_score: problem,
        processing_speed_score: processing,
        learning_style: answers["ls1"] || "Mixed",
        study_time: answers["st1"] || "Anytime",
        study_frequency: answers["sf1"] || "Irregular",
        motivation_score: answers["m1"] || 3,
        confidence_score: answers["c1"] || 3,
        needs_ai_refresh: true
      };

      const { error } = await supabase.from("student_assessments").insert(payload);
      if (error) throw error;
      
      onComplete();
    } catch (err: any) {
      toast({ title: "Error submitting assessment", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = questions[currentStep];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Let's Build Your Learning Profile</h1>
        <p className="text-muted-foreground mt-2">LevelHubAI analyzes your learning style to personalize your experience.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6 text-sm text-muted-foreground">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <div className="w-1/3 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-medium mb-6">{q.text}</h2>

          <RadioGroup 
            value={answers[q.id]?.toString()} 
            onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
            className="space-y-3"
          >
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={opt.value.toString()} id={`opt-${i}`} />
                <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-normal text-base">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!answers[q.id] || isSubmitting}
            >
              {currentStep === questions.length - 1 ? (
                <>Complete <CheckCircle className="w-4 h-4 ml-2" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
