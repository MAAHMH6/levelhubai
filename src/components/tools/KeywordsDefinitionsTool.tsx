import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, KeywordDefinitionRecord } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  HelpCircle,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

export const KeywordsDefinitionsTool: React.FC = () => {
  const { user } = useAuth();
  const { profile, programmeLabel } = useStudentProgramme();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [keywords, setKeywords] = useState<KeywordDefinitionRecord[]>([]);

  useEffect(() => {
    loadKeywords();
  }, [user?.id, profile.id]);

  const loadKeywords = () => {
    const data = resourcesStore.getAllKeywords();
    setKeywords(data);
    const userId = user?.id || profile.id;
    if (userId) {
      setLearnedIds(resourcesStore.getLearnedKeywordIds(userId));
    }
  };

  const handleToggleLearned = (id: string) => {
    const userId = user?.id || profile.id;
    if (!userId) return;
    const isLearned = resourcesStore.toggleLearnedKeyword(userId, id);
    if (isLearned) {
      setLearnedIds(prev => [...prev, id]);
      toast.success('Marked definition as learned!');
    } else {
      setLearnedIds(prev => prev.filter(item => item !== id));
      toast.info('Definition moved back to review.');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Definition copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredKeywords = keywords.filter((kw) => {
    if (kw.status === 'archived') return false;
    if (selectedSubject !== 'all' && !kw.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
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

  const subjects = Array.from(new Set(keywords.map(k => k.subject)));
  const totalLearned = learnedIds.filter(id => keywords.some(k => k.id === id)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-teal-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-3">
              <Tag className="w-3.5 h-3.5" />
              Cambridge Mandatory Glossary
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Keyword & Definition Lists
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Master exact, word-for-word Cambridge definitions required by examiners in Paper 2, Paper 4, and theory examinations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold px-3 py-1.5 bg-slate-800 border-slate-700 text-teal-400">
              {totalLearned} of {keywords.length} Mastered
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Subjects ({subjects.length})</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search keyword (e.g. Isotope, Acceleration)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Keywords List */}
      {filteredKeywords.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <BookOpen className="w-12 h-12 text-teal-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No definitions found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try searching for another scientific term or selecting a different subject.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKeywords.map((kw) => {
            const isLearned = learnedIds.includes(kw.id);
            const isCopied = copiedId === kw.id;
            return (
              <Card
                key={kw.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isLearned 
                    ? 'bg-teal-500/5 border-teal-500/30' 
                    : 'bg-card border-border hover:border-teal-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20">
                      {kw.subject} • {kw.unit_or_topic}
                    </Badge>

                    {isLearned && (
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                        ✓ Learned
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-black text-foreground">
                    {kw.keyword}
                  </h3>

                  <div className="text-xs font-medium text-foreground leading-relaxed mt-2 p-3 rounded-2xl bg-muted/30 border border-border/60">
                    {kw.definition}
                  </div>

                  {kw.examiner_notes && (
                    <div className="mt-3 text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Examiner Tip:</strong> {kw.examiner_notes}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleCopy(`${kw.keyword}: ${kw.definition}`, kw.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </Button>

                  <Button
                    onClick={() => handleToggleLearned(kw.id)}
                    variant={isLearned ? 'outline' : 'default'}
                    size="sm"
                    className={`h-8 rounded-xl text-xs font-bold gap-1.5 ${
                      isLearned 
                        ? 'border-border text-muted-foreground' 
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLearned ? 'Mark as Unlearned' : 'Mark as Learned'}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
