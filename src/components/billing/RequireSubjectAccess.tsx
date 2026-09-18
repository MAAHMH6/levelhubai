import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Sparkles, Crown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectAccess } from "@/hooks/useSubjectAccess";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  subject?: string | null;
  children: ReactNode;
}

/**
 * Guards a subject-specific page. Enforces:
 * - free subjects: require login
 * - premium subjects: require login + active Pro/School subscription
 * Uses server-side `user_can_access_subject` RPC.
 */
export function RequireSubjectAccess({ subject, children }: Props) {
  const { user, loading } = useAuth();
  const { data: allowed, isLoading } = useSubjectAccess(subject);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const nav = useNavigate();

  // If there's no specific subject required, allow access automatically
  if (!subject) {
    return <>{children}</>;
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (allowed) return <>{children}</>;

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Sign in to continue</h1>
            <p className="text-muted-foreground">
              Please log in or create a free account to access {subject ?? "this subject"} on LevelHubAI.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" onClick={() => nav(-1)}>Go back</Button>
              <Button asChild>
                <Link to={`/auth?next=${encodeURIComponent(window.location.pathname)}`}>Log in / Sign up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upgrade = async () => {
    nav("/billing");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-primary/30">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            <Crown className="w-5 h-5 inline mr-1 -mt-1" />
            {subject ?? "This subject"} is a Pro subject
          </h1>
          <p className="text-muted-foreground">
            Unlock every O Level & IGCSE subject on LevelHubAI, plus the AI tutor, full past paper library,
            and unlimited AI-generated quizzes and notes.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button variant="outline" asChild>
              <Link to="/billing">View pricing</Link>
            </Button>
            <Button onClick={upgrade} disabled={checkoutLoading}>
              <Sparkles className="w-4 h-4 mr-2" />
              {checkoutLoading ? "Redirecting…" : "Upgrade to Pro"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Free subjects: Mathematics, Physics, and ICT — no subscription required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
