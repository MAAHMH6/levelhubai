import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Link as LinkIcon, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AddChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChildModal({ open, onOpenChange }: AddChildModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{child_name: string} | null>(null);
  const queryClient = useQueryClient();

  const handleLink = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("link_child_account", { _code: code });
      
      if (error) throw error;
      
      setSuccess({ child_name: (data as any)?.child_name || "Student" });
      queryClient.invalidateQueries({ queryKey: ["parent_children"] });
      
    } catch (error: any) {
      console.error("Linking error:", error);
      toast.error(error.message || "Failed to link account. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCode("");
      setSuccess(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Child to Dashboard</DialogTitle>
          <DialogDescription>
            Enter the 6-digit linking code generated from your child's LevelHubAI student account settings.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Successfully Linked!</h3>
              <p className="text-muted-foreground">{success.child_name} is now added to your Parent Dashboard.</p>
            </div>
            <Button onClick={handleClose} className="w-full mt-4">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Input
                id="code"
                placeholder="Enter 6-digit code (e.g. ABCDEF)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center uppercase text-2xl tracking-[0.2em] font-mono h-14"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleLink} disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                Link Account
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
