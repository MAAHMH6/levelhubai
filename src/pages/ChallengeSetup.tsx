import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Swords, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { useSubscription } from "@/hooks/useSubscription";
import { featureStorage } from "@/integrations/supabase/featureClient";

export default function ChallengeSetup() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPro, isSchool } = useSubscription();

  const [friendName, setFriendName] = useState("Friend");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("5");
  const [timeLimit, setTimeLimit] = useState("5");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (friendId) {
      supabase.from("profiles").select("display_name").eq("id", friendId).single().then(({ data }) => {
        if (data) setFriendName(data.display_name || "Friend");
      });
    }
    supabase.from("subjects").select("id,name").order("name").then(({ data }) => setSubjects(data || []));
  }, [friendId]);

  useEffect(() => {
    if (subjectId) {
      supabase.from("units").select("id,title,unit_number").eq("subject_id", subjectId).order("unit_number").then(({ data }) => setUnits(data || []));
      setUnitId(""); setTopicId("");
    }
  }, [subjectId]);

  useEffect(() => {
    if (unitId) {
      supabase.from("topics").select("id,title,topic_number").eq("unit_id", unitId).order("topic_number").then(({ data }) => setTopics(data || []));
      setTopicId("");
    }
  }, [unitId]);

  const handleCreateChallenge = async () => {
    if (!user || !friendId || !subjectId) return;

    // Enforce daily challenge limit for free students
    if (!isPro && !isSchool) {
      const daily = featureStorage.getDailyUsage();
      if (daily.challenge_used >= 3) {
        toast({
          title: "Daily Challenge Limit Reached",
          description: "Free accounts can create up to 3 friend challenges per day. Upgrade to Cambridge Pro for unlimited scholar battles!",
          variant: "destructive"
        });
        navigate('/billing');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Generate questions via RAG
      const { data: ragData, error: ragError } = await supabase.functions.invoke("rag-quiz", {
        body: {
          scope: topicId ? "lesson" : (unitId ? "unit" : "subject"),
          subject_id: subjectId,
          unit_id: unitId || undefined,
          topic_id: topicId || undefined,
          question_count: parseInt(questionCount),
          difficulty,
          types: ["mcq"]
        }
      });

      if (ragError) throw ragError;
      if (!ragData?.questions?.length) throw new Error("Could not generate questions for this topic.");

      // 2. Create Challenge in DB
      const { data: challenge, error: challengeError } = await supabase.from("challenges").insert({
        challenger_id: user.id,
        challenged_id: friendId,
        subject_id: subjectId,
        unit_id: unitId || null,
        topic_id: topicId || null,
        difficulty,
        time_limit_seconds: parseInt(timeLimit) * 60,
        questions: ragData.questions,
        status: "pending",
        score_challenger: 0,
        score_challenged: 0
      }).select().single();

      if (challengeError) throw challengeError;

      featureStorage.incrementUsage('challenge');
      toast({ title: "Challenge Created!", description: "Waiting for your friend to accept." });
      navigate(`/challenge/${challenge.id}`); // Or directly to play if the creator plays first
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Setup Challenge | LevelHubAI</title></Helmet>
      
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/challenges")} className="rounded-full"><ArrowLeft className="h-5 w-5"/></Button>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <Swords className="h-6 w-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Challenge {friendName}</h1>
            <p className="text-sm text-muted-foreground">Configure the rules of engagement</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Select Subject (Required)</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Choose subject"/></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Select Unit (Optional)</Label>
                <Select value={unitId} onValueChange={setUnitId} disabled={!subjectId}>
                  <SelectTrigger><SelectValue placeholder="Choose unit"/></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>Unit {u.unit_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Select Topic (Optional)</Label>
                <Select value={topicId} onValueChange={setTopicId} disabled={!unitId}>
                  <SelectTrigger><SelectValue placeholder="Choose topic"/></SelectTrigger>
                  <SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>Topic {t.topic_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-1">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Time Limit</Label>
                <Select value={timeLimit} onValueChange={setTimeLimit}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Minutes</SelectItem>
                    <SelectItem value="5">5 Minutes</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button size="lg" disabled={!subjectId || loading} onClick={handleCreateChallenge}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Generate & Send Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
