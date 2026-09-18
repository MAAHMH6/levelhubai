import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileQuestion, Search, Calendar, Award, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizHistoryManager() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [subjects, setSubjects] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const [sessionsRes, subjectsRes] = await Promise.all([
        supabase
          .from("quiz_sessions")
          .select("*, profiles:user_id(display_name, email)")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("subjects")
          .select("id, name")
      ]);

      if (subjectsRes.data) {
        const map: Record<string, string> = {};
        subjectsRes.data.forEach((s: any) => { map[s.id] = s.name; });
        setSubjects(map);
      }

      if (sessionsRes.data) {
        setSessions(sessionsRes.data);
      }
    } catch (err) {
      console.error("Error fetching quiz history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const userName = (s.profiles?.display_name || s.profiles?.email || "").toLowerCase();
    const subjectName = (subjects[s.subject_id] || "").toLowerCase();
    const matchesSearch = !search || userName.includes(search.toLowerCase()) || subjectName.includes(search.toLowerCase());
    const matchesType = filterType === "all" || s.quiz_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-teal-600" />
            Quiz Attempts & Sessions History
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor real-time student quiz completions, percentages, and XP awards.
          </p>
        </div>

        <Button onClick={fetchSessions} variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
          <RotateCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Quiz Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="quick">Quick Quiz</SelectItem>
            <SelectItem value="timed">Timed Quiz</SelectItem>
            <SelectItem value="center">Quiz Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table / List */}
      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading quiz history...</Card>
      ) : filteredSessions.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground rounded-2xl border-dashed">
          No quiz sessions found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSessions.map((session, idx) => {
            const pct = session.percentage || 0;
            const dateStr = session.created_at 
              ? new Date(session.created_at).toLocaleDateString(undefined, { 
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                }) 
              : "Recent";
            const studentName = session.profiles?.display_name || session.profiles?.email || "Student";
            const subjectName = subjects[session.subject_id] || "Curriculum Assessment";

            return (
              <Card key={session.id || idx} className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    pct >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40' :
                    pct >= 50 ? 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-950/40' :
                    'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40'
                  }`}>
                    {pct}%
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{studentName}</span>
                      <Badge variant="outline" className="text-[11px] font-semibold text-teal-600 border-teal-200">
                        {subjectName}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {session.quiz_type || 'practice'}
                      </Badge>
                      {session.difficulty && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {session.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>Score: {session.score} / {session.total || session.question_count || 5}</span>
                      {session.xp_earned > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <Zap className="h-3 w-3" /> +{session.xp_earned} XP
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Badge variant={session.status === "completed" ? "default" : "secondary"} className="self-end sm:self-auto capitalize">
                  {session.status || "completed"}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
