import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";

export const FeedbackBox = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !message.trim()) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        message: message.trim(),
      });

      if (error) throw error;
      toast.success("Thanks for your feedback! 🎉");
      setMessage("");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          Suggest a Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="What feature would you like to see? Tell us your ideas..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{message.length}/500</span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
