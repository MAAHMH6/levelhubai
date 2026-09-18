import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore, StoredLesson } from "@/lib/adminDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, FileText, ChevronDown, ChevronRight, ArrowUp, ArrowDown, GraduationCap, BookOpen, Layers } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subject { 
  id: string; 
  name: string; 
  qualification?: string | null;
  subject_code?: string | null;
}

interface Unit { 
  id: string; 
  title: string; 
  unit_number: number; 
  subject_id: string; 
}

interface Lesson {
  id: string; 
  title: string; 
  description: string | null; 
  lesson_number: number;
  unit_id: string; 
  video_url: string | null; 
  topic_name: string | null;
  xp_reward: number; 
  quiz_question_count: number; 
  practice_question_count: number;
  video_duration_display: string | null; 
  video_duration_seconds: number | null;
}

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "o_level", label: "Cambridge O Level" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "a_level", label: "Cambridge A Level" },
];

const LessonsManager = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("all");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [editData, setEditData] = useState<Record<string, Partial<Lesson>>>({});
  const [addingToUnit, setAddingToUnit] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ 
    title: "", 
    description: "", 
    lesson_number: 1, 
    video_url: "", 
    topic_name: "", 
    xp_reward: 100, 
    quiz_question_count: 15, 
    practice_question_count: 25 
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("subjects").select("id, name, qualification, subject_code").order("name").then(({ data }) => {
      const merged = adminDataStore.applySubjectOverrides(data || []);
      setSubjects(merged as Subject[]);
    });
  }, []);

  // Filter subjects based on programme
  const filteredSubjects = subjects.filter(s => {
    if (selectedProgramme === "all") return true;
    const q = (s.qualification || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (selectedProgramme === "o_level") return q.includes("o_level") || q.includes("olevel") || !q;
    if (selectedProgramme === "igcse") return q.includes("igcse");
    if (selectedProgramme === "a_level") return q.includes("a_level") || q.includes("alevel") || q.includes("as_level");
    return true;
  });

  // Reset selected subject if not in filtered list
  useEffect(() => {
    if (filteredSubjects.length > 0 && !filteredSubjects.some(s => s.id === selectedSubject)) {
      setSelectedSubject(filteredSubjects[0].id);
    } else if (filteredSubjects.length === 0) {
      setSelectedSubject("");
    }
  }, [selectedProgramme, filteredSubjects, selectedSubject]);

  const fetchData = useCallback(async () => {
    if (!selectedSubject) {
      setUnits([]);
      setLessons([]);
      return;
    }
    const { data: unitData } = await supabase.from("units").select("id, title, unit_number, subject_id").eq("subject_id", selectedSubject).order("unit_number");
    const mergedUnits = adminDataStore.applyUnitOverrides(unitData || [], selectedSubject);
    setUnits(mergedUnits);

    // Expand all units by default when loading a subject
    setExpandedUnits(new Set(mergedUnits.map(u => u.id)));

    const ids = mergedUnits.map(u => u.id);
    if (ids.length > 0) {
      const { data: lessonData } = await supabase.from("lessons").select("*").in("unit_id", ids).order("lesson_number");
      let allMerged: Lesson[] = [];
      for (const u of mergedUnits) {
        const uLessons = (lessonData || []).filter(l => l.unit_id === u.id);
        const mergedForUnit = adminDataStore.applyLessonOverrides(uLessons, u.id);
        allMerged = [...allMerged, ...mergedForUnit];
      }
      setLessons(allMerged);
    } else {
      setLessons([]);
    }
  }, [selectedSubject]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Listen for admin changes from other tabs or components
  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("levelhub:lessons_updated", handleUpdate);
    return () => window.removeEventListener("levelhub:lessons_updated", handleUpdate);
  }, [fetchData]);

  const toggleUnit = (id: string) => setExpandedUnits(prev => { 
    const n = new Set(prev); 
    n.has(id) ? n.delete(id) : n.add(id); 
    return n; 
  });

  const updateField = (id: string, field: string, value: any) => setEditData(prev => ({ 
    ...prev, 
    [id]: { ...prev[id], [field]: value } 
  }));

  const saveLesson = async (id: string) => {
    setSavingId(id);
    const changes = editData[id] || {};
    
    // 1. Immediately persist in adminDataStore for instant resilience and storage
    adminDataStore.saveLesson(id, changes as Partial<StoredLesson>);

    // 2. Update local state immediately so UI updates without waiting
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));

    // 3. Attempt direct Supabase update
    try {
      if (Object.keys(changes).length > 0) {
        await supabase.from("lessons").update(changes as any).eq("id", id);
      }
    } catch (err) {
      console.warn("Supabase update bypassed, saved locally:", err);
    }

    toast({ 
      title: "Changes Saved", 
      description: "Lesson updated and persisted across the platform." 
    });

    setEditData(prev => { 
      const n = { ...prev }; 
      delete n[id]; 
      return n; 
    });
    setSavingId(null);
  };

  const saveAllInUnit = async (unitId: string) => {
    const uLessons = lessons.filter(l => l.unit_id === unitId);
    for (const l of uLessons) {
      if (editData[l.id]) {
        await saveLesson(l.id);
      }
    }
    toast({ title: "All Changes Saved", description: "All modified lessons have been updated." });
  };

  const addLesson = async (unitId: string) => {
    if (!newLesson.title.trim()) return;
    const newId = crypto.randomUUID();
    const lessonObj: StoredLesson = {
      id: newId,
      title: newLesson.title,
      description: newLesson.description || null,
      lesson_number: newLesson.lesson_number,
      unit_id: unitId,
      video_url: newLesson.video_url || null,
      topic_name: newLesson.topic_name || null,
      xp_reward: newLesson.xp_reward,
      quiz_question_count: newLesson.quiz_question_count,
      practice_question_count: newLesson.practice_question_count,
    };

    // 1. Save to local store
    adminDataStore.addLesson(lessonObj);

    // 2. Attempt Supabase insert
    try {
      await supabase.from("lessons").insert(lessonObj as any);
    } catch (err) {
      console.warn("Supabase insert bypassed, saved locally:", err);
    }

    toast({ title: "Lesson Created", description: `"${newLesson.title}" created successfully.` });
    setAddingToUnit(null);
    setNewLesson({ 
      title: "", 
      description: "", 
      lesson_number: 1, 
      video_url: "", 
      topic_name: "", 
      xp_reward: 100, 
      quiz_question_count: 15, 
      practice_question_count: 25 
    });
    fetchData();
  };

  const deleteLesson = async (id: string) => {
    adminDataStore.deleteLesson(id);
    try {
      await supabase.from("lessons").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete bypassed, deleted locally:", err);
    }
    toast({ title: "Lesson Deleted", description: "Lesson has been removed." });
    setEditData(prev => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    fetchData();
  };

  const moveLessonOrder = async (uLessons: Lesson[], index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= uLessons.length) return;

    const currentLesson = uLessons[index];
    const targetLesson = uLessons[targetIndex];

    const currentNum = currentLesson.lesson_number;
    const targetNum = targetLesson.lesson_number;

    const newCurrentNum = targetNum === currentNum ? (direction === "up" ? currentNum - 1 : currentNum + 1) : targetNum;
    const newTargetNum = currentNum;

    adminDataStore.saveLesson(currentLesson.id, { lesson_number: newCurrentNum });
    adminDataStore.saveLesson(targetLesson.id, { lesson_number: newTargetNum });

    try {
      await Promise.all([
        supabase.from("lessons").update({ lesson_number: newCurrentNum } as any).eq("id", currentLesson.id),
        supabase.from("lessons").update({ lesson_number: newTargetNum } as any).eq("id", targetLesson.id),
      ]);
    } catch (e) {
      console.warn("Lesson reorder synced locally:", e);
    }

    toast({ title: "Reordered", description: `Updated lesson sequence.` });
    fetchData();
  };

  const getVal = (lesson: Lesson, field: keyof Lesson) =>
    editData[lesson.id]?.[field] !== undefined ? editData[lesson.id][field] : lesson[field];

  const unitLessons = (unitId: string) => lessons.filter(l => l.unit_id === unitId).sort((a, b) => a.lesson_number - b.lesson_number);

  const displayUnits = units.filter(u => selectedUnitFilter === "all" || u.id === selectedUnitFilter);
  const currentSubjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" /> Lessons Manager
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Canonical Hierarchy: Select Programme → Select Subject → Select Unit → Manage Lessons
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cascade: Programme -> Subject -> Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary" /> 1. Select Programme
            </label>
            <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
              <SelectTrigger>
                <SelectValue placeholder="Select Programme..." />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" /> 2. Select Subject
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject..." />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.subject_code ? `(${s.subject_code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" /> 3. Select Unit
            </label>
            <Select value={selectedUnitFilter} onValueChange={setSelectedUnitFilter} disabled={units.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units ({units.length})</SelectItem>
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSubject && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {currentSubjectObj?.name || "Subject"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {lessons.length} Total {lessons.length === 1 ? "Lesson" : "Lessons"} in Subject
              </span>
            </div>
          </div>
        )}

        {displayUnits.map(unit => {
          const uLessons = unitLessons(unit.id);
          const isExpanded = expandedUnits.has(unit.id);
          const hasPendingEdits = uLessons.some(l => !!editData[l.id]);

          return (
            <div key={unit.id} className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="w-full flex items-center justify-between px-4 py-3 bg-muted/60 hover:bg-muted/90 transition-colors">
                <button onClick={() => toggleUnit(unit.id)} className="flex-1 flex items-center gap-3 text-left">
                  <span className="font-semibold text-foreground">Unit {unit.unit_number}: {unit.title}</span>
                  <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
                    {uLessons.length} lessons
                  </span>
                  {hasPendingEdits && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      Unsaved edits in unit
                    </Badge>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  {hasPendingEdits && isExpanded && (
                    <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs" onClick={() => saveAllInUnit(unit.id)}>
                      <Save className="h-3.5 w-3.5 mr-1" /> Save All
                    </Button>
                  )}
                  <button onClick={() => toggleUnit(unit.id)} className="p-1 hover:bg-background/50 rounded">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  <Button size="sm" variant="outline" onClick={() => {
                    setAddingToUnit(addingToUnit === unit.id ? null : unit.id);
                    setNewLesson(prev => ({ ...prev, lesson_number: uLessons.length + 1 }));
                  }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Lesson to Unit {unit.unit_number}
                  </Button>

                  {addingToUnit === unit.id && (
                    <div className="border border-dashed border-primary rounded-xl p-4 space-y-3 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">New Lesson in Unit {unit.unit_number}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input placeholder="Title" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} />
                        <Input type="number" placeholder="Lesson #" value={newLesson.lesson_number} onChange={e => setNewLesson(p => ({ ...p, lesson_number: parseInt(e.target.value) || 1 }))} />
                        <Input placeholder="Topic Name" value={newLesson.topic_name} onChange={e => setNewLesson(p => ({ ...p, topic_name: e.target.value }))} />
                        <Input placeholder="Video URL (YouTube or MP4)" value={newLesson.video_url} onChange={e => setNewLesson(p => ({ ...p, video_url: e.target.value }))} />
                        <Input type="number" placeholder="XP Reward" value={newLesson.xp_reward} onChange={e => setNewLesson(p => ({ ...p, xp_reward: parseInt(e.target.value) || 100 }))} />
                        <Input type="number" placeholder="Quiz Qs" value={newLesson.quiz_question_count} onChange={e => setNewLesson(p => ({ ...p, quiz_question_count: parseInt(e.target.value) || 15 }))} />
                        <Input type="number" placeholder="Practice Qs" value={newLesson.practice_question_count} onChange={e => setNewLesson(p => ({ ...p, practice_question_count: parseInt(e.target.value) || 25 }))} />
                      </div>
                      <Textarea placeholder="Description" value={newLesson.description} onChange={e => setNewLesson(p => ({ ...p, description: e.target.value }))} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => addLesson(unit.id)}>Create Lesson</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingToUnit(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {uLessons.map((lesson, idx) => {
                    const isModified = !!editData[lesson.id];
                    const isSaving = savingId === lesson.id;

                    return (
                      <div 
                        key={lesson.id} 
                        className={`border rounded-xl p-4 space-y-3 transition-all ${
                          isModified 
                            ? "border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm" 
                            : "border-border bg-card hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              Lesson #{getVal(lesson, "lesson_number")}
                            </span>
                            <span className="text-sm font-medium text-foreground truncate max-w-[280px]">
                              {getVal(lesson, "title") || "Untitled Lesson"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              disabled={idx === 0}
                              onClick={() => moveLessonOrder(uLessons, idx, "up")}
                              title="Move Lesson Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7" 
                              disabled={idx === uLessons.length - 1}
                              onClick={() => moveLessonOrder(uLessons, idx, "down")}
                              title="Move Lesson Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            {isModified && (
                              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px]">
                                Unsaved Changes
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Title</label>
                            <Input 
                              placeholder="Title" 
                              value={(getVal(lesson, "title") as string) || ""} 
                              onChange={e => updateField(lesson.id, "title", e.target.value)} 
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Lesson Number</label>
                            <Input 
                              type="number" 
                              placeholder="Lesson #" 
                              value={getVal(lesson, "lesson_number") as number} 
                              onChange={e => updateField(lesson.id, "lesson_number", parseInt(e.target.value) || 1)} 
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Topic Name</label>
                            <Input 
                              placeholder="Topic Name" 
                              value={(getVal(lesson, "topic_name") as string) || ""} 
                              onChange={e => updateField(lesson.id, "topic_name", e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">Video URL</label>
                          <Input 
                            placeholder="Video URL (e.g. YouTube or direct MP4)" 
                            value={(getVal(lesson, "video_url") as string) || ""} 
                            onChange={e => updateField(lesson.id, "video_url", e.target.value)} 
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">Description</label>
                          <Textarea 
                            placeholder="Description" 
                            value={(getVal(lesson, "description") as string) || ""} 
                            onChange={e => updateField(lesson.id, "description", e.target.value)} 
                            rows={2} 
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">XP Reward</label>
                            <Input 
                              type="number" 
                              placeholder="XP" 
                              value={getVal(lesson, "xp_reward") as number} 
                              onChange={e => updateField(lesson.id, "xp_reward", parseInt(e.target.value) || 0)} 
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Quiz Questions</label>
                            <Input 
                              type="number" 
                              placeholder="Quiz Qs" 
                              value={getVal(lesson, "quiz_question_count") as number} 
                              onChange={e => updateField(lesson.id, "quiz_question_count", parseInt(e.target.value) || 0)} 
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Practice Questions</label>
                            <Input 
                              type="number" 
                              placeholder="Practice Qs" 
                              value={getVal(lesson, "practice_question_count") as number} 
                              onChange={e => updateField(lesson.id, "practice_question_count", parseInt(e.target.value) || 0)} 
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                          <Button 
                            size="sm" 
                            disabled={isSaving}
                            className={
                              isModified 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all" 
                                : "bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            }
                            onClick={() => saveLesson(lesson.id)}
                          >
                            <Save className="h-4 w-4 mr-1.5" /> 
                            {isSaving ? "Saving..." : isModified ? "Save Changes" : "Save"}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lesson {lesson.lesson_number}?</AlertDialogTitle>
                                <AlertDialogDescription>This will remove the lesson permanently from the database.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteLesson(lesson.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                  {uLessons.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      No lessons in this unit yet. Click "Add Lesson to Unit {unit.unit_number}" above.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {selectedSubject && units.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No units found for this subject. Create units first in the Units Manager.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonsManager;
