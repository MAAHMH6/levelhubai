import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Subject { id: string; name: string }

export default function CurriculumEditDialog({
  document,
  subjects,
  open,
  onOpenChange,
  onSuccess
}: {
  document: any;
  subjects: Subject[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  
  const [docType, setDocType] = useState("syllabus");
  const [subjectId, setSubjectId] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [provider, setProvider] = useState("");
  const [examBoard, setExamBoard] = useState("");
  const [edition, setEdition] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [year, setYear] = useState("");
  const [paperNumber, setPaperNumber] = useState("");
  
  const [permissionStatus, setPermissionStatus] = useState("fully_licensed");
  const [allowedExternalAi, setAllowedExternalAi] = useState(true);
  const [allowedQuizGen, setAllowedQuizGen] = useState(true);
  const [allowedViewOriginal, setAllowedViewOriginal] = useState(true);

  useEffect(() => {
    if (document) {
      setDocType(document.doc_type || "syllabus");
      setSubjectId(document.subject_id || "");
      setSourceName(document.source_name || "");
      setProvider(document.provider || "");
      setExamBoard(document.exam_board || "");
      setEdition(document.edition || "");
      setSubjectCode(document.subject_code || "");
      setYear(document.year?.toString() || "");
      setPaperNumber(document.paper_number?.toString() || "");
      
      setPermissionStatus(document.permission_status || "fully_licensed");
      setAllowedExternalAi(document.allowed_external_ai ?? true);
      setAllowedQuizGen(document.allowed_quiz_generation ?? true);
      setAllowedViewOriginal(document.allowed_student_view ?? true);
    }
  }, [document]);

  useEffect(() => {
    if (docType === "past_paper") {
      setPermissionStatus("restricted");
      setAllowedExternalAi(false);
      setAllowedQuizGen(false);
      setAllowedViewOriginal(false);
    }
  }, [docType]);

  const handleSave = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("curriculum_documents").update({
        doc_type: docType,
        subject_id: subjectId || null,
        source_name: sourceName,
        provider: provider || null,
        exam_board: examBoard || null,
        edition: edition || null,
        subject_code: subjectCode || null,
        year: year ? parseInt(year) : null,
        paper_number: paperNumber ? parseInt(paperNumber) : null,
        permission_status: permissionStatus,
        allowed_external_ai: allowedExternalAi,
        allowed_quiz_generation: allowedQuizGen,
        allowed_student_view: allowedViewOriginal
      }).eq("id", document.id);
      
      if (error) throw error;
      toast({ title: "Updated", description: "Document properties saved." });
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document Properties</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="syllabus">Syllabus</SelectItem>
                <SelectItem value="curriculum">Curriculum</SelectItem>
                <SelectItem value="past_paper">Past Paper</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 md:col-span-2">
            <Label>Curriculum Provider or Book Name</Label>
            <Input value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. Cambridge / Oxford" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Source / Document name</Label>
            <Input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder="e.g. Mathematics 0580 syllabus" />
          </div>
          
          <div className="space-y-1">
            <Label>Exam Board</Label>
            <Input value={examBoard} onChange={e => setExamBoard(e.target.value)} placeholder="e.g. CAIE, Edexcel" />
          </div>
          
          <div className="space-y-1">
            <Label>Edition / Year</Label>
            <Input value={edition} onChange={e => setEdition(e.target.value)} placeholder="e.g. 2023-2025" />
          </div>

          <div className="space-y-1">
            <Label>Subject Code</Label>
            <Input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. 0580" />
          </div>

          {docType === "past_paper" && (
            <>
              <div className="space-y-1">
                <Label>Paper Year (e.g. 2023)</Label>
                <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Paper Number (e.g. 1)</Label>
                <Input type="number" value={paperNumber} onChange={e => setPaperNumber(e.target.value)} />
              </div>
            </>
          )}

          <div className="md:col-span-2 p-4 rounded-lg border bg-muted/30 space-y-4">
            <h4 className="font-semibold text-sm">Content Rights & Provenance</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Permission Status</Label>
                <Select value={permissionStatus} onValueChange={setPermissionStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully_licensed">Fully Licensed / Owned</SelectItem>
                    <SelectItem value="fair_use">Fair Use (Educational)</SelectItem>
                    <SelectItem value="restricted">Restricted (Copyrighted)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch checked={allowedExternalAi} onCheckedChange={setAllowedExternalAi} id="edit-external-ai" />
                <Label htmlFor="edit-external-ai" className="font-normal cursor-pointer">Allow External AI APIs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={allowedQuizGen} onCheckedChange={setAllowedQuizGen} id="edit-quiz-gen" />
                <Label htmlFor="edit-quiz-gen" className="font-normal cursor-pointer">Allow Quiz Generation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={allowedViewOriginal} onCheckedChange={setAllowedViewOriginal} id="edit-view-orig" />
                <Label htmlFor="edit-view-orig" className="font-normal cursor-pointer">Allow Viewing Original PDF</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
