import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, History } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function WritingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("writing_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true }); // old to new for chart

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-12 bg-card border rounded-xl">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Writing History Yet</h3>
        <p className="text-muted-foreground mt-2">Start writing and checking your work to see your progress chart!</p>
      </div>
    );
  }

  const chartData = history.map((h, i) => ({
    name: `Check ${i + 1}`,
    overall: h.overall_score,
    grammar: h.grammar_score,
    vocab: h.vocabulary_score,
    date: new Date(h.created_at).toLocaleDateString()
  }));

  const avgOverall = Math.round(history.reduce((acc, h) => acc + h.overall_score, 0) / history.length);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">Total Submissions</span>
            <span className="text-3xl font-bold">{history.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">Avg Overall Score</span>
            <span className="text-3xl font-bold text-primary">{avgOverall}%</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Writing Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" opacity={0.5} />
                <YAxis domain={[0, 100]} opacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="overall" name="Overall" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="grammar" name="Grammar" stroke="#ef4444" strokeWidth={2} opacity={0.7} />
                <Line type="monotone" dataKey="vocab" name="Vocabulary" stroke="#3b82f6" strokeWidth={2} opacity={0.7} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
