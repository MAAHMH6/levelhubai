import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentWizard from "@/components/performance/AssessmentWizard";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";

export default function Performance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) checkAssessment();
  }, [user]);

  const checkAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("student_assessments")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error checking assessment:", error);
      }
      
      setHasAssessment(!!data);
    } catch (err) {
      console.error(err);
      setHasAssessment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b bg-card print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Performance & Assessment</h1>
            <p className="text-sm text-muted-foreground">AI-powered insights based on your learning profile</p>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-7xl mx-auto">
        {hasAssessment === null ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : hasAssessment ? (
          <PerformanceDashboard />
        ) : (
          <AssessmentWizard onComplete={checkAssessment} />
        )}
      </div>
    </div>
  );
}
