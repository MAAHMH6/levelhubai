import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Layers, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Eye, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  GraduationCap,
  Package,
  BookMarked
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { adminDataStore } from '@/lib/adminDataStore';
import { resolveCuratedStudyMaterial, TopicFlashcard, TopicCheatsheet } from '@/data/topicStudyMaterials';

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "o_level", label: "Cambridge O Level" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "a_level", label: "Cambridge A Level" },
];

export const FlashcardsCheatsheetManager: React.FC = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const [activeSubTab, setActiveSubTab] = useState<'flashcards' | 'cheatsheet' | 'notes' | 'revision_pack'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<TopicFlashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Cheatsheet state
  const [keyFormulaeText, setKeyFormulaeText] = useState('');
  const [examRulesText, setExamRulesText] = useState('');
  const [commonPitfallsText, setCommonPitfallsText] = useState('');
  const [examinerTipsText, setExaminerTipsText] = useState('');

  // Curated Master Notes state
  const [curatedNotesText, setCuratedNotesText] = useState('');

  // Revision Pack state
  const [revisionPackOverview, setRevisionPackOverview] = useState('');
  const [revisionKeyPoints, setRevisionKeyPoints] = useState('');

  // Preview flip state
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const [previewCardFlipped, setPreviewCardFlipped] = useState(false);

  // Load all subjects from DB
  useEffect(() => {
    const loadSubjects = async () => {
      const { data } = await supabase.from('subjects').select('id, name, subject_code, qualification').order('name');
      if (data && data.length > 0) {
        setSubjects(data);
      }
    };
    loadSubjects();
  }, []);

  // Filter subjects by programme
  const filteredSubjects = subjects.filter(s => {
    if (selectedProgramme === "all") return true;
    const q = (s.qualification || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (selectedProgramme === "o_level") return q.includes("o_level") || q.includes("olevel") || !q;
    if (selectedProgramme === "igcse") return q.includes("igcse");
    if (selectedProgramme === "a_level") return q.includes("a_level") || q.includes("alevel") || q.includes("as_level");
    return true;
  });

  // Auto-select subject
  useEffect(() => {
    if (filteredSubjects.length > 0 && !filteredSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(filteredSubjects[0].id);
    } else if (filteredSubjects.length === 0) {
      setSelectedSubjectId('');
    }
  }, [selectedProgramme, filteredSubjects, selectedSubjectId]);

  // Load units when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setUnits([]);
      setSelectedUnitId('');
      return;
    }
    const loadUnits = async () => {
      const { data } = await supabase
        .from('units')
        .select('id, title, unit_number')
        .eq('subject_id', selectedSubjectId)
        .order('unit_number');
      if (data && data.length > 0) {
        setUnits(data);
        setSelectedUnitId(data[0].id);
      } else {
        setUnits([]);
        setSelectedUnitId('');
      }
    };
    loadUnits();
  }, [selectedSubjectId]);

  // Load lessons when unit changes
  useEffect(() => {
    if (!selectedUnitId) {
      setLessons([]);
      setSelectedLessonId('');
      return;
    }
    const loadLessons = async () => {
      const { data } = await supabase
        .from('lessons')
        .select('id, title, lesson_number')
        .eq('unit_id', selectedUnitId)
        .order('lesson_number');
      if (data && data.length > 0) {
        setLessons(data);
        setSelectedLessonId(data[0].id);
      } else {
        setLessons([]);
        setSelectedLessonId('');
      }
    };
    loadLessons();
  }, [selectedUnitId]);

  // Compute storage keys
  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeUnit = units.find(u => u.id === selectedUnitId);
  const activeLesson = lessons.find(l => l.id === selectedLessonId);

  const topicKey = selectedLessonId 
    ? `lesson_${selectedLessonId}`
    : selectedUnitId 
      ? `unit_${selectedUnitId}` 
      : `subject_${selectedSubjectId}`;

  // Load active flashcards, cheatsheet, notes, revision pack
  useEffect(() => {
    if (!selectedSubjectId) return;
    const subjectName = activeSubject?.name || '';
    const topicTitle = activeLesson?.title || activeUnit?.title || '';

    // 1. Flashcards
    const savedCards = adminDataStore.getTopicFlashcards(topicKey);
    if (savedCards && savedCards.length > 0) {
      setFlashcards(savedCards);
    } else {
      const resolved = resolveCuratedStudyMaterial(subjectName, topicTitle);
      setFlashcards(resolved.flashcards);
    }

    // 2. Cheatsheet
    const savedSheet: TopicCheatsheet | null = adminDataStore.getTopicCheatsheet(topicKey);
    const effectiveSheet = savedSheet || resolveCuratedStudyMaterial(subjectName, topicTitle).cheatsheet;

    setKeyFormulaeText(effectiveSheet.key_formulae?.join('\n') || '');
    setExamRulesText(effectiveSheet.exam_rules?.join('\n') || '');
    setCommonPitfallsText(effectiveSheet.common_pitfalls?.join('\n') || '');
    setExaminerTipsText(effectiveSheet.examiner_tips?.join('\n') || '');

    // 3. Curated Master Notes
    const savedNotes = localStorage.getItem(`curated_notes_${topicKey}`);
    if (savedNotes) {
      setCuratedNotesText(savedNotes);
    } else {
      setCuratedNotesText(
        `# ${topicTitle || subjectName} — Master Study Notes\n\n` +
        `## Core Syllabus Objectives\n- Understand fundamental principles and standard definitions.\n- Master the step-by-step problem-solving technique.\n\n` +
        `## Key Theoretical Concepts\n- Review essential Cambridge terminology and assessment criteria.\n- Pay close attention to mark scheme command words.\n\n` +
        `## Worked Exemplar\n1. State given parameters clearly.\n2. Apply appropriate formula or technique.\n3. Validate units and rounding precision.`
      );
    }

    // 4. Revision Pack
    const savedRevPack = localStorage.getItem(`revision_pack_${topicKey}`);
    if (savedRevPack) {
      try {
        const p = JSON.parse(savedRevPack);
        setRevisionPackOverview(p.overview || '');
        setRevisionKeyPoints(p.points || '');
      } catch {
        // default
      }
    } else {
      setRevisionPackOverview(`Comprehensive Cambridge revision bundle for ${topicTitle || subjectName}. Synthesizes key syllabus facts, formulas, and examiner pitfalls.`);
      setRevisionKeyPoints(`1. Definition accuracy is heavily tested.\n2. Common algebra/arithmetic slips cost easy marks.\n3. Structure all answers using clear numbered steps.`);
    }

    setPreviewCardIndex(0);
    setPreviewCardFlipped(false);
  }, [selectedSubjectId, selectedUnitId, selectedLessonId, topicKey]);

  // Add a new flashcard
  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please enter both a question and an answer.');
      return;
    }
    const newCard: TopicFlashcard = {
      id: `custom_${Date.now()}`,
      q: newQuestion.trim(),
      a: newAnswer.trim(),
    };
    setFlashcards(prev => [...prev, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    toast.success('Flashcard added to list! Click Save to apply.');
  };

  // Delete a flashcard
  const handleDeleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(c => c.id !== id));
    toast.success('Card removed');
  };

  // Save Flashcards to adminDataStore
  const handleSaveFlashcards = () => {
    adminDataStore.saveTopicFlashcards(topicKey, flashcards);
    toast.success(`Successfully saved ${flashcards.length} flashcards for ${activeLesson?.title || activeUnit?.title || activeSubject?.name}!`);
  };

  // Save Cheatsheet to adminDataStore
  const handleSaveCheatsheet = () => {
    const updatedSheet: TopicCheatsheet = {
      key_formulae: keyFormulaeText.split('\n').map(s => s.trim()).filter(Boolean),
      exam_rules: examRulesText.split('\n').map(s => s.trim()).filter(Boolean),
      common_pitfalls: commonPitfallsText.split('\n').map(s => s.trim()).filter(Boolean),
      examiner_tips: examinerTipsText.split('\n').map(s => s.trim()).filter(Boolean),
    };
    adminDataStore.saveTopicCheatsheet(topicKey, updatedSheet);
    toast.success(`Successfully saved cheatsheet for ${activeLesson?.title || activeUnit?.title || activeSubject?.name}!`);
  };

  // Save Notes
  const handleSaveNotes = async () => {
    localStorage.setItem(`curated_notes_${topicKey}`, curatedNotesText);
    toast.success(`Saved master study notes for ${activeLesson?.title || activeUnit?.title || activeSubject?.name}!`);
  };

  // Save Revision Pack
  const handleSaveRevisionPack = () => {
    localStorage.setItem(`revision_pack_${topicKey}`, JSON.stringify({
      overview: revisionPackOverview,
      points: revisionKeyPoints
    }));
    toast.success(`Saved Revision Pack for ${activeLesson?.title || activeUnit?.title || activeSubject?.name}!`);
  };

  // Reset to default
  const handleResetToDefault = () => {
    const subjectName = activeSubject?.name || '';
    const topicTitle = activeLesson?.title || activeUnit?.title || '';
    const def = resolveCuratedStudyMaterial(subjectName, topicTitle);

    setFlashcards(def.flashcards);
    setKeyFormulaeText(def.cheatsheet.key_formulae.join('\n'));
    setExamRulesText(def.cheatsheet.exam_rules.join('\n'));
    setCommonPitfallsText(def.cheatsheet.common_pitfalls.join('\n'));
    setExaminerTipsText(def.cheatsheet.examiner_tips?.join('\n') || '');

    adminDataStore.saveTopicFlashcards(topicKey, def.flashcards);
    adminDataStore.saveTopicCheatsheet(topicKey, def.cheatsheet);

    toast.success('Reset study materials to standard Cambridge syllabus defaults.');
  };

  // Generate with AI synthesis
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const handleGenerateWithAI = async () => {
    const subjectName = activeSubject?.name || 'Subject';
    const topicTitle = activeLesson?.title || activeUnit?.title || 'Core Topic';
    setIsGeneratingAI(true);
    try {
      toast.info(`Generating Cambridge materials for ${topicTitle}...`);
      const dynamic = resolveCuratedStudyMaterial(subjectName, topicTitle);
      
      setFlashcards(dynamic.flashcards);
      setKeyFormulaeText(dynamic.cheatsheet.key_formulae.join('\n'));
      setExamRulesText(dynamic.cheatsheet.exam_rules.join('\n'));
      setCommonPitfallsText(dynamic.cheatsheet.common_pitfalls.join('\n'));
      setExaminerTipsText(dynamic.cheatsheet.examiner_tips?.join('\n') || '');

      adminDataStore.saveTopicFlashcards(topicKey, dynamic.flashcards);
      adminDataStore.saveTopicCheatsheet(topicKey, dynamic.cheatsheet);
      toast.success(`Generated ${dynamic.flashcards.length} cards and cheatsheet for ${topicTitle}!`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>AI Learning Resources & Materials Manager</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize topic-specific Flashcards, Cheatsheets, Master Notes, and Revision Packs for any Cambridge node.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateWithAI}
            disabled={isGeneratingAI}
            className="rounded-xl border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/40 text-xs gap-1.5 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>{isGeneratingAI ? 'Generating...' : 'Generate with AI'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefault}
            className="rounded-xl border-slate-200 text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </Button>
        </div>
      </div>

      {/* Subject & Unit Selectors */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/60 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Programme
            </label>
            <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 text-xs">
                <SelectValue placeholder="Programme" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMES.map(p => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject
            </label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 text-xs">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.name} {s.subject_code ? `(${s.subject_code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Unit
            </label>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={units.length === 0}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 text-xs">
                <SelectValue placeholder={units.length === 0 ? 'No Units Found' : 'Select Unit'} />
              </SelectTrigger>
              <SelectContent>
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    Unit {u.unit_number}: {u.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> Lesson (Optional)
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={lessons.length === 0}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 text-xs">
                <SelectValue placeholder={lessons.length === 0 ? 'All Unit Lessons' : 'Select Lesson'} />
              </SelectTrigger>
              <SelectContent>
                {lessons.map(l => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">
                    Lesson {l.lesson_number}: {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Targeting Academic Node:</span>
            <Badge variant="secondary" className="font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              {activeSubject?.name || 'Subject'} › {activeUnit ? `Unit ${activeUnit.unit_number}` : 'All Units'} {activeLesson ? `› Lesson ${activeLesson.lesson_number}: ${activeLesson.title}` : ''}
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{topicKey}</span>
        </div>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as any)}>
        <TabsList className="rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80">
          <TabsTrigger value="flashcards" className="rounded-lg text-xs font-bold gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Flashcards ({flashcards.length})
          </TabsTrigger>
          <TabsTrigger value="cheatsheet" className="rounded-lg text-xs font-bold gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Exam Cheatsheet
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg text-xs font-bold gap-1.5">
            <BookMarked className="w-3.5 h-3.5" /> Curated Master Notes
          </TabsTrigger>
          <TabsTrigger value="revision_pack" className="rounded-lg text-xs font-bold gap-1.5">
            <Package className="w-3.5 h-3.5" /> Revision Pack
          </TabsTrigger>
        </TabsList>

        {/* FLASHCARDS TAB */}
        <TabsContent value="flashcards" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cards List & Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-teal-600" />
                    <span>Add New Flashcard</span>
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Front (Question / Prompt)</label>
                    <Input 
                      placeholder="e.g. State Newton's Second Law in terms of momentum." 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="rounded-xl text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Back (Answer / Explanation)</label>
                    <Textarea 
                      placeholder="e.g. The rate of change of momentum of a body is directly proportional to the applied resultant force..." 
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="rounded-xl text-xs min-h-[80px] mt-1 resize-none"
                    />
                  </div>
                  <Button onClick={handleAddFlashcard} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-9">
                    <Plus className="w-4 h-4 mr-1" /> Add Card to List
                  </Button>
                </div>
              </Card>

              {/* Existing Flashcards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Topic Flashcards</h3>
                  <Button onClick={handleSaveFlashcards} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm">
                    <Save className="w-3.5 h-3.5" /> Save Flashcards to Live Platform
                  </Button>
                </div>

                {flashcards.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed text-center text-xs text-slate-400">
                    No flashcards created yet for this topic.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {flashcards.map((card, idx) => (
                      <div key={card.id || idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <Badge variant="outline" className="text-[10px] font-bold border-teal-200 text-teal-700 dark:text-teal-300">
                            Card #{idx + 1}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteFlashcard(card.id)}
                            className="h-7 w-7 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Q: {card.q}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line">A: {card.a}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Student Interactive Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Student Live Preview
                </h3>
                {flashcards.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Card {previewCardIndex + 1} of {flashcards.length}
                  </span>
                )}
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-3">
                  <div
                    onClick={() => setPreviewCardFlipped(!previewCardFlipped)}
                    className="min-h-[220px] rounded-3xl border-2 border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                  >
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
                      {previewCardFlipped ? 'Answer' : 'Question'}
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {previewCardFlipped ? flashcards[previewCardIndex]?.a : flashcards[previewCardIndex]?.q}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-4">(Click card to flip)</div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPreviewCardIndex(p => Math.max(0, p - 1));
                        setPreviewCardFlipped(false);
                      }} 
                      disabled={previewCardIndex === 0}
                      className="rounded-xl border-slate-200 text-xs"
                    >
                      Previous
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setPreviewCardIndex(p => Math.min(flashcards.length - 1, p + 1));
                        setPreviewCardFlipped(false);
                      }} 
                      disabled={previewCardIndex === flashcards.length - 1}
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                    >
                      Next Card
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[220px] rounded-3xl border border-dashed flex items-center justify-center text-xs text-slate-400">
                  Add a flashcard to preview
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* CHEATSHEET TAB */}
        <TabsContent value="cheatsheet" className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Enter lines separated by newlines. Students see these structured in their workspace Cheatsheet tab.
            </p>
            <Button onClick={handleSaveCheatsheet} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm">
              <Save className="w-3.5 h-3.5" /> Save Cheatsheet to Live Platform
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Key Formulae */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Formulae & Core Rules
                </label>
                <span className="text-[10px] text-slate-400">1 per line</span>
              </div>
              <Textarea 
                value={keyFormulaeText} 
                onChange={(e) => setKeyFormulaeText(e.target.value)}
                placeholder="e.g. Image File Size = Pixels × Colour Depth (bits)"
                className="rounded-xl text-xs min-h-[140px] font-mono resize-none leading-relaxed"
              />
            </Card>

            {/* Cambridge Exam Rules */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Cambridge Exam Rules & Techniques
                </label>
                <span className="text-[10px] text-slate-400">1 per line</span>
              </div>
              <Textarea 
                value={examRulesText} 
                onChange={(e) => setExamRulesText(e.target.value)}
                placeholder="e.g. Always state units in final answer calculations"
                className="rounded-xl text-xs min-h-[140px] resize-none leading-relaxed"
              />
            </Card>

            {/* Common Pitfalls to Avoid */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Common Pitfalls to Avoid
                </label>
                <span className="text-[10px] text-slate-400">1 per line</span>
              </div>
              <Textarea 
                value={commonPitfallsText} 
                onChange={(e) => setCommonPitfallsText(e.target.value)}
                placeholder="e.g. Confusing bit depth with pixel resolution"
                className="rounded-xl text-xs min-h-[140px] resize-none leading-relaxed"
              />
            </Card>

            {/* Examiner Tips */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Examiner Tips & Keywords
                </label>
                <span className="text-[10px] text-slate-400">1 per line</span>
              </div>
              <Textarea 
                value={examinerTipsText} 
                onChange={(e) => setExaminerTipsText(e.target.value)}
                placeholder="e.g. Cambridge examiners award marks for using syllabus keywords"
                className="rounded-xl text-xs min-h-[140px] resize-none leading-relaxed"
              />
            </Card>
          </div>
        </TabsContent>

        {/* CURATED MASTER NOTES TAB */}
        <TabsContent value="notes" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Master curated learning notes for this curriculum node. Student personal annotations will never overwrite these.
            </p>
            <Button onClick={handleSaveNotes} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm">
              <Save className="w-3.5 h-3.5" /> Save Master Notes
            </Button>
          </div>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <Textarea
              value={curatedNotesText}
              onChange={(e) => setCuratedNotesText(e.target.value)}
              placeholder="Write or generate master study notes in Markdown..."
              className="rounded-xl text-xs min-h-[300px] font-mono leading-relaxed"
            />
          </Card>
        </TabsContent>

        {/* REVISION PACK TAB */}
        <TabsContent value="revision_pack" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Combined Revision Pack combining essential concepts, definitions, formulas, and revision checkpoints.
            </p>
            <Button onClick={handleSaveRevisionPack} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4 gap-1.5 shadow-sm">
              <Save className="w-3.5 h-3.5" /> Save Revision Pack
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-teal-600" /> Revision Pack Summary & Scope
              </label>
              <Textarea 
                value={revisionPackOverview} 
                onChange={(e) => setRevisionPackOverview(e.target.value)}
                placeholder="High level overview of what this revision pack covers..."
                className="rounded-xl text-xs min-h-[160px] leading-relaxed"
              />
            </Card>

            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Revision Points & Checkpoints
              </label>
              <Textarea 
                value={revisionKeyPoints} 
                onChange={(e) => setRevisionKeyPoints(e.target.value)}
                placeholder="Numbered core revision points..."
                className="rounded-xl text-xs min-h-[160px] leading-relaxed"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
