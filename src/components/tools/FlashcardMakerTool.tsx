import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, StudentFlashcardRecord } from '@/lib/resourcesStore';
import { CURATED_TOPIC_MATERIALS, TopicFlashcard } from '@/data/topicStudyMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  Volume2,
  VolumeX,
  Keyboard,
  Award,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export const FlashcardMakerTool: React.FC = () => {
  const { user } = useAuth();
  const { profile, subjects, programmeLabel } = useStudentProgramme();

  const [cards, setCards] = useState<StudentFlashcardRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [boxFilter, setBoxFilter] = useState<'all' | 'due' | 'weak' | 'mastered'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // New card form
  const [newSubject, setNewSubject] = useState<string>('');
  const [newTopic, setNewTopic] = useState<string>('Core Syllabus');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newHint, setNewHint] = useState<string>('');

  useEffect(() => {
    if (subjects.length > 0 && !newSubject) {
      setNewSubject(subjects[0].name);
    }
  }, [subjects]);

  const loadCards = useCallback(async () => {
    const userId = user?.id || profile.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let data = await resourcesStore.getStudentFlashcardsAsync(userId);
      if (data.length === 0) {
        // Seed default curated flashcards for Cambridge subjects
        const initialCards: Omit<StudentFlashcardRecord, 'id' | 'created_at'>[] = [
          {
            user_id: userId,
            subject_name: 'Mathematics (Syllabus D)',
            topic: 'Algebra & Quadratics',
            question: 'What is the Quadratic Formula for finding roots of ax² + bx + c = 0?',
            answer: 'x = (-b ± √(b² - 4ac)) / (2a)\n\nDiscriminant: Δ = b² - 4ac.\nIf Δ > 0: two real roots.\nIf Δ = 0: one repeated root.\nIf Δ < 0: no real roots.',
            hint: 'Memorize the denominator: 2a, not just 2',
            box_level: 1,
            next_review_date: new Date().toISOString().slice(0, 10),
            times_reviewed: 0,
            times_correct: 0,
          },
          {
            user_id: userId,
            subject_name: 'Physics',
            topic: 'Kinematics & Dynamics',
            question: "State Newton's Second Law of Motion in terms of momentum.",
            answer: 'Resultant force is directly proportional to the rate of change of momentum, and acts in the direction of the force.\n\nF = Δp / Δt = m(v - u) / t = ma',
            hint: 'Use the phrase "rate of change of momentum"',
            box_level: 2,
            next_review_date: new Date().toISOString().slice(0, 10),
            times_reviewed: 2,
            times_correct: 2,
          },
          {
            user_id: userId,
            subject_name: 'Chemistry',
            topic: 'Stoichiometry & Moles',
            question: 'What volume does 1 mole of any ideal gas occupy at room temperature and pressure (r.t.p.)?',
            answer: '24.0 dm³ (or 24,000 cm³).\n\nFormula: Volume of gas = Number of moles × 24 dm³',
            hint: 'At r.t.p. (25°C and 1 atmosphere)',
            box_level: 3,
            next_review_date: new Date().toISOString().slice(0, 10),
            times_reviewed: 3,
            times_correct: 3,
          },
          {
            user_id: userId,
            subject_name: 'Computer Science',
            topic: 'Computer Architecture',
            question: 'Describe the role of the Program Counter (PC) in the Von Neumann architecture.',
            answer: 'The Program Counter holds the address of the next instruction to be fetched from memory, and is automatically incremented after each fetch cycle.',
            hint: 'F-E cycle component',
            box_level: 1,
            next_review_date: new Date().toISOString().slice(0, 10),
            times_reviewed: 0,
            times_correct: 0,
          },
        ];

        const saved = await Promise.all(initialCards.map(c => resourcesStore.saveStudentFlashcardAsync(c)));
        data = saved;
      }
      setCards(data);
    } catch {
      setCards(resourcesStore.getStudentFlashcards(userId));
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile.id]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Filter cards based on Subject and Leitner Box criteria
  const filteredCards = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return cards.filter(c => {
      if (selectedSubject !== 'all' && !c.subject_name.toLowerCase().includes(selectedSubject.toLowerCase())) {
        return false;
      }
      if (boxFilter === 'due') {
        return !c.next_review_date || c.next_review_date <= todayStr;
      }
      if (boxFilter === 'weak') {
        return c.box_level === 1;
      }
      if (boxFilter === 'mastered') {
        return c.box_level >= 4;
      }
      return true;
    });
  }, [cards, selectedSubject, boxFilter]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedSubject, boxFilter]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = async (known: boolean) => {
    if (!currentCard) return;
    const userId = user?.id || profile.id;

    // Update in database / store
    if (userId) {
      await resourcesStore.updateFlashcardReviewAsync(userId, currentCard.id, known);
    }

    // Local update
    setCards(prev => prev.map(c => {
      if (c.id === currentCard.id) {
        const nextBox = known ? Math.min(5, c.box_level + 1) : 1;
        return {
          ...c,
          box_level: nextBox,
          times_reviewed: c.times_reviewed + 1,
          times_correct: known ? c.times_correct + 1 : c.times_correct,
        };
      }
      return c;
    }));

    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success('You have completed this revision cycle! Great work on active recall.');
      setCurrentIndex(0);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-GB';
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info('Speech synthesis not supported in this browser.');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (createDialogOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleNext(false);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createDialogOpen, handleFlip, currentCard]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) {
      toast.error('Please enter both question (front) and answer (back).');
      return;
    }

    const userId = user?.id || profile.id;
    if (!userId) return;

    const newCard = await resourcesStore.saveStudentFlashcardAsync({
      user_id: userId,
      subject_name: newSubject || 'General',
      topic: newTopic || 'Core Syllabus',
      question: newQuestion,
      answer: newAnswer,
      hint: newHint || undefined,
      box_level: 1,
      next_review_date: new Date().toISOString().slice(0, 10),
      times_reviewed: 0,
      times_correct: 0,
    });

    setCards(prev => [newCard, ...prev]);
    setCreateDialogOpen(false);
    setNewQuestion('');
    setNewAnswer('');
    setNewHint('');
    toast.success('New active recall card added to Leitner Box 1!');
  };

  const handleAIGenerateCards = async () => {
    setIsGenerating(true);
    const userId = user?.id || profile.id;
    if (!userId) {
      setIsGenerating(false);
      return;
    }

    try {
      const subName = selectedSubject !== 'all' ? selectedSubject : (subjects[0]?.name || 'Physics');
      
      // Pull real cards from CURATED_TOPIC_MATERIALS
      const matched = CURATED_TOPIC_MATERIALS.filter(m => {
        const regex = new RegExp(m.subjectMatch, 'i');
        return regex.test(subName);
      });

      let samplePool: TopicFlashcard[] = [];
      matched.forEach(m => samplePool.push(...m.flashcards));

      if (samplePool.length === 0) {
        samplePool = [
          { id: '1', q: `What is the law of conservation of energy in ${subName}?`, a: 'Energy cannot be created or destroyed, only transferred from one form to another.' },
          { id: '2', q: `State the standard examination precision required in Cambridge calculations.`, a: 'Final numerical answers must be given to 3 significant figures, or 1 decimal place for angles in degrees.' },
          { id: '3', q: `Define the term "accuracy" vs "precision" in experimental work.`, a: 'Accuracy refers to how close a measured value is to the true value; precision refers to the closeness of agreement between independent measurements.' }
        ];
      }

      // Add to database
      const generated = await Promise.all(samplePool.slice(0, 3).map(card => 
        resourcesStore.saveStudentFlashcardAsync({
          user_id: userId,
          subject_name: subName,
          topic: 'Cambridge Exam Highlights',
          question: card.q,
          answer: card.a,
          hint: card.hint || 'Cambridge syllabus core',
          box_level: 1,
          next_review_date: new Date().toISOString().slice(0, 10),
          times_reviewed: 0,
          times_correct: 0,
        })
      ));

      setCards(prev => [...generated, ...prev]);
      toast.success(`Generated 3 Cambridge active recall flashcards for ${subName}!`);
    } catch {
      toast.error('Failed to generate cards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCurrentCard = async () => {
    if (!currentCard) return;
    const userId = user?.id || profile.id;
    if (userId) {
      await resourcesStore.deleteStudentFlashcardAsync(userId, currentCard.id);
    }
    setCards(prev => prev.filter(c => c.id !== currentCard.id));
    setIsFlipped(false);
    toast.info('Card removed from deck.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-fuchsia-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-fuchsia-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold uppercase mb-3">
              <Layers className="w-3.5 h-3.5" />
              Spaced Repetition & Leitner System
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smart Flashcard Maker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Master Cambridge syllabi with scientific 5-Box Leitner spaced repetition. Cards adapt dynamically based on your recall accuracy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleAIGenerateCards}
              disabled={isGenerating}
              variant="outline"
              className="rounded-xl text-xs font-bold border-fuchsia-400/30 text-fuchsia-200 hover:bg-fuchsia-900/50 gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>{isGenerating ? 'Generating...' : 'AI Generate Cards'}</span>
            </Button>

            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="rounded-xl text-xs font-bold px-4 h-10 bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Card</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block uppercase">Subject Deck</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
                <SelectItem value="all">All Subjects ({cards.length} cards)</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block uppercase">Leitner Review Filter</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'due', label: 'Due Today' },
                { id: 'weak', label: 'Box 1 (Weak)' },
                { id: 'mastered', label: 'Box 4-5 (Mastered)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBoxFilter(f.id as any)}
                  className={`h-9 px-2 rounded-xl text-[11px] font-bold transition-all ${
                    boxFilter === f.id 
                      ? 'bg-fuchsia-600 text-white shadow-xs' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leitner Box Progress Summary */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[1, 2, 3, 4, 5].map(box => {
          const count = cards.filter(c => c.box_level === box).length;
          return (
            <div key={box} className="p-3 rounded-2xl bg-card border border-border">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Box {box}</div>
              <div className="text-lg font-black text-foreground mt-0.5">{count}</div>
              <div className="text-[9px] text-muted-foreground">
                {box === 1 ? '1 Day' : box === 2 ? '3 Days' : box === 3 ? '7 Days' : box === 4 ? '14 Days' : '30 Days'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Flashcard Stage */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500 mx-auto" />
          <p className="text-xs text-muted-foreground mt-3 font-medium">Loading flashcard deck...</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <Layers className="w-12 h-12 text-fuchsia-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No flashcards matching filter</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Switch filter or click "AI Generate Cards" to instantly create syllabus cards.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button onClick={handleAIGenerateCards} className="rounded-xl text-xs font-bold bg-fuchsia-600 text-white">
              <Sparkles className="w-4 h-4 mr-1" /> Generate Cambridge Cards
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="rounded-xl text-xs font-bold">
              <Plus className="w-4 h-4 mr-1" /> Create Card
            </Button>
          </div>
        </Card>
      ) : currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Meta & Audio */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400">
                {currentCard.subject_name}
              </Badge>
              <Badge className="bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-none text-[10px] font-bold">
                Leitner Box {currentCard.box_level}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(isFlipped ? currentCard.answer : currentCard.question)}
                className="h-8 px-2 rounded-xl text-xs gap-1 hover:text-foreground"
                title="Read aloud"
              >
                <Volume2 className="w-3.5 h-3.5 text-fuchsia-500" />
                <span>Audio</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteCurrentCard}
                className="h-8 px-2 rounded-xl text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>

              <span>Card {currentIndex + 1} / {filteredCards.length}</span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="cursor-pointer min-h-[300px] p-8 rounded-3xl border-2 border-border bg-card hover:border-fuchsia-500/60 shadow-xl flex flex-col justify-between transition-all duration-300 transform select-none hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {isFlipped ? 'Answer (Mark Scheme Back)' : 'Question (Active Recall Front)'}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-fuchsia-500" /> Click or Space to flip
              </span>
            </div>

            <div className="py-6 my-auto text-center">
              <h3 className="text-xl sm:text-2xl font-black text-foreground leading-relaxed whitespace-pre-line">
                {isFlipped ? currentCard.answer : currentCard.question}
              </h3>
              {!isFlipped && currentCard.hint && (
                <div className="mt-4 inline-block px-3 py-1 rounded-full bg-muted/80 text-xs text-muted-foreground italic">
                  💡 Hint: {currentCard.hint}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-3">
              <span>Reviewed: {currentCard.times_reviewed} times</span>
              <span>Accuracy: {currentCard.times_reviewed > 0 ? Math.round((currentCard.times_correct / currentCard.times_reviewed) * 100) : 0}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => handleNext(false)}
              variant="outline"
              className="h-12 px-6 rounded-2xl text-xs font-bold border-rose-500/40 text-rose-600 hover:bg-rose-500/10 gap-2 flex-1 max-w-[200px]"
            >
              <X className="w-4 h-4 text-rose-500" />
              <span>Review Again (Box 1)</span>
            </Button>

            <Button
              onClick={handleFlip}
              variant="secondary"
              className="h-12 px-5 rounded-2xl text-xs font-bold gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Flip</span>
            </Button>

            <Button
              onClick={() => handleNext(true)}
              className="h-12 px-6 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md flex-1 max-w-[200px]"
            >
              <Check className="w-4 h-4" />
              <span>Got It Right (+Box)</span>
            </Button>
          </div>

          {/* Keyboard Hint */}
          <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-3">
            <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Space</kbd> Flip</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">←</kbd> Repeat</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">→</kbd> Pass</span>
          </div>
        </div>
      ) : null}

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
              <label className="text-xs font-bold text-foreground mb-1 block">Subject</label>
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Topic / Chapter</label>
              <Input
                placeholder="e.g. Waves, Electrostatics, Organic Chemistry"
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Question / Term (Front)</label>
              <Textarea
                placeholder="e.g. State Snell's Law of Refraction"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="rounded-xl text-xs min-h-[70px]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Answer / Definition (Back)</label>
              <Textarea
                placeholder="e.g. n1 sin(θ1) = n2 sin(θ2) or n = sin(i) / sin(r)"
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                className="rounded-xl text-xs min-h-[90px]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Hint (Optional)</label>
              <Input
                placeholder="e.g. Relates angle of incidence and refraction"
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
                Add to Leitner Deck
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
