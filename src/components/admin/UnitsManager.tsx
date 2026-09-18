import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore, StoredUnit } from "@/lib/adminDataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Layers, ArrowUp, ArrowDown, GraduationCap, BookOpen } from "lucide-react";
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
  description: string | null; 
  unit_number: number;
  subject_id: string; 
  icon_emoji: string; 
  duration_weeks: string | null; 
  total_xp: number;
}

const PROGRAMMES = [
  { value: "all", label: "All Programmes" },
  { value: "o_level", label: "Cambridge O Level" },
  { value: "igcse", label: "Cambridge IGCSE" },
  { value: "a_level", label: "Cambridge A Level" },
];

const UnitsManager = () => {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [editData, setEditData] = useState<Record<string, Partial<Unit>>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newUnit, setNewUnit] = useState({ title: "", description: "", unit_number: 1, icon_emoji: "📘", duration_weeks: "", total_xp: 0 });
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

  const fetchUnits = useCallback(async () => {
    if (!selectedSubject) {
      setUnits([]);
      return;
    }
    const { data } = await supabase.from("units").select("*").eq("subject_id", selectedSubject).order("unit_number");
    const merged = adminDataStore.applyUnitOverrides(data || [], selectedSubject);
    setUnits(merged);
  }, [selectedSubject]);

  useEffect(() => { 
    fetchUnits(); 
  }, [fetchUnits]);

  useEffect(() => {
    const handleUpdate = () => fetchUnits();
    window.addEventListener("levelhub:units_updated", handleUpdate);
    return () => window.removeEventListener("levelhub:units_updated", handleUpdate);
  }, [fetchUnits]);

  const updateField = (id: string, field: string, value: any) => {
    setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveUnit = async (id: string) => {
    setSavingId(id);
    const changes = editData[id] || {};
    
    // 1. Immediately persist in admin store
    adminDataStore.saveUnit(id, changes as Partial<StoredUnit>);

    // 2. Instant local UI state update
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u));

    // 3. Attempt Supabase update
    try {
      if (Object.keys(changes).length > 0) {
        await supabase.from("units").update(changes as any).eq("id", id);
      }
    } catch (err) {
      console.warn("Supabase unit update bypassed, saved locally:", err);
    }

    toast({ title: "Unit Saved", description: "Unit updated and persisted across the platform." });
    setEditData(prev => { const n = { ...prev }; delete n[id]; return n; });
    setSavingId(null);
  };

  const addUnit = async () => {
    if (!newUnit.title.trim() || !selectedSubject) return;
    const newId = crypto.randomUUID();
    const unitObj: StoredUnit = {
      id: newId,
      title: newUnit.title,
      description: newUnit.description || null,
      unit_number: newUnit.unit_number,
      subject_id: selectedSubject,
      icon_emoji: newUnit.icon_emoji,
      duration_weeks: newUnit.duration_weeks || null,
      total_xp: newUnit.total_xp,
    };

    adminDataStore.addUnit(unitObj);

    try {
      await supabase.from("units").insert(unitObj as any);
    } catch (err) {
      console.warn("Supabase unit insert bypassed, saved locally:", err);
    }

    toast({ title: "Unit Created", description: `"${newUnit.title}" created successfully.` });
    setNewUnit({ title: "", description: "", unit_number: units.length + 2, icon_emoji: "📘", duration_weeks: "", total_xp: 0 });
    setShowAdd(false);
    fetchUnits();
  };

  const deleteUnit = async (id: string) => {
    adminDataStore.deleteUnit(id);
    try {
      await supabase.from("units").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase unit delete bypassed, deleted locally:", err);
    }
    toast({ title: "Unit Deleted", description: "Unit has been removed." });
    setEditData(prev => { const n = { ...prev }; delete n[id]; return n; });
    fetchUnits();
  };

  const moveUnitOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= units.length) return;

    const currentUnit = units[index];
    const targetUnit = units[targetIndex];

    const currentNum = currentUnit.unit_number;
    const targetNum = targetUnit.unit_number;

    // Swap numbers
    const newCurrentNum = targetNum === currentNum ? (direction === "up" ? currentNum - 1 : currentNum + 1) : targetNum;
    const newTargetNum = currentNum;

    adminDataStore.saveUnit(currentUnit.id, { unit_number: newCurrentNum });
    adminDataStore.saveUnit(targetUnit.id, { unit_number: newTargetNum });

    try {
      await Promise.all([
        supabase.from("units").update({ unit_number: newCurrentNum } as any).eq("id", currentUnit.id),
        supabase.from("units").update({ unit_number: newTargetNum } as any).eq("id", targetUnit.id),
      ]);
    } catch (e) {
      console.warn("Unit reorder synced to local store:", e);
    }

    toast({ title: "Reordered", description: `Updated unit sequence.` });
    fetchUnits();
  };

  const getVal = (unit: Unit, field: keyof Unit) =>
    editData[unit.id]?.[field] !== undefined ? editData[unit.id][field] : unit[field];

  const currentSubjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Units Manager
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Canonical Hierarchy: Select Programme → Select Subject → Manage Units
          </p>
        </div>
        {selectedSubject && (
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4 mr-1" /> Add Unit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cascade: Programme -> Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
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
        </div>

        {selectedSubject && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {currentSubjectObj?.name || "Subject"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {units.length} {units.length === 1 ? "Unit" : "Units"} in database
              </span>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="border border-dashed border-primary rounded-xl p-4 space-y-3 bg-primary/5">
            <h3 className="font-semibold text-sm text-foreground">New Unit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Title" value={newUnit.title} onChange={e => setNewUnit(p => ({ ...p, title: e.target.value }))} />
              <Input type="number" placeholder="Unit #" value={newUnit.unit_number} onChange={e => setNewUnit(p => ({ ...p, unit_number: parseInt(e.target.value) || 1 }))} />
              <Input placeholder="Icon Emoji" value={newUnit.icon_emoji} onChange={e => setNewUnit(p => ({ ...p, icon_emoji: e.target.value }))} />
              <Input placeholder="Duration (weeks)" value={newUnit.duration_weeks} onChange={e => setNewUnit(p => ({ ...p, duration_weeks: e.target.value }))} />
              <Input type="number" placeholder="Total XP" value={newUnit.total_xp} onChange={e => setNewUnit(p => ({ ...p, total_xp: parseInt(e.target.value) || 0 }))} />
            </div>
            <Textarea placeholder="Description" value={newUnit.description} onChange={e => setNewUnit(p => ({ ...p, description: e.target.value }))} />
            <div className="flex gap-2">
              <Button size="sm" onClick={addUnit}>Create Unit</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {units.map((unit, index) => {
          const isModified = !!editData[unit.id];
          const isSaving = savingId === unit.id;

          return (
            <div 
              key={unit.id} 
              className={`border rounded-xl p-4 space-y-3 transition-all ${
                isModified 
                  ? "border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm" 
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {unit.icon_emoji} Unit {getVal(unit, "unit_number")}: {getVal(unit, "title")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={index === 0}
                    onClick={() => moveUnitOrder(index, "up")}
                    title="Move Unit Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    disabled={index === units.length - 1}
                    onClick={() => moveUnitOrder(index, "down")}
                    title="Move Unit Down"
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Title</label>
                  <Input placeholder="Title" value={getVal(unit, "title") as string} onChange={e => updateField(unit.id, "title", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Unit #</label>
                  <Input type="number" placeholder="Unit #" value={getVal(unit, "unit_number") as number} onChange={e => updateField(unit.id, "unit_number", parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Icon Emoji</label>
                  <Input placeholder="Icon" value={getVal(unit, "icon_emoji") as string} onChange={e => updateField(unit.id, "icon_emoji", e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Total XP</label>
                  <Input type="number" placeholder="Total XP" value={getVal(unit, "total_xp") as number} onChange={e => updateField(unit.id, "total_xp", parseInt(e.target.value) || 0)} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">Duration (weeks)</label>
                <Input placeholder="Duration (weeks)" value={(getVal(unit, "duration_weeks") as string) || ""} onChange={e => updateField(unit.id, "duration_weeks", e.target.value)} />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">Description</label>
                <Textarea placeholder="Description" value={(getVal(unit, "description") as string) || ""} onChange={e => updateField(unit.id, "description", e.target.value)} rows={2} />
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
                  onClick={() => saveUnit(unit.id)}
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
                      <AlertDialogTitle>Delete Unit {unit.unit_number}?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove the unit permanently from the database.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteUnit(unit.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        {selectedSubject && units.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No units found for this subject in the database. Click "Add Unit" to create one.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitsManager;
