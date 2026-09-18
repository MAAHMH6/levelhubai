import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookA, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function VocabularyBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadWords();
  }, [user]);

  const loadWords = async () => {
    try {
      const { data, error } = await supabase
        .from("student_vocabulary")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = (word: string) => {
    navigate(`/ai-tutor?context=${encodeURIComponent(`I want to practice using the word "${word}". Can you give me a sentence to complete, or ask me to write a sentence using it?`)}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("student_vocabulary").delete().eq("id", id);
      if (error) throw error;
      setWords(words.filter(w => w.id !== id));
      toast.success("Word removed from vocabulary");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete word");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (words.length === 0) {
    return (
      <div className="text-center p-12 bg-card border rounded-xl">
        <BookA className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold">My Vocabulary is Empty</h3>
        <p className="text-muted-foreground mt-2">
          When you check your writing, the AI will suggest better words. Save them here to build your academic vocabulary!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((w) => (
          <Card key={w.id} className="flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-primary">{w.word}</h4>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{w.difficulty}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete(w.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm">{w.meaning}</p>
              {w.example_sentence && (
                <div className="mt-auto pt-4 border-t text-sm italic text-muted-foreground">
                  "{w.example_sentence}"
                </div>
              )}
              <div className="pt-2">
                <Button variant="secondary" className="w-full gap-2" onClick={() => handlePractice(w.word)}>
                  <PlayCircle className="w-4 h-4" /> Practice Using This
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
