import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Tags } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subject { id: string; name: string; }
interface Topic { id: string; name: string; order_index: number; subject_id: string; }

const TopicsManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editData, setEditData] = useState<Record<string, Partial<Topic>>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: "", order_index: 0 });

  useEffect(() => {
    supabase.from("subjects").select("id, name").order("name").then(({ data }) => { if (data) setSubjects(data); });
  }, []);

  const fetchTopics = async () => {
    if (!selectedSubject) return;
    const { data } = await supabase.from("topics").select("*").eq("subject_id", selectedSubject).order("order_index");
    if (data) setTopics(data);
  };

  useEffect(() => { fetchTopics(); }, [selectedSubject]);

  const updateField = (id: string, field: string, value: any) => setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const saveTopic = async (id: string) => {
    const changes = editData[id];
    if (!changes) return;
    const { error } = await supabase.from("topics").update(changes as any).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); setEditData(prev => { const n = { ...prev }; delete n[id]; return n; }); fetchTopics(); }
  };

  const addTopic = async () => {
    if (!newTopic.name.trim() || !selectedSubject) return;
    const { error } = await supabase.from("topics").insert({ name: newTopic.name, order_index: newTopic.order_index, subject_id: selectedSubject } as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Added" }); setNewTopic({ name: "", order_index: topics.length + 1 }); setShowAdd(false); fetchTopics(); }
  };

  const deleteTopic = async (id: string) => {
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchTopics(); }
  };

  const getVal = (topic: Topic, field: keyof Topic) =>
    editData[topic.id]?.[field] !== undefined ? editData[topic.id][field] : topic[field];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary" /> Topics Manager</CardTitle>
        {selectedSubject && <Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-1" /> Add Topic</Button>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger><SelectValue placeholder="Select subject..." /></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {showAdd && (
          <div className="border border-dashed border-primary rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Topic Name" value={newTopic.name} onChange={e => setNewTopic(p => ({ ...p, name: e.target.value }))} />
              <Input type="number" placeholder="Order Index" value={newTopic.order_index} onChange={e => setNewTopic(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} />
            </div>
            <Button size="sm" onClick={addTopic}>Create Topic</Button>
          </div>
        )}

        {topics.map(topic => (
          <div key={topic.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <Input placeholder="Name" value={(getVal(topic, "name") as string) || ""} onChange={e => updateField(topic.id, "name", e.target.value)} />
              <Input type="number" placeholder="Order" value={getVal(topic, "order_index") as number} onChange={e => updateField(topic.id, "order_index", parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex gap-2">
              {editData[topic.id] && <Button size="sm" onClick={() => saveTopic(topic.id)}><Save className="h-4 w-4 mr-1" /> Save</Button>}
              <AlertDialog>
                <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Delete "{topic.name}"?</AlertDialogTitle><AlertDialogDescription>This may affect quiz questions linked to this topic.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteTopic(topic.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        {selectedSubject && topics.length === 0 && <p className="text-sm text-muted-foreground">No topics found.</p>}
      </CardContent>
    </Card>
  );
};

export default TopicsManager;
