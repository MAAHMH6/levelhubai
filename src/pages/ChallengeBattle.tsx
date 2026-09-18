import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, Swords, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

export default function ChallengeBattle() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [battleComplete, setBattleComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (challengeId && user) fetchChallenge();
  }, [challengeId, user]);

  const fetchChallenge = async () => {
    try {
      const { data: ch } = await supabase.from('challenges').select('*').eq('id', challengeId).single();
      if (!ch) { navigate('/challenges'); return; }
      
      setChallenge(ch);

      const isChallenger = ch.challenger_id === user!.id;
      const opponentId = isChallenger ? ch.challenged_id : ch.challenger_id;
      
      const [{ data: oppProfile }, { data: myProf }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', opponentId).single(),
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
      ]);

      setOpponent(oppProfile);
      setMyProfile(myProf);

      // Load questions
      if (ch.questions && ch.questions.length > 0) {
        setQuestions(ch.questions);
      } else if (ch.challenge_questions && ch.challenge_questions.length > 0) {
        setQuestions(ch.challenge_questions);
      }

      // Check completion status
      if ((isChallenger && ch.score_challenger !== null) || (!isChallenger && ch.score_challenged !== null)) {
        setBattleComplete(true);
        setScore(isChallenger ? ch.score_challenger || 0 : ch.score_challenged || 0);
      } else {
        // Start timer if applicable
        if (ch.time_limit_seconds) {
          setTimeLeft(ch.time_limit_seconds);
        }
        setTimerActive(true);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading challenge", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!timerActive || timeLeft === null || battleComplete) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p && p <= 1) {
          clearInterval(timerRef.current!);
          finishBattle();
          return 0;
        }
        return p ? p - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timerActive, timeLeft, battleComplete]);

  const finishBattle = async () => {
    setTimerActive(false);
    setBattleComplete(true);
    if (!user || !challenge) return;

    let correct = 0;
    questions.forEach((q, i) => {
      const a = (userAnswers[i] || "").trim().toLowerCase();
      const c = (q.correct_answer || q.correctAnswer || "").trim().toLowerCase();
      if (a && a === c) correct++;
    });

    setScore(correct);
    const isChallenger = challenge.challenger_id === user.id;

    try {
      const updateData: any = isChallenger
        ? { score_challenger: correct, challenger_answers: userAnswers }
        : { score_challenged: correct, challenged_answers: userAnswers };

      const { data: updated } = await supabase.from('challenges').update(updateData).eq('id', challenge.id).select().single();

      // If both have finished, declare winner
      if (updated && updated.score_challenger !== null && updated.score_challenged !== null) {
        await supabase.from('challenges').update({ status: 'completed' }).eq('id', challenge.id);
      }
      toast({ title: 'Score Submitted!', description: `You scored ${correct}/${questions.length}` });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (battleComplete) {
    const isChallenger = challenge.challenger_id === user?.id;
    const myScore = isChallenger ? challenge.score_challenger : challenge.score_challenged;
    const theirScore = isChallenger ? challenge.score_challenged : challenge.score_challenger;
    const bothFinished = myScore !== null && theirScore !== null;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/challenges')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2"/>Back to Challenges</Button>
          <Card className="text-center overflow-hidden border-2 border-primary/20">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">{bothFinished ? "Battle Complete!" : "Waiting for Opponent..."}</h1>
            </div>
            <CardContent className="pt-8 pb-12">
              <div className="flex justify-center items-center gap-8 mb-8">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-primary"><AvatarImage src={myProfile?.avatar_url}/><AvatarFallback>{myProfile?.display_name?.charAt(0)}</AvatarFallback></Avatar>
                  <p className="font-bold text-lg">You</p>
                  <p className="text-3xl font-bold text-primary">{score}</p>
                </div>
                <div className="text-4xl font-black text-muted-foreground opacity-30">VS</div>
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-muted"><AvatarImage src={opponent?.avatar_url}/><AvatarFallback>{opponent?.display_name?.charAt(0)}</AvatarFallback></Avatar>
                  <p className="font-bold text-lg">{opponent?.display_name}</p>
                  <p className="text-3xl font-bold text-muted-foreground">{theirScore !== null ? theirScore : '?'}</p>
                </div>
              </div>
              {bothFinished && (
                <div className="text-xl font-medium p-4 bg-muted rounded-xl inline-block">
                  {score > theirScore ? "🏆 You Won!" : score < theirScore ? "😢 You Lost!" : "🤝 It's a Draw!"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background pb-12">
      <Helmet><title>Battle | LevelHubAI</title></Helmet>
      
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="border-2 border-primary h-10 w-10"><AvatarImage src={opponent?.avatar_url} /><AvatarFallback>{opponent?.display_name?.charAt(0)}</AvatarFallback></Avatar>
            <div><p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Battling</p><p className="font-bold leading-none">{opponent?.display_name}</p></div>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-500/10 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <Progress value={(currentIndex / questions.length) * 100} className="h-1 rounded-none" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-2 border-primary/10 shadow-lg mb-6">
          <CardHeader>
            <div className="text-sm text-muted-foreground mb-2 font-semibold tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</div>
            <CardTitle className="text-xl leading-relaxed">{currentQ?.question_text || currentQ?.question}</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {currentQ?.options ? (
              <RadioGroup value={userAnswers[currentIndex] || ""} onValueChange={(v) => setUserAnswers({ ...userAnswers, [currentIndex]: v })}>
                <div className="space-y-3">
                  {currentQ.options.map((opt: string, j: number) => (
                    <Label 
                      key={j} 
                      htmlFor={`q${currentIndex}-o${j}`} 
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${userAnswers[currentIndex] === opt ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                    >
                      <RadioGroupItem value={opt} id={`q${currentIndex}-o${j}`} />
                      <span className="text-base">{opt}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0}>Previous</Button>
          {currentIndex === questions.length - 1 ? (
            <Button onClick={finishBattle} size="lg" className="px-8 shadow-md">Submit Battle</Button>
          ) : (
            <Button onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
}
