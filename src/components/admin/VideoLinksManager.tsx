import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore } from "@/lib/adminDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  Video, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  FileText, 
  Play, 
  ExternalLink, 
  Clock, 
  Sparkles,
  Trash2
} from "lucide-react";

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
  lesson_number: number; 
  unit_id: string; 
  video_url: string | null; 
  topic_name: string | null;
  description: string | null;
  video_duration_display: string | null;
  video_duration_seconds: number | null;
}

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "o_level", label: "Cambridge O Level" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "a_level", label: "Cambridge A Level" },
];

const VideoLinksManager = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");

  // Lesson media edit fields
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [durationDisplay, setDurationDisplay] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const [resourceLink, setResourceLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load subjects
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

  // Auto-select first subject when programme changes
  useEffect(() => {
    if (filteredSubjects.length > 0 && !filteredSubjects.some(s => s.id === selectedSubject)) {
      setSelectedSubject(filteredSubjects[0].id);
    } else if (filteredSubjects.length === 0) {
      setSelectedSubject("");
    }
  }, [selectedProgramme, filteredSubjects, selectedSubject]);

  // Load units for selected subject
  useEffect(() => {
    if (!selectedSubject) {
      setUnits([]);
      setSelectedUnit("");
      return;
    }
    const loadUnits = async () => {
      const { data } = await supabase.from("units").select("id, title, unit_number, subject_id").eq("subject_id", selectedSubject).order("unit_number");
      const merged = adminDataStore.applyUnitOverrides(data || [], selectedSubject);
      setUnits(merged);
      if (merged.length > 0) {
        setSelectedUnit(merged[0].id);
      } else {
        setSelectedUnit("");
      }
    };
    loadUnits();
  }, [selectedSubject]);

  // Load lessons for selected unit
  useEffect(() => {
    if (!selectedUnit) {
      setLessons([]);
      setSelectedLessonId("");
      return;
    }
    const loadLessons = async () => {
      const { data } = await supabase.from("lessons").select("*").eq("unit_id", selectedUnit).order("lesson_number");
      const merged = adminDataStore.applyLessonOverrides(data || [], selectedUnit);
      setLessons(merged);
      if (merged.length > 0) {
        setSelectedLessonId(merged[0].id);
      } else {
        setSelectedLessonId("");
      }
    };
    loadLessons();
  }, [selectedUnit]);

  // Sync form inputs when selectedLessonId changes
  useEffect(() => {
    if (!selectedLessonId) {
      setVideoUrl("");
      setVideoTitle("");
      setDurationDisplay("");
      setLessonTopic("");
      setResourceLink("");
      return;
    }
    const curLesson = lessons.find(l => l.id === selectedLessonId);
    if (curLesson) {
      setVideoUrl(curLesson.video_url || "");
      setVideoTitle(curLesson.title || "");
      setDurationDisplay(curLesson.video_duration_display || "");
      setLessonTopic(curLesson.topic_name || "");
      // Try to parse resources if present in topic_name / metadata
      setResourceLink("");
    }
  }, [selectedLessonId, lessons]);

  const handleSaveCurrentLesson = async () => {
    if (!selectedLessonId) return;
    setIsSaving(true);

    const updates = {
      video_url: videoUrl.trim() || null,
      title: videoTitle.trim() || undefined,
      video_duration_display: durationDisplay.trim() || null,
      topic_name: lessonTopic.trim() || null,
    };

    // Save to local store
    adminDataStore.saveLesson(selectedLessonId, updates as any);

    // Update DB
    try {
      const { error } = await supabase.from("lessons").update(updates as any).eq("id", selectedLessonId);
      if (error) {
        console.warn("Supabase update error (saved locally):", error);
      }
      toast({ title: "Saved", description: "Video & lesson resources updated successfully." });
      setLessons(prev => prev.map(l => l.id === selectedLessonId ? { ...l, ...updates } : l));
    } catch (e: any) {
      toast({ title: "Saved Locally", description: "Saved to local cache." });
    } finally {
      setIsSaving(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const activeLesson = lessons.find(l => l.id === selectedLessonId);
  const activeUnit = units.find(u => u.id === selectedUnit);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" /> Video & Resource Links Manager
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Canonical Hierarchy: Select Programme → Select Subject → Select Unit → Select Lesson → Manage Video/Resources
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dependent Dropdown Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary" /> 1. Programme
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
              <BookOpen className="h-4 w-4 text-primary" /> 2. Subject
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
              <Layers className="h-4 w-4 text-primary" /> 3. Unit
            </label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={units.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={units.length === 0 ? "No Units" : "Select Unit"} />
              </SelectTrigger>
              <SelectContent>
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id}>Unit {u.unit_number}: {u.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> 4. Lesson
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={lessons.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={lessons.length === 0 ? "No Lessons" : "Select Lesson"} />
              </SelectTrigger>
              <SelectContent>
                {lessons.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    Lesson {l.lesson_number}: {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Lesson Video & Resource Editor */}
        {selectedLessonId && activeLesson ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editor fields */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Unit {activeUnit?.unit_number} → Lesson {activeLesson.lesson_number}
                    </h3>
                    <p className="text-xs text-muted-foreground">{activeLesson.title}</p>
                  </div>
                  <Badge variant={videoUrl ? "default" : "secondary"} className="text-xs">
                    {videoUrl ? "Video Attached" : "No Video"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      YouTube Video URL
                    </label>
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Video / Lesson Title
                      </label>
                      <Input 
                        placeholder="Title" 
                        value={videoTitle}
                        onChange={e => setVideoTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Duration (e.g. "18:45" or "20 mins")
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input 
                          placeholder="e.g. 18:30" 
                          value={durationDisplay}
                          onChange={e => setDurationDisplay(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Topic / Syllabus Tag
                    </label>
                    <Input 
                      placeholder="e.g. Algebraic Manipulation & Factorisation" 
                      value={lessonTopic}
                      onChange={e => setLessonTopic(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button 
                      onClick={handleSaveCurrentLesson}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      <Save className="h-4 w-4 mr-1.5" /> 
                      {isSaving ? "Saving..." : "Save Lesson Video & Details"}
                    </Button>
                    {videoUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVideoUrl("")}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove Video
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Other lessons quick list */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  All Lessons in Unit {activeUnit?.unit_number} ({lessons.length})
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {lessons.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLessonId(l.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        l.id === selectedLessonId
                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="truncate">
                        Lesson {l.lesson_number}: {l.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground ml-2">
                        {l.video_url ? "🎥 Has Video" : "⚪ Empty"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Preview Panel */}
            <div className="lg:col-span-5">
              <div className="border border-border rounded-xl p-4 bg-card space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" /> Video Preview
                </h4>
                {embedUrl ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-md border border-border">
                    <iframe
                      src={embedUrl}
                      title="Lesson Video Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center text-center p-4 border border-dashed border-border text-muted-foreground">
                    <Video className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-xs font-medium">No valid YouTube URL provided</p>
                    <p className="text-[11px] opacity-75 mt-0.5">Enter a valid YouTube link on the left to preview</p>
                  </div>
                )}
                {videoUrl && !embedUrl && (
                  <p className="text-xs text-amber-500">
                    Non-YouTube video URL provided: <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Open link <ExternalLink className="h-3 w-3" /></a>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            Please select a Programme, Subject, Unit, and Lesson from the dropdowns above to manage video links.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoLinksManager;
