import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
}

export function PremiumModal({ open, onOpenChange, title, description }: Props) {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    if (!user) { nav("/auth?next=upgrade"); return; }
    onOpenChange(false);
    nav("/billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-3">
            <Crown className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle>{title ?? "Unlock with Pro"}</DialogTitle>
          <DialogDescription>
            {description ?? "This feature is part of LevelHubAI Pro — all subjects, AI tutor, full past paper library, and unlimited quizzes."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Not now</Button>
          <Button onClick={upgrade} disabled={loading}>
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
