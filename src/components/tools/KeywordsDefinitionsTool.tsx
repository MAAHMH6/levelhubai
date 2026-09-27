import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, KeywordDefinitionRecord } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tag, 
  Search, 
  Check, 
  Copy, 
  Bookmark, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Volume2,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export const KeywordsDefinitionsTool: React.FC = () => {
  const { user } = useAuth();
  const { profile, programmeLabel } = useStudentProgramme();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'learned'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recall Quiz Mode State
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const [keywords, setKeywords] = useState<KeywordDefinitionRecord[]>([]);

  useEffect(() => {
    loadKeywords();
  }, [user?.id, profile.id]);

  const loadKeywords = async () => {
    const data = resourcesStore.getAllKeywords();
    setKeywords(data);
    const userId = user?.id || profile.id;
    if (userId) {
      const ids = await resourcesStore.getLearnedKeywordsAsync(userId);
      setLearnedIds(ids);
    }
  };

  const handleToggleLearned = async (id: string) => {
    const userId = user?.id || profile.id;
    if (!userId) return;
    const isLearned = await resourcesStore.toggleLearnedKeywordAsync(userId, id);
    if (isLearned) {
      setLearnedIds(prev => [...prev, id]);
      toast.success('Marked Cambridge definition as mastered!');
    } else {
      setLearnedIds(prev => prev.filter(item => item !== id));
      toast.info('Moved definition back to active review.');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Definition copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (keyword: string, definition: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${keyword}. Definition: ${definition}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-GB';
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info('Speech synthesis not supported in this browser.');
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      if (kw.status === 'archived') return false;
      if (selectedSubject !== 'all' && !kw.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
      
      const isLearned = learnedIds.includes(kw.id);
      if (filterMode === 'learned' && !isLearned) return false;
      if (filterMode === 'unlearned' && isLearned) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          kw.keyword.toLowerCase().includes(q) ||
          kw.definition.toLowerCase().includes(q) ||
          kw.unit_or_topic.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [keywords, selectedSubject, filterMode, searchQuery, learnedIds]);

  const subjects = useMemo(() => {
    return Array.from(new Set(keywords.map(k => k.subject)));
  }, [keywords]);

  const totalLearned = learnedIds.filter(id => keywords.some(k => k.id === id)).length;
  const progressPercent = keywords.length > 0 ? Math.round((totalLearned / keywords.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-teal-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-3">
              <Tag className="w-3.5 h-3.5" />
              Cambridge Mandatory Examiner Glossary
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Keyword & Definition Lists
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Master exact, word-for-word Cambridge definitions required by examiners in Paper 2, Paper 4, and structured theory examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setQuizMode(!quizMode)}
              variant="outline"
              className={`rounded-xl text-xs font-bold transition-all gap-1.5 ${
                quizMode 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                  : 'border-teal-400/40 bg-teal-950/40 text-teal-200 hover:bg-teal-900/60'
              }`}
            >
              {quizMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{quizMode ? 'Exit Recall Mode' : 'Test My Recall (Hide Answers)'}</span>
            </Button>
          </div>
        </div>

        {/* Filters & Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search keyword (e.g. Velocity, Isotopes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Cambridge Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Learned Status Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {[
              { id: 'all', label: 'All' },
              { id: 'unlearned', label: 'To Review' },
              { id: 'learned', label: 'Mastered' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                className={`text-[11px] font-bold rounded-lg py-1 transition-all ${
                  filterMode === tab.id 
                    ? 'bg-teal-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-400" />
            <span>Mastery: <strong>{totalLearned} of {keywords.length}</strong> Cambridge definitions</span>
          </div>
          <span className="font-mono text-teal-300 font-bold">{progressPercent}% Mastered</span>
        </div>
      </div>

      {/* Keywords Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKeywords.map((kw) => {
          const isLearned = learnedIds.includes(kw.id);
          const isRevealed = revealedIds[kw.id] ?? !quizMode;

          return (
            <Card
              key={kw.id}
              className={`p-5 rounded-3xl border bg-card transition-all flex flex-col justify-between group ${
                isLearned 
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50' 
                  : 'border-border hover:border-teal-500/50 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-teal-500/30 text-teal-600 dark:text-teal-400">
                    {kw.subject}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    {isLearned && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                        Mastered ✓
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {kw.unit_or_topic}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-foreground mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {kw.keyword}
                </h3>

                {/* Definition Box */}
                <div className="mt-3">
                  {quizMode && !isRevealed ? (
                    <button
                      onClick={() => toggleReveal(kw.id)}
                      className="w-full py-4 px-3 rounded-2xl bg-muted/60 border border-dashed border-border hover:border-teal-500 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4 text-teal-500" />
                      <span>Click to Reveal Official CAIE Definition</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 text-xs sm:text-sm text-foreground leading-relaxed">
                      {kw.definition}
                    </div>
                  )}
                </div>

                {kw.examiner_notes && isRevealed && (
                  <div className="mt-2.5 text-[11px] text-muted-foreground flex items-start gap-1.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">Examiner Tip:</span>
                    <span>{kw.examiner_notes}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSpeak(kw.keyword, kw.definition)}
                  className="h-8 px-2.5 rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5 text-teal-500" />
                  <span>Audio</span>
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(`${kw.keyword}: ${kw.definition}`, kw.id)}
                    className="h-8 px-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                    title="Copy definition"
                  >
                    {copiedId === kw.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    variant={isLearned ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleLearned(kw.id)}
                    className={`h-8 rounded-xl text-xs font-bold gap-1 transition-all ${
                      isLearned 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLearned ? 'Mastered' : 'Mark Learned'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
