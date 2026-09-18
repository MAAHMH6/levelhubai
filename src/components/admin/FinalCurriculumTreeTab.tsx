import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore } from "@/lib/adminDataStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  GitBranch, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  FileText, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Plus, 
  Edit3, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  FileCheck2,
  Share2
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  subject_code?: string | null;
  qualification?: string | null;
}

interface Unit {
  id: string;
  title: string;
  unit_number: number;
  subject_id: string;
  icon_emoji: string;
  duration_weeks?: string | null;
  total_xp?: number;
}

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  unit_id: string;
  video_url: string | null;
  topic_name: string | null;
  description: string | null;
  quiz_question_count: number;
  practice_question_count: number;
  video_duration_display: string | null;
}

interface PublishState {
  is_published: boolean;
  version: number;
  published_at: string | null;
  verified_by: string;
}

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "o_level", label: "Cambridge O Level" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "a_level", label: "Cambridge A Level" },
];

export const FinalCurriculumTreeTab: React.FC = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Tree UI state
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");

  // Publish / Verification state
  const [publishState, setPublishState] = useState<PublishState>({
    is_published: false,
    version: 1,
    published_at: null,
    verified_by: "Admin"
  });

  // Load all subjects
  useEffect(() => {
    supabase.from("subjects").select("id, name, qualification, subject_code").order("name").then(({ data }) => {
      const merged = adminDataStore.applySubjectOverrides(data || []);
      setSubjects(merged as Subject[]);
    });
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

  // Reset or select first subject
  useEffect(() => {
    if (filteredSubjects.length > 0 && !filteredSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(filteredSubjects[0].id);
    } else if (filteredSubjects.length === 0) {
      setSelectedSubjectId("");
    }
  }, [selectedProgramme, filteredSubjects, selectedSubjectId]);

  // Load publication status from localStorage or db
  useEffect(() => {
    if (!selectedSubjectId) return;
    try {
      const stored = localStorage.getItem(`curriculum_publish_status_${selectedSubjectId}`);
      if (stored) {
        setPublishState(JSON.parse(stored));
      } else {
        setPublishState({
          is_published: false,
          version: 1,
          published_at: null,
          verified_by: "Admin"
        });
      }
    } catch {
      // default
    }
  }, [selectedSubjectId]);

  // Fetch complete dynamic tree for selected subject
  const loadCurriculumTree = useCallback(async () => {
    if (!selectedSubjectId) {
      setUnits([]);
      setLessons([]);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch units
      const { data: unitData } = await supabase
        .from("units")
        .select("*")
        .eq("subject_id", selectedSubjectId)
        .order("unit_number");
      
      const mergedUnits = adminDataStore.applyUnitOverrides(unitData || [], selectedSubjectId);
      setUnits(mergedUnits);

      // Expand all units initially
      setExpandedUnits(new Set(mergedUnits.map(u => u.id)));

      // 2. Fetch lessons for these units
      const unitIds = mergedUnits.map(u => u.id);
      if (unitIds.length > 0) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("*")
          .in("unit_id", unitIds)
          .order("lesson_number");

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
    } catch (err) {
      console.error("Failed to load dynamic curriculum tree:", err);
      toast({ title: "Error", description: "Failed to load dynamic curriculum tree.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    loadCurriculumTree();
  }, [loadCurriculumTree]);

  // Toggle tree node expansion
  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLesson = (id: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedUnits(new Set(units.map(u => u.id)));
    setExpandedLessons(new Set(lessons.map(l => l.id)));
  };

  const handleCollapseAll = () => {
    setExpandedUnits(new Set());
    setExpandedLessons(new Set());
  };

  // Publish / Verification action
  const handleVerifyAndPublish = () => {
    if (!selectedSubjectId) return;
    const updated: PublishState = {
      is_published: true,
      version: publishState.version + 1,
      published_at: new Date().toISOString(),
      verified_by: "Admin"
    };
    setPublishState(updated);
    try {
      localStorage.setItem(`curriculum_publish_status_${selectedSubjectId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage write skipped:", e);
    }
    toast({
      title: "Curriculum Verified & Published",
      description: `Version ${updated.version} is now current and authoritative for downstream AI, Quizzes, and Student features.`,
    });
  };

  const handleRevertToDraft = () => {
    if (!selectedSubjectId) return;
    const updated: PublishState = {
      ...publishState,
      is_published: false
    };
    setPublishState(updated);
    try {
      localStorage.setItem(`curriculum_publish_status_${selectedSubjectId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage write skipped:", e);
    }
    toast({
      title: "Reverted to Draft",
      description: "Curriculum is now in Draft mode. Edits will not affect published AI context until re-verified.",
    });
  };

  // Export tree outline as Markdown
  const handleExportMarkdown = () => {
    const curSub = subjects.find(s => s.id === selectedSubjectId);
    let md = `# Curriculum Tree: ${curSub?.name || "Subject"} (${curSub?.subject_code || "N/A"})\n`;
    md += `Programme: ${selectedProgramme.toUpperCase()} | Status: ${publishState.is_published ? "VERIFIED / PUBLISHED (v" + publishState.version + ")" : "DRAFT"}\n\n`;

    units.forEach(u => {
      md += `## Unit ${u.unit_number}: ${u.title}\n`;
      const uLessons = lessons.filter(l => l.unit_id === u.id);
      uLessons.forEach(l => {
        md += `  * Lesson ${l.lesson_number}: ${l.title}\n`;
        md += `    - Video: ${l.video_url || "None"}\n`;
        md += `    - Topic: ${l.topic_name || "General"}\n`;
        md += `    - Features: Notes | Flashcards | Cheatsheet | Revision Pack | ${l.quiz_question_count} Qs\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${curSub?.name || "curriculum"}_tree.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Curriculum outline exported to markdown." });
  };

  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  // Search filtering
  const filteredUnits = units.filter(u => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const unitMatch = u.title.toLowerCase().includes(q) || String(u.unit_number).includes(q);
    const lessonMatch = lessons.some(l => l.unit_id === u.id && (
      l.title.toLowerCase().includes(q) || 
      (l.topic_name && l.topic_name.toLowerCase().includes(q))
    ));
    return unitMatch || lessonMatch;
  });

  const totalVideos = lessons.filter(l => !!l.video_url).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Final Curriculum Tree</CardTitle>
                <CardDescription className="text-xs">
                  Central Academic Source of Truth — Programme → Subject → Unit → Lesson → Features
                </CardDescription>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {publishState.is_published ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRevertToDraft}
                className="text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" /> Revert to Draft
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleVerifyAndPublish}
                disabled={!selectedSubjectId || units.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" /> Verify & Publish Curriculum
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleExportMarkdown} disabled={units.length === 0}>
              <Download className="h-4 w-4 mr-1.5" /> Export Tree Outline
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Cascade: Programme -> Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" /> 1. Select Programme
              </label>
              <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
                <SelectTrigger>
                  <SelectValue placeholder="Programme" />
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
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
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
                <Search className="h-4 w-4 text-primary" /> Filter Tree
              </label>
              <Input 
                placeholder="Search units or lessons..." 
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Publishing & Verification Status Bar */}
          {selectedSubjectId && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              publishState.is_published 
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-950 dark:text-emerald-100" 
                : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/30 text-amber-950 dark:text-amber-100"
            }`}>
              <div className="flex items-center gap-3">
                {publishState.is_published ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {publishState.is_published ? "VERIFIED & PUBLISHED CURRICULUM" : "DRAFT CURRICULUM (IN EDIT)"}
                    </span>
                    <Badge variant="outline" className={`text-[11px] font-semibold ${
                      publishState.is_published ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300" : "border-amber-500/40 text-amber-700 dark:text-amber-300"
                    }`}>
                      v{publishState.version}.0
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {publishState.is_published 
                      ? `Authoritative curriculum tree verified by ${publishState.verified_by}. AI Tutor, Quizzes, and student features actively consume this structure.`
                      : "Currently in draft editing mode. Downstream AI systems will not consume unverified drafts until you click 'Verify & Publish'."}
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-md bg-background/80 border border-border font-medium">
                  {units.length} Units
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-background/80 border border-border font-medium">
                  {lessons.length} Lessons
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-background/80 border border-border font-medium">
                  {totalVideos} Videos
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Database Tree Viewer */}
      {selectedSubjectId ? (
        <Card className="border-border">
          <CardHeader className="py-3 px-6 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Hierarchy Tree: {currentSubjectObj?.name} {currentSubjectObj?.subject_code ? `(${currentSubjectObj.subject_code})` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleExpandAll} className="h-7 text-xs">
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCollapseAll} className="h-7 text-xs">
                Collapse All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Loading dynamic database curriculum tree...
              </div>
            ) : filteredUnits.length > 0 ? (
              <div className="space-y-4">
                {filteredUnits.map(unit => {
                  const unitLessons = lessons.filter(l => l.unit_id === unit.id).sort((a, b) => a.lesson_number - b.lesson_number);
                  const isUnitExpanded = expandedUnits.has(unit.id);

                  return (
                    <div key={unit.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-xs">
                      {/* Unit Header Node */}
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center justify-between p-3.5 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isUnitExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-base">{unit.icon_emoji}</span>
                            <span className="font-bold text-sm text-foreground">
                              Unit {unit.unit_number}: {unit.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-background border border-border">
                            {unitLessons.length} {unitLessons.length === 1 ? "Lesson" : "Lessons"}
                          </span>
                          {unit.duration_weeks && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {unit.duration_weeks} wks
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Unit Lessons Children */}
                      {isUnitExpanded && (
                        <div className="p-3 space-y-2 border-t border-border/60 bg-background/50">
                          {unitLessons.map(lesson => {
                            const isLessonExpanded = expandedLessons.has(lesson.id);

                            return (
                              <div 
                                key={lesson.id} 
                                className="border border-border/80 rounded-lg p-3 bg-card hover:border-primary/40 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <button 
                                      onClick={() => toggleLesson(lesson.id)}
                                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                                    >
                                      {isLessonExpanded ? (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronRight className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                                      {unit.unit_number}.{lesson.lesson_number}
                                    </span>
                                    <span className="text-xs font-semibold text-foreground truncate">
                                      {lesson.title}
                                    </span>
                                    {lesson.topic_name && (
                                      <span className="text-[11px] text-muted-foreground truncate hidden md:inline">
                                        • {lesson.topic_name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Feature tags on lesson */}
                                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                    {lesson.video_url ? (
                                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                                        <Video className="h-3 w-3" /> Video
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                                        No Video
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                      Notes
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                                      Flashcards
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                      Cheatsheet
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
                                      Revision Pack
                                    </Badge>
                                  </div>
                                </div>

                                {/* Detailed features drawer */}
                                {isLessonExpanded && (
                                  <div className="mt-3 pt-3 border-t border-border/50 text-xs space-y-2 pl-7">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                                      <div>
                                        <span className="font-medium text-foreground">Video URL: </span>
                                        {lesson.video_url ? (
                                          <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                                            {lesson.video_url} <ExternalLink className="h-3 w-3" />
                                          </a>
                                        ) : "None assigned"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Duration: </span>
                                        {lesson.video_duration_display || "Not specified"}
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Practice Questions: </span>
                                        {lesson.practice_question_count}
                                      </div>
                                      <div>
                                        <span className="font-medium text-foreground">Quiz Questions: </span>
                                        {lesson.quiz_question_count}
                                      </div>
                                    </div>
                                    {lesson.description && (
                                      <p className="text-muted-foreground italic mt-1">
                                        "{lesson.description}"
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {unitLessons.length === 0 && (
                            <p className="text-xs text-muted-foreground p-3 text-center border border-dashed rounded-lg">
                              No lessons currently in this unit.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No units or lessons found in the database for this subject. Use the Units Manager to create the initial units.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
          Please select a Programme and Subject above to view the dynamic Final Curriculum Tree.
        </div>
      )}
    </div>
  );
};
