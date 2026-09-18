import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, FileQuestion, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subject { id: string; name: string; }
interface PaperQuestion { question: string; answer: string; marks?: number; topic?: string; }
interface PastPaper {
  id: string; subject_id: string; year: number; session: string; paper_number: number;
  variant: number | null; exam_board: string; total_marks: number | null;
  duration_minutes: number | null; pdf_url: string | null; marking_scheme_url: string | null; xp_reward: number;
  is_proprietary: boolean; external_url: string | null;
  questions_data?: PaperQuestion[];
}

const PastPapersManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [editData, setEditData] = useState<Record<string, Partial<PastPaper>>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [questionsEdit, setQuestionsEdit] = useState<Record<string, PaperQuestion[]>>({});
  const [newPaper, setNewPaper] = useState({ year: 2024, session: "May/June", paper_number: 1, variant: 1, exam_board: "CAIE", total_marks: 40, duration_minutes: 60, pdf_url: "", marking_scheme_url: "", xp_reward: 250, external_url: "", is_proprietary: true });

  useEffect(() => {
    supabase.from("subjects").select("id, name").order("name").then(({ data }) => { if (data) setSubjects(data); });
  }, []);

  const fetchPapers = async () => {
    if (!selectedSubject) return;
    const { data } = await supabase.from("past_papers").select("*").eq("subject_id", selectedSubject).order("year", { ascending: false });
    if (data) setPapers(data as any);
  };

  useEffect(() => { fetchPapers(); }, [selectedSubject]);

  const updateField = (id: string, field: string, value: any) => setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const savePaper = async (id: string) => {
    const changes = { ...editData[id] };
    const qChanges = questionsEdit[id];
    if (qChanges) (changes as any).questions_data = qChanges;
    
    if (!changes || Object.keys(changes).length === 0) return;
    const { error } = await supabase.from("past_papers").update(changes as any).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { 
      toast({ title: "Saved" }); 
      setEditData(prev => { const n = { ...prev }; delete n[id]; return n; }); 
      setQuestionsEdit(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchPapers(); 
    }
  };

  const addPaper = async () => {
    if (!selectedSubject) return;
    const { error } = await supabase.from("past_papers").insert({
      ...newPaper, subject_id: selectedSubject,
      pdf_url: newPaper.pdf_url || null, marking_scheme_url: newPaper.marking_scheme_url || null,
      external_url: newPaper.external_url || null,
    } as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Added" }); setShowAdd(false); fetchPapers(); }
  };

  const deletePaper = async (id: string) => {
    const { error } = await supabase.from("past_papers").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchPapers(); }
  };

  const getVal = (paper: PastPaper, field: keyof PastPaper) =>
    editData[paper.id]?.[field] !== undefined ? editData[paper.id][field] : paper[field];

  const getQuestions = (paper: PastPaper): PaperQuestion[] => {
    if (questionsEdit[paper.id]) return questionsEdit[paper.id];
    const qd = paper.questions_data;
    return Array.isArray(qd) ? qd : [];
  };

  const updateQuestion = (paperId: string, index: number, field: keyof PaperQuestion, value: string | number) => {
    const current = getQuestions(papers.find(p => p.id === paperId)!);
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setQuestionsEdit(prev => ({ ...prev, [paperId]: updated }));
  };

  const addQuestion = (paperId: string) => {
    const current = getQuestions(papers.find(p => p.id === paperId)!);
    setQuestionsEdit(prev => ({ ...prev, [paperId]: [...current, { question: "", answer: "", marks: 1, topic: "" }] }));
  };

  const removeQuestion = (paperId: string, index: number) => {
    const current = getQuestions(papers.find(p => p.id === paperId)!);
    setQuestionsEdit(prev => ({ ...prev, [paperId]: current.filter((_, i) => i !== index) }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary" /> Past Papers Manager</CardTitle>
        {selectedSubject && <Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-1" /> Add Paper</Button>}
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
            <h3 className="font-semibold text-sm text-foreground">New Past Paper</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input type="number" placeholder="Year" value={newPaper.year} onChange={e => setNewPaper(p => ({ ...p, year: parseInt(e.target.value) || 2024 }))} />
              <Input placeholder="Session" value={newPaper.session} onChange={e => setNewPaper(p => ({ ...p, session: e.target.value }))} />
              <Input type="number" placeholder="Paper #" value={newPaper.paper_number} onChange={e => setNewPaper(p => ({ ...p, paper_number: parseInt(e.target.value) || 1 }))} />
              <Input type="number" placeholder="Variant" value={newPaper.variant} onChange={e => setNewPaper(p => ({ ...p, variant: parseInt(e.target.value) || 1 }))} />
              <Input placeholder="Exam Board" value={newPaper.exam_board} onChange={e => setNewPaper(p => ({ ...p, exam_board: e.target.value }))} />
              <Input type="number" placeholder="Total Marks" value={newPaper.total_marks} onChange={e => setNewPaper(p => ({ ...p, total_marks: parseInt(e.target.value) || 40 }))} />
              <Input type="number" placeholder="Duration (min)" value={newPaper.duration_minutes} onChange={e => setNewPaper(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} />
              <Input type="number" placeholder="XP Reward" value={newPaper.xp_reward} onChange={e => setNewPaper(p => ({ ...p, xp_reward: parseInt(e.target.value) || 250 }))} />
            </div>
            <Input placeholder="PDF URL" value={newPaper.pdf_url} onChange={e => setNewPaper(p => ({ ...p, pdf_url: e.target.value }))} />
            <Input placeholder="Marking Scheme URL" value={newPaper.marking_scheme_url} onChange={e => setNewPaper(p => ({ ...p, marking_scheme_url: e.target.value }))} />
            <Input placeholder="Official External URL (for proprietary papers)" value={newPaper.external_url} onChange={e => setNewPaper(p => ({ ...p, external_url: e.target.value }))} />
            <div className="flex items-center space-x-2 py-2">
              <Switch checked={newPaper.is_proprietary} onCheckedChange={checked => setNewPaper(p => ({ ...p, is_proprietary: checked }))} id="new-proprietary" />
              <Label htmlFor="new-proprietary" className="text-sm font-medium">Is Proprietary (Copyrighted)</Label>
            </div>
            <Button size="sm" onClick={addPaper}>Create Paper</Button>
          </div>
        )}

        {papers.map(paper => {
          const isExpanded = expandedPaper === paper.id;
          const questions = getQuestions(paper);
          const hasChanges = !!editData[paper.id] || !!questionsEdit[paper.id];

          return (
            <div key={paper.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input type="number" placeholder="Year" value={getVal(paper, "year") as number} onChange={e => updateField(paper.id, "year", parseInt(e.target.value) || 2024)} />
                <Input placeholder="Session" value={(getVal(paper, "session") as string) || ""} onChange={e => updateField(paper.id, "session", e.target.value)} />
                <Input type="number" placeholder="Paper #" value={getVal(paper, "paper_number") as number} onChange={e => updateField(paper.id, "paper_number", parseInt(e.target.value) || 1)} />
                <Input type="number" placeholder="Variant" value={(getVal(paper, "variant") as number) || ""} onChange={e => updateField(paper.id, "variant", parseInt(e.target.value) || null)} />
                <Input placeholder="Exam Board" value={(getVal(paper, "exam_board") as string) || ""} onChange={e => updateField(paper.id, "exam_board", e.target.value)} />
                <Input type="number" placeholder="Total Marks" value={(getVal(paper, "total_marks") as number) || ""} onChange={e => updateField(paper.id, "total_marks", parseInt(e.target.value) || null)} />
                <Input type="number" placeholder="Duration" value={(getVal(paper, "duration_minutes") as number) || ""} onChange={e => updateField(paper.id, "duration_minutes", parseInt(e.target.value) || null)} />
                <Input type="number" placeholder="XP" value={getVal(paper, "xp_reward") as number} onChange={e => updateField(paper.id, "xp_reward", parseInt(e.target.value) || 250)} />
              </div>
              <Input placeholder="PDF URL" value={(getVal(paper, "pdf_url") as string) || ""} onChange={e => updateField(paper.id, "pdf_url", e.target.value)} />
              <Input placeholder="Marking Scheme URL" value={(getVal(paper, "marking_scheme_url") as string) || ""} onChange={e => updateField(paper.id, "marking_scheme_url", e.target.value)} />
              <Input placeholder="Official External URL (for proprietary papers)" value={(getVal(paper, "external_url") as string) || ""} onChange={e => updateField(paper.id, "external_url", e.target.value)} />
              <div className="flex items-center space-x-2 py-1">
                <Switch checked={getVal(paper, "is_proprietary") as boolean} onCheckedChange={checked => updateField(paper.id, "is_proprietary", checked)} id={`prop-${paper.id}`} />
                <Label htmlFor={`prop-${paper.id}`} className="text-sm font-medium">Is Proprietary (Copyrighted)</Label>
              </div>
              
              {/* Questions section */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between"
                onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
              >
                <span>Questions ({questions.length})</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {isExpanded && (
                <div className="space-y-3 border-t pt-3">
                  {questions.map((q, qi) => (
                    <div key={qi} className="border border-dashed border-border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Q{qi + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestion(paper.id, qi)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <Textarea 
                        placeholder="Question text..." 
                        value={q.question} 
                        onChange={e => updateQuestion(paper.id, qi, "question", e.target.value)}
                        rows={2}
                      />
                      <Textarea 
                        placeholder="Answer..." 
                        value={q.answer} 
                        onChange={e => updateQuestion(paper.id, qi, "answer", e.target.value)}
                        rows={2}
                        className="border-green-200 dark:border-green-800"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          type="number" 
                          placeholder="Marks" 
                          value={q.marks || ""} 
                          onChange={e => updateQuestion(paper.id, qi, "marks", parseInt(e.target.value) || 1)}
                        />
                        <Input 
                          placeholder="Topic" 
                          value={q.topic || ""} 
                          onChange={e => updateQuestion(paper.id, qi, "topic", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addQuestion(paper.id)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Question
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                {hasChanges && <Button size="sm" onClick={() => savePaper(paper.id)}><Save className="h-4 w-4 mr-1" /> Save</Button>}
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete this paper?</AlertDialogTitle><AlertDialogDescription>{paper.year} {paper.session} Paper {paper.paper_number}</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePaper(paper.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
        {selectedSubject && papers.length === 0 && <p className="text-sm text-muted-foreground">No past papers found.</p>}
      </CardContent>
    </Card>
  );
};

export default PastPapersManager;
