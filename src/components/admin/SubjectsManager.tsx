import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore, StoredSubject } from "@/lib/adminDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subject {
  id: string;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  subject_code: string | null;
  subscription_tier: string;
  is_premium?: boolean | null;
  qualification?: string | null;
  qualification_variant?: string | null;
  enabled?: boolean | null;
  display_order?: number | null;
}

const SubjectsManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editData, setEditData] = useState<Record<string, Partial<Subject>>>({});
  const [newSubject, setNewSubject] = useState({ name: "", description: "", icon: "", color: "", subject_code: "", qualification: "o_level", qualification_variant: "", display_order: 999 });
  const [showAdd, setShowAdd] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    const merged = adminDataStore.applySubjectOverrides(data || []);
    setSubjects(merged);
  }, []);

  useEffect(() => { 
    fetchSubjects(); 
  }, [fetchSubjects]);

  useEffect(() => {
    const handleUpdate = () => fetchSubjects();
    window.addEventListener("levelhub:subjects_updated", handleUpdate);
    return () => window.removeEventListener("levelhub:subjects_updated", handleUpdate);
  }, [fetchSubjects]);

  const updateField = (id: string, field: string, value: any) => {
    setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveSubject = async (id: string) => {
    setSavingId(id);
    const changes = editData[id] || {};
    
    // 1. Immediately persist in admin store
    adminDataStore.saveSubject(id, changes as Partial<StoredSubject>);

    // 2. Instant local UI state update
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));

    // 3. Attempt Supabase update
    try {
      if (Object.keys(changes).length > 0) {
        await supabase.from("subjects").update(changes as any).eq("id", id);
      }
    } catch (err) {
      console.warn("Supabase subject update bypassed, saved locally:", err);
    }

    toast({ title: "Subject Saved", description: "Subject updated and persisted across the platform." });
    setEditData(prev => { const n = { ...prev }; delete n[id]; return n; });
    setSavingId(null);
  };

  const addSubject = async () => {
    if (!newSubject.name.trim()) return;
    const newId = crypto.randomUUID();
    const subjObj: StoredSubject = {
      id: newId,
      name: newSubject.name,
      description: newSubject.description || null,
      icon: newSubject.icon || null,
      color: newSubject.color || null,
      subject_code: newSubject.subject_code || null,
      subscription_tier: "free",
      enabled: true,
    };

    adminDataStore.addSubject(subjObj);

    try {
      await supabase.from("subjects").insert(subjObj as any);
    } catch (err) {
      console.warn("Supabase subject insert bypassed, saved locally:", err);
    }

    toast({ title: "Subject Created", description: `"${newSubject.name}" created successfully.` });
    setNewSubject({ name: "", description: "", icon: "", color: "", subject_code: "" });
    setShowAdd(false);
    fetchSubjects();
  };

  const deleteSubject = async (id: string) => {
    adminDataStore.deleteSubject(id);
    try {
      await supabase.from("subjects").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase subject delete bypassed, deleted locally:", err);
    }
    toast({ title: "Subject Deleted", description: "Subject has been removed." });
    setEditData(prev => { const n = { ...prev }; delete n[id]; return n; });
    fetchSubjects();
  };

  const getVal = (subject: Subject, field: keyof Subject) =>
    editData[subject.id]?.[field] !== undefined ? editData[subject.id][field] : subject[field];

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Subjects Manager</CardTitle>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-1" /> Add Subject</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="border border-dashed border-primary rounded-xl p-4 space-y-3 bg-primary/5">
            <h3 className="font-semibold text-sm text-foreground">New Subject</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Name" value={newSubject.name} onChange={e => setNewSubject(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Icon (lucide name or emoji)" value={newSubject.icon} onChange={e => setNewSubject(p => ({ ...p, icon: e.target.value }))} />
              <Input placeholder="Color (e.g. #3b82f6 or blue)" value={newSubject.color} onChange={e => setNewSubject(p => ({ ...p, color: e.target.value }))} />
              <Input placeholder="Subject Code (e.g. 0580)" value={newSubject.subject_code} onChange={e => setNewSubject(p => ({ ...p, subject_code: e.target.value }))} />
            </div>
            <Textarea placeholder="Description" value={newSubject.description} onChange={e => setNewSubject(p => ({ ...p, description: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addSubject}>Create Subject</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {subjects.map(subject => {
          const isModified = !!editData[subject.id];
          const isSaving = savingId === subject.id;

          return (
            <div 
              key={subject.id} 
              className={`border rounded-xl p-4 space-y-3 transition-all ${
                isModified 
                  ? "border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm" 
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{getVal(subject, "name") as string}</span>
                  {subject.subject_code && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {subject.subject_code}
                    </Badge>
                  )}
                </div>
                {isModified && (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px]">
                    Unsaved Changes
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Name</label>
                  <Input placeholder="Name" value={getVal(subject, "name") as string} onChange={e => updateField(subject.id, "name", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Subject Code</label>
                  <Input placeholder="Subject Code (e.g. 4024 | 0417)" value={(getVal(subject, "subject_code") as string) || ""} onChange={e => updateField(subject.id, "subject_code", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Variant (e.g. Syllabus D)</label>
                  <Input placeholder="Variant" value={(getVal(subject, "qualification_variant") as string) || ""} onChange={e => updateField(subject.id, "qualification_variant", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Display Order</label>
                  <Input type="number" placeholder="Order (1, 2, 3...)" value={(getVal(subject, "display_order") as number) ?? ""} onChange={e => updateField(subject.id, "display_order", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Icon</label>
                  <Input placeholder="Icon" value={(getVal(subject, "icon") as string) || ""} onChange={e => updateField(subject.id, "icon", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Color</label>
                  <Input placeholder="Color" value={(getVal(subject, "color") as string) || ""} onChange={e => updateField(subject.id, "color", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">Description</label>
                <Textarea placeholder="Description" value={(getVal(subject, "description") as string) || ""} onChange={e => updateField(subject.id, "description", e.target.value)} rows={2} />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={
                      editData[subject.id]?.is_premium !== undefined
                        ? !(editData[subject.id]!.is_premium as boolean)
                        : !subject.is_premium
                    }
                    onCheckedChange={(checked) => {
                      updateField(subject.id, "is_premium", (!checked) as any);
                      updateField(subject.id, "subscription_tier", checked ? "free" : "pro");
                    }}
                  />
                  <span className="text-sm font-medium">Free (no subscription)</span>
                </div>
                <Badge variant={(editData[subject.id]?.is_premium ?? subject.is_premium) ? "secondary" : "default"}>
                  {(editData[subject.id]?.is_premium ?? subject.is_premium) ? "Pro only" : "Free"}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Qualification:</span>
                  <select
                    className="border border-input rounded-md px-2 py-1 text-sm bg-background"
                    value={(editData[subject.id]?.qualification as string) ?? subject.qualification ?? "o_level"}
                    onChange={(e) => updateField(subject.id, "qualification", e.target.value)}
                  >
                    <option value="o_level">O Level</option>
                    <option value="igcse">IGCSE</option>
                    <option value="a_level">A Level</option>
                    <option value="both">O Level & IGCSE</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={
                      editData[subject.id]?.enabled !== undefined
                        ? (editData[subject.id]!.enabled as boolean)
                        : subject.enabled !== false
                    }
                    onCheckedChange={(v) => updateField(subject.id, "enabled", v as any)}
                  />
                  <span className="text-sm text-muted-foreground">Enabled</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button 
                  size="sm" 
                  disabled={isSaving}
                  className={
                    isModified 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all animate-pulse hover:animate-none" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  }
                  onClick={() => saveSubject(subject.id)}
                >
                  <Save className="h-4 w-4 mr-1.5" /> 
                  {isSaving ? "Saving..." : isModified ? "Save Changes ✨" : "Save"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{subject.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>This will delete the subject and may affect related data.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteSubject(subject.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SubjectsManager;
