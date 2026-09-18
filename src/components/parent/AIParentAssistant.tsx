import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIParentAssistant({ childId, childName }: { childId: string, childName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your LevelHubAI Parent Assistant. I have access to ${childName}'s performance data. Ask me anything about their progress, strengths, or areas for improvement!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Fetch some contextual data before calling AI
      const { data: progress } = await supabase
        .from("subject_progress")
        .select("subject:subjects(name), overall_score, quizzes_taken")
        .eq("user_id", childId);

      // Call edge function (mocking for now as we don't have the specific edge function available in this context)
      // In production, we'd have a supabase.functions.invoke('parent-assistant')
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: input, 
          context: `You are a helpful Parent Assistant for LevelHubAI. You are talking to a parent about their child, ${childName}. 
          Here is their current progress data: ${JSON.stringify(progress)}.
          Keep answers brief, encouraging, and actionable. Do not mention other students.`,
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm sorry, I couldn't process that right now.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Failed to reach AI Assistant.");
      
      // Fallback response for dev without Edge Function
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `(Fallback Mode) Based on ${childName}'s data, they are doing great in English but could use more practice in Mathematics problem solving.`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-border/50 shadow-md">
      <div className="bg-primary/5 border-b p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Parent Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about {childName}'s progress</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input 
            placeholder={`Ask about ${childName}...`} 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <Button type="button" variant="outline" size="sm" className="text-xs whitespace-nowrap" onClick={() => setInput(`Why is ${childName} struggling with math?`)}>
            Struggles in math?
          </Button>
          <Button type="button" variant="outline" size="sm" className="text-xs whitespace-nowrap" onClick={() => setInput(`What are ${childName}'s strengths?`)}>
            What are their strengths?
          </Button>
          <Button type="button" variant="outline" size="sm" className="text-xs whitespace-nowrap" onClick={() => setInput(`What should we focus on this week?`)}>
            Weekly focus?
          </Button>
        </div>
      </div>
    </Card>
  );
}
