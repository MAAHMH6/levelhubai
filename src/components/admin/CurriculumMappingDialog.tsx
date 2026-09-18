import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Unit { id: string; title: string; unit_number: number }
interface Lesson { id: string; title: string; lesson_number: number; unit_id: string }

export default function CurriculumMappingDialog({ 
  documentId, 
  subjectId, 
  open, 
  onOpenChange,
  onSuccess
}: { 
  documentId: string | null, 
  subjectId: string | null, 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [existingUnits, setExistingUnits] = useState<Unit[]>([]);
  const [existingLessons, setExistingLessons] = useState<Lesson[]>([]);
  
  const [unmatchedUnits, setUnmatchedUnits] = useState<string[]>([]);
  const [unmatchedLessons, setUnmatchedLessons] = useState<{ unitTitle: string, lessonTitle: string }[]>([]);
  
  const [unitMappings, setUnitMappings] = useState<Record<string, string>>({});
  const [lessonMappings, setLessonMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && documentId && subjectId) {
      loadData();
    }
  }, [open, documentId, subjectId]);

  function slugify(str: string) {
    return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, uRes, lRes] = await Promise.all([
        supabase.from("curriculum_documents").select("structured_index").eq("id", documentId).single(),
        supabase.from("units").select("*").eq("subject_id", subjectId).order("unit_number"),
        supabase.from("lessons").select("*, units!inner(subject_id)").eq("units.subject_id", subjectId).order("lesson_number")
      ]);

      if (docRes.error) throw docRes.error;
      
      const eUnits = uRes.data || [];
      const eLessons = lRes.data || [];
      setExistingUnits(eUnits);
      setExistingLessons(eLessons);

      const structuredIndex = docRes.data.structured_index as any;
      if (!structuredIndex || !structuredIndex.units) {
        throw new Error("No structured index found on document.");
      }

      const uUnmatched: string[] = [];
      const lUnmatched: { unitTitle: string, lessonTitle: string }[] = [];
      const initUMap: Record<string, string> = {};
      const initLMap: Record<string, string> = {};

      for (const unit of structuredIndex.units) {
        const match = eUnits.find(u => slugify(u.title) === slugify(unit.title));
        if (!match) {
          uUnmatched.push(unit.title);
          initUMap[unit.title] = "create"; 
        }

        if (Array.isArray(unit.lessons)) {
          for (const lesson of unit.lessons) {
             let lMatch = null;
             if (match) {
                lMatch = eLessons.find(l => l.unit_id === match.id && slugify(l.title) === slugify(lesson.title));
             }
             if (!lMatch) {
                lUnmatched.push({ unitTitle: unit.title, lessonTitle: lesson.title });
                initLMap[lesson.title] = "create";
             }
          }
        }
      }

      setUnmatchedUnits(uUnmatched);
      setUnmatchedLessons(lUnmatched);
      setUnitMappings(initUMap);
      setLessonMappings(initLMap);

    } catch (e: any) {
      toast({ title: "Error loading mapping data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!documentId) return;
    setSaving(true);
    try {
      const payload = {
        document_id: documentId,
        mapping_resolution: {
          units: unitMappings,
          lessons: lessonMappings
        }
      };

      const { error } = await supabase.functions.invoke("index-curriculum-doc", { body: payload });
      if (error) throw error;

      toast({ title: "Mapping saved", description: "Indexing resumed successfully." });
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Failed to save mapping", description: e.message || String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Extracted Structure</DialogTitle>
          <DialogDescription>
            The AI extracted Units and Lessons that don't exactly match your existing database. 
            Map them to existing items to avoid duplicates, or choose "Create New" to establish them.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-6 mt-4">
            {unmatchedUnits.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Badge variant="secondary">{unmatchedUnits.length}</Badge> Unmatched Units
                </h3>
                <div className="border rounded-md divide-y">
                  {unmatchedUnits.map((uTitle, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-4 bg-muted/20">
                      <div className="font-medium flex-1 line-clamp-2">{uTitle}</div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="w-[300px] shrink-0">
                        <Select 
                          value={unitMappings[uTitle] || "create"} 
                          onValueChange={(val) => setUnitMappings(prev => ({ ...prev, [uTitle]: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create" className="text-primary font-medium">Create New Unit</SelectItem>
                            {existingUnits.map(eu => (
                              <SelectItem key={eu.id} value={eu.id}>Map to: {eu.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unmatchedLessons.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Badge variant="secondary">{unmatchedLessons.length}</Badge> Unmatched Lessons
                </h3>
                <div className="border rounded-md divide-y">
                  {unmatchedLessons.map((l, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-4 bg-muted/20">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">{l.unitTitle}</div>
                        <div className="font-medium line-clamp-2">{l.lessonTitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="w-[300px] shrink-0">
                        <Select 
                          value={lessonMappings[l.lessonTitle] || "create"} 
                          onValueChange={(val) => setLessonMappings(prev => ({ ...prev, [l.lessonTitle]: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="create" className="text-primary font-medium">Create New Lesson</SelectItem>
                            {existingLessons.map(el => (
                              <SelectItem key={el.id} value={el.id}>Map to: {el.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unmatchedUnits.length === 0 && unmatchedLessons.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                All units and lessons matched perfectly!
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save & Resume Indexing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
