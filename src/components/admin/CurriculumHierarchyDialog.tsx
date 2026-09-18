import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit2, Check, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Topic { id: string; name: string; lesson_id?: string | null; order_index?: number }
interface Lesson { id: string; title: string; unit_id: string; lesson_number?: number }
interface Unit { id: string; title: string; unit_number?: number }

export default function CurriculumHierarchyDialog({ subjectId, subjectName, open, onOpenChange }: { subjectId: string, subjectName: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [addingType, setAddingType] = useState<"unit" | "lesson" | "topic" | null>(null);
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");

  const loadHierarchy = async () => {
    if (!subjectId) return;
    setLoading(true);
    const [uRes, lRes, tRes] = await Promise.all([
      supabase.from("units").select("*").eq("subject_id", subjectId).order("unit_number"),
      supabase.from("lessons").select("*, units!inner(subject_id)").eq("units.subject_id", subjectId).order("lesson_number"),
      supabase.from("topics").select("*").eq("subject_id", subjectId).order("order_index")
    ]);
    
    if (uRes.data) setUnits(uRes.data);
    if (lRes.data) setLessons(lRes.data as unknown as Lesson[]);
    if (tRes.data) setTopics(tRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadHierarchy();
  }, [open, subjectId]);

  const saveEdit = async (table: "units" | "lessons" | "topics", id: string) => {
    if (!editValue.trim()) return;
    const updatePayload = table === "topics" ? { name: editValue } : { title: editValue };
    const { error } = await supabase.from(table).update(updatePayload).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
      setEditingId(null);
      loadHierarchy();
    }
  };

  const saveNew = async () => {
    if (!addValue.trim() || !addingType) return;
    
    if (addingType === "unit") {
      const maxOrder = units.length > 0 ? Math.max(...units.map(u => u.unit_number || 0)) : 0;
      const { error } = await supabase.from("units").insert({ subject_id: subjectId, title: addValue, unit_number: maxOrder + 1 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Unit Added" });
    } else if (addingType === "lesson" && addingParentId) {
      const unitLessons = lessons.filter(l => l.unit_id === addingParentId);
      const maxOrder = unitLessons.length > 0 ? Math.max(...unitLessons.map(l => l.lesson_number || 0)) : 0;
      const { error } = await supabase.from("lessons").insert({ unit_id: addingParentId, title: addValue, lesson_number: maxOrder + 1 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Lesson Added" });
    } else if (addingType === "topic" && addingParentId) {
      const lessonTopics = topics.filter(t => t.lesson_id === addingParentId);
      const maxOrder = lessonTopics.length > 0 ? Math.max(...lessonTopics.map(t => t.order_index || 0)) : 0;
      const { error } = await supabase.from("topics").insert({ subject_id: subjectId, lesson_id: addingParentId, name: addValue, order_index: maxOrder + 1 });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Topic Added" });
    }

    setAddingType(null);
    setAddingParentId(null);
    setAddValue("");
    loadHierarchy();
  };

  const renderEditable = (table: "units" | "lessons" | "topics", item: { id: string, title?: string, name?: string }) => {
    const itemName = item.title || item.name || "";
    if (editingId === item.id) {
      return (
        <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit(table, item.id)} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); saveEdit(table, item.id); }}><Check className="h-4 w-4 text-green-600" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}><X className="h-4 w-4 text-destructive" /></Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between flex-1 group pr-4">
        <span>{itemName}</span>
        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
          e.stopPropagation();
          setEditingId(item.id);
          setEditValue(itemName);
        }}>
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderAddRow = (type: "unit" | "lesson" | "topic", parentId: string | null = null) => {
    if (addingType === type && addingParentId === parentId) {
      return (
        <div className="flex items-center gap-2 mt-2 ml-2 pr-4">
          <Input value={addValue} onChange={(e) => setAddValue(e.target.value)} placeholder={`New ${type} name...`} className="h-7 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && saveNew()} />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveNew}><Check className="h-4 w-4 text-green-600" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setAddingType(null)}><X className="h-4 w-4 text-destructive" /></Button>
        </div>
      );
    }
    
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground mt-1 ml-1" onClick={(e) => {
        e.stopPropagation();
        setAddingType(type);
        setAddingParentId(parentId);
        setAddValue("");
      }}>
        <Plus className="h-3 w-3 mr-1" /> Add {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Curriculum Hierarchy: {subjectName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4">
              {units.length === 0 && <p className="text-sm text-muted-foreground">No units found. Add one below.</p>}
              <Accordion type="multiple" className="w-full">
                {units.map((unit) => {
                  const unitLessons = lessons.filter(l => l.unit_id === unit.id);
                  return (
                    <AccordionItem key={unit.id} value={unit.id}>
                      <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-2 rounded-sm data-[state=open]:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2 w-full text-left font-semibold">
                          {renderEditable("units", unit)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-2 pt-1 border-l-2 ml-3 mt-1 space-y-2">
                        {unitLessons.length === 0 && <span className="text-xs text-muted-foreground">No lessons extracted.</span>}
                        {unitLessons.map((lesson) => {
                          const lessonTopics = topics.filter(t => t.lesson_id === lesson.id);
                          return (
                            <div key={lesson.id} className="border rounded-md overflow-hidden bg-white">
                              <div className="bg-slate-50 px-3 py-2 border-b flex items-center font-medium text-sm">
                                {renderEditable("lessons", lesson)}
                              </div>
                              <div className="px-3 py-2 bg-slate-50/50 space-y-1">
                                {lessonTopics.length === 0 && <span className="text-xs text-muted-foreground pl-1">No topics mapped yet.</span>}
                                {lessonTopics.map((topic) => (
                                  <div key={topic.id} className="flex items-center text-sm pl-2 border-l-2 border-slate-200 ml-1 py-1">
                                    {renderEditable("topics", topic)}
                                  </div>
                                ))}
                                {renderAddRow("topic", lesson.id)}
                              </div>
                            </div>
                          );
                        })}
                        {renderAddRow("lesson", unit.id)}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {renderAddRow("unit")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
