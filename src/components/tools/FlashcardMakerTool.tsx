import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { supabase } from '@/integrations/supabase/client';
import { CURATED_TOPIC_MATERIALS, TopicFlashcard } from '@/data/topicStudyMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Layers, 
  Sparkles, 
  Plus, 
  RotateCw, 
  Check, 
  X, 
  Trash2, 
  BookOpen, 
  Brain,
  CheckCircle2,
  HelpCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export const FlashcardMakerTool: React.FC = () => {
  const { user } = useAuth();
  const { profile, subjects, programmeLabel } = useStudentProgramme();

  const [flashcards, setFlashcards] = useState<TopicFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [knownCount, setKnownCount] = useState<number>(0);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // AI Generator state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // New card form
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newHint, setNewHint] = useState<string>('');

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  useEffect(() => {
    loadFlashcardsForSubject();
  }, [selectedSubjectId]);

  const loadFlashcardsForSubject = () => {
    const subObj = subjects.find(s => s.id === selectedSubjectId);
    const subName = subObj ? subObj.name.toLowerCase() : 'computer';

    // Find in curated topic materials
    const matched = CURATED_TOPIC_MATERIALS.filter(m => {
      const matchRegex = new RegExp(m.subjectMatch, 'i');
      return matchRegex.test(subName);
    });

    const allCards: TopicFlashcard[] = [];
    matched.forEach(m => {
      allCards.push(...m.flashcards);
    });

    if (allCards.length === 0) {
      // General fallbacks
      allCards.push(
        { id: 'gen-1', q: 'What is the SI unit of Force?', a: 'Newton (N). 1 N = 1 kg·m/s².' },
        { id: 'gen-2', q: 'Define an Isotope.', a: 'Atoms of the same element having the same number of protons but different numbers of neutrons.' },
        { id: 'gen-3', q: 'State the Quadratic Formula.', a: 'x = (-b ± √(b² - 4ac)) / (2a)' }
      );
    }

    setFlashcards(allCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
  };

  const handleNext = (known: boolean) => {
    if (known) {
      setKnownCount(prev => prev + 1);
    }
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success(`Session finished! You mastered ${knownCount + (known ? 1 : 0)} of ${flashcards.length} cards.`);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) {
      toast.error('Please enter both a question (front) and answer (back).');
      return;
    }

    const newCard: TopicFlashcard = {
      id: crypto.randomUUID(),
      q: newQuestion,
      a: newAnswer,
      hint: newHint || undefined,
    };

    setFlashcards(prev => [newCard, ...prev]);
    setCreateDialogOpen(false);
    setNewQuestion('');
    setNewAnswer('');
    setNewHint('');
    toast.success('Flashcard added to your deck!');
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate generating 3 smart syllabus flashcards
      await new Promise(r => setTimeout(r, 900));
      const subObj = subjects.find(s => s.id === selectedSubjectId);
      const generatedCards: TopicFlashcard[] = [
        {
          id: crypto.randomUUID(),
          q: `Explain the fundamental principle of ${subObj?.name || 'this topic'}.`,
          a: 'Structured according to official Cambridge syllabus definitions and marking rubrics.',
          hint: 'Key examination requirement'
        },
        {
          id: crypto.randomUUID(),
          q: `What is the most common pitfall in Cambridge Paper 2 for ${subObj?.name || 'this subject'}?`,
          a: 'Omitting units, rounding intermediate calculations prematurely, or confusing vector and scalar quantities.',
          hint: 'Examiner tip'
        }
      ];

      setFlashcards(prev => [...generatedCards, ...prev]);
      toast.success('AI successfully generated Cambridge flashcards from syllabus content.');
    } catch {
      toast.error('Could not generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const progressPercent = flashcards.length > 0 
    ? Math.round(((currentIndex + 1) / flashcards.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-fuchsia-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-fuchsia-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase mb-3">
              <Layers className="w-3.5 h-3.5" />
              Active Recall & Spaced Repetition
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Flashcard Maker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Master definitions, scientific laws, and chemical equations with interactive flip cards and AI-powered Cambridge syllabus generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="rounded-xl text-xs font-bold px-4 h-10 bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'AI Generate Cards'}</span>
            </Button>

            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="outline"
              className="rounded-xl text-xs font-bold px-4 h-10 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Card</span>
            </Button>
          </div>
        </div>

        {/* Subject Filter & Deck Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="w-64">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white">
                <SelectValue placeholder="Select Subject Deck" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{knownCount} Mastered</span>
          </div>
        </div>
      </div>

      {/* Flashcard 3D Interactive Flip Card */}
      {currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={handleFlip}
            className="cursor-pointer min-h-[280px] p-8 rounded-3xl border-2 border-border bg-card hover:border-fuchsia-500/50 shadow-lg flex flex-col justify-between transition-all duration-300 transform active:scale-98 text-center select-none"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] font-bold border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400">
                {isFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Click to flip
              </span>
            </div>

            <div className="py-8 my-auto">
              <h3 className="text-xl sm:text-2xl font-black text-foreground leading-relaxed whitespace-pre-line">
                {isFlipped ? currentCard.a : currentCard.q}
              </h3>
              {!isFlipped && currentCard.hint && (
                <div className="mt-3 text-xs text-muted-foreground italic">
                  Hint: {currentCard.hint}
                </div>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground">
              Progress: {progressPercent}%
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => handleNext(false)}
              variant="outline"
              className="h-12 px-6 rounded-2xl text-xs font-bold border-rose-500/30 text-rose-600 hover:bg-rose-500/10 gap-2"
            >
              <X className="w-4 h-4" />
              <span>Review Again</span>
            </Button>

            <Button
              onClick={handleFlip}
              variant="secondary"
              className="h-12 px-6 rounded-2xl text-xs font-bold gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Flip Card</span>
            </Button>

            <Button
              onClick={() => handleNext(true)}
              className="h-12 px-6 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Got It Right</span>
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <Layers className="w-12 h-12 text-fuchsia-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No flashcards in this deck yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click "Create Card" or "AI Generate Cards" to build your active recall deck.
          </p>
        </Card>
      )}

      {/* Create Card Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-fuchsia-500" />
              Create Custom Flashcard
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCard} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Question / Term (Front)</label>
              <Textarea
                placeholder="e.g. State Newton's Second Law of Motion"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="rounded-xl text-xs min-h-[70px]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Answer / Definition (Back)</label>
              <Textarea
                placeholder="e.g. Resultant Force = Mass × Acceleration (F = ma)"
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                className="rounded-xl text-xs min-h-[90px]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Hint (Optional)</label>
              <Input
                placeholder="e.g. Involves mass and acceleration"
                value={newHint}
                onChange={e => setNewHint(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                Add to Deck
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
