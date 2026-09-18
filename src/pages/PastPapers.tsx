import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  FileText, 
  Play, 
  Trophy,
  Zap,
  Calendar,
  CheckCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatSubjectSlug } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { RequireSubjectAccess } from "@/components/billing/RequireSubjectAccess";

type PastPaper = Tables<'past_papers'>;
type PaperAttempt = Tables<'past_paper_attempts'>;

const PastPapers = () => {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [attempts, setAttempts] = useState<PaperAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchPapers();
  }, [subjectSlug, user]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      
      // Get subject
      const subjectNameFormatted = formatSubjectSlug(subjectSlug);
      setSubjectName(subjectNameFormatted);
      
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .ilike('name', subjectNameFormatted)
        .maybeSingle();

      if (!subject) {
        setLoading(false);
        return;
      }
      
      setSubjectId(subject.id);

      // Fetch papers
      const { data: papersData } = await supabase
        .from('past_papers')
        .select('*')
        .eq('subject_id', subject.id)
        .order('year', { ascending: false });

      setPapers(papersData || []);

      // Fetch user attempts
      if (user) {
        const paperIds = (papersData || []).map(p => p.id);
        if (paperIds.length > 0) {
          const { data: attemptsData } = await supabase
            .from('past_paper_attempts')
            .select('*')
            .eq('user_id', user.id)
            .in('paper_id', paperIds);
          
          setAttempts(attemptsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYears = () => {
    const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
    return years;
  };

  const getSessions = () => {
    return [...new Set(papers.map(p => p.session))];
  };

  const filteredPapers = papers.filter(paper => {
    if (selectedYear !== 'all' && paper.year !== parseInt(selectedYear)) return false;
    if (selectedSession !== 'all' && paper.session !== selectedSession) return false;
    return true;
  });

  const getBestAttempt = (paperId: string) => {
    const paperAttempts = attempts.filter(a => a.paper_id === paperId);
    if (paperAttempts.length === 0) return null;
    return paperAttempts.reduce((best, curr) => 
      (curr.percentage || 0) > (best.percentage || 0) ? curr : best
    );
  };

  const getAttemptCount = (paperId: string) => {
    return attempts.filter(a => a.paper_id === paperId).length;
  };

  const startPractice = (paper: PastPaper, mode: 'timed' | 'practice' | 'view') => {
    navigate(`/subjects/${subjectSlug}/past-papers/${paper.id}?mode=${mode}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireSubjectAccess subject={subjectSlug}>
      <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/subjects/${subjectSlug}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl">{subjectName} Past Papers</h1>
                <p className="text-sm text-muted-foreground">Practice with real exam papers</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{papers.length}</div>
              <div className="text-sm text-muted-foreground">Total Papers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold">
                {new Set(attempts.map(a => a.paper_id)).size}
              </div>
              <div className="text-sm text-muted-foreground">Attempted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-xp" />
              <div className="text-2xl font-bold">
                {attempts.length > 0 
                  ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">
                {attempts.reduce((sum, a) => sum + a.xp_earned, 0)}
              </div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-card text-sm"
          >
            <option value="all">All Years</option>
            {getYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-card text-sm"
          >
            <option value="all">All Sessions</option>
            {getSessions().map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </motion.div>

        {/* Papers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredPapers.length === 0 ? (
            <Card className="col-span-full p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-2">No Past Papers Available</h3>
              <p className="text-muted-foreground mb-4">
                Past papers for {subjectName} will be added soon.
              </p>
              <Button variant="outline" onClick={() => navigate(`/subjects/${subjectSlug}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {subjectName}
              </Button>
            </Card>
          ) : (
            filteredPapers.map((paper, index) => {
              const bestAttempt = getBestAttempt(paper.id);
              const attemptCount = getAttemptCount(paper.id);
              
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{paper.exam_board}</Badge>
                            <Badge variant="outline">{paper.session} {paper.year}</Badge>
                          </div>
                          <CardTitle className="text-lg">
                            Paper {paper.paper_number}
                            {paper.variant && ` (Variant ${paper.variant})`}
                          </CardTitle>
                        </div>
                        {bestAttempt && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {bestAttempt.percentage}%
                            </div>
                            <div className="text-xs text-muted-foreground">Best Score</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {paper.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{paper.duration_minutes} min</span>
                          </div>
                        )}
                        {paper.total_marks && (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            <span>{paper.total_marks} marks</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-accent" />
                          <span>{paper.xp_reward} XP</span>
                        </div>
                      </div>

                      {attemptCount > 0 && (
                        <div className="mb-4 text-sm text-muted-foreground">
                          Attempted {attemptCount} time{attemptCount !== 1 ? 's' : ''}
                        </div>
                      )}

                      {paper.is_proprietary && (
                        <div className="mb-4">
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                            AI Mock Exam
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1 leading-tight">
                            Original PDF access restricted due to copyright.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            onClick={() => startPractice(paper, 'timed')}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Timed
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => startPractice(paper, 'practice')}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Practice
                          </Button>
                        </div>
                        {paper.is_proprietary && paper.external_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => window.open(paper.external_url, '_blank')}
                          >
                            <BookOpen className="h-3 w-3" />
                            Official PDF (External)
                          </Button>
                        ) : !paper.is_proprietary ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => startPractice(paper, 'view')}
                          >
                            <BookOpen className="h-3 w-3" />
                            + Summarize Paper
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </main>
      </div>
    </RequireSubjectAccess>
  );
};

export default PastPapers;
