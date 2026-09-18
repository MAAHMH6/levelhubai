import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Trash2, UploadCloud, Sparkles, FolderTree, ShieldAlert, GitMerge, Pencil, Download } from "lucide-react";
import CurriculumHierarchyDialog from "./CurriculumHierarchyDialog";
import CurriculumMappingDialog from "./CurriculumMappingDialog";
import CurriculumEditDialog from "./CurriculumEditDialog";

interface Subject { 
  id: string; 
  name: string; 
  qualification?: string | null;
  subject_code?: string | null;
}
interface Doc {
  id: string;
  source_name: string;
  doc_type: string;
  subject_id: string | null;
  year: number | null;
  paper_number: number | null;
  total_chunks: number;
  total_pages: number | null;
  index_status: string;
  index_error: string | null;
  provider?: string | null;
  exam_board?: string | null;
  edition?: string | null;
  subject_code?: string | null;
  created_at: string;
  content_type: string;
  permission_status: string;
  allowed_external_ai: boolean;
  allowed_quiz_generation: boolean;
  allowed_student_view: boolean;
  structured_index?: any;
}

const DOC_TYPES = [
  { value: "syllabus", label: "Syllabus" },
  { value: "curriculum", label: "Curriculum" },
  { value: "past_paper", label: "Past Paper" },
  { value: "notes", label: "Notes" },
];

export default function CurriculumLibraryManager() {
  const [selectedProgramme, setSelectedProgramme] = useState<string>("o_level");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState<string>("");
  const [docType, setDocType] = useState("syllabus");
  const [year, setYear] = useState("");
  const [paperNumber, setPaperNumber] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [provider, setProvider] = useState("");
  const [examBoard, setExamBoard] = useState("");
  const [edition, setEdition] = useState("");

  const [contentType, setContentType] = useState("syllabus");
  const [permissionStatus, setPermissionStatus] = useState("fully_licensed");
  const [allowedExternalAi, setAllowedExternalAi] = useState(true);
  const [allowedQuizGen, setAllowedQuizGen] = useState(true);
  const [allowedViewOriginal, setAllowedViewOriginal] = useState(true);

  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");
  const [filterDocType, setFilterDocType] = useState<string>("all");

  const [hierarchySubjectId, setHierarchySubjectId] = useState<string>("");
  const [hierarchySubjectName, setHierarchySubjectName] = useState<string>("");
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const [mappingDoc, setMappingDoc] = useState<{ id: string, subject_id: string } | null>(null);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);

  // Filter subjects by selected programme
  const filteredSubjects = subjects.filter(s => {
    if (selectedProgramme === "all") return true;
    const q = (s.qualification || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (selectedProgramme === "o_level") return q.includes("o_level") || q.includes("olevel") || !q;
    if (selectedProgramme === "igcse") return q.includes("igcse");
    if (selectedProgramme === "a_level") return q.includes("a_level") || q.includes("alevel") || q.includes("as_level");
    return true;
  });

  // Auto-fill subject code when subject is chosen
  useEffect(() => {
    if (subjectId) {
      const cur = subjects.find(s => s.id === subjectId);
      if (cur?.subject_code) {
        setSubjectCode(cur.subject_code);
      }
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    if (docType === "past_paper") {
      setContentType("past_paper");
      setPermissionStatus("restricted");
      setAllowedExternalAi(false);
      setAllowedQuizGen(false);
      setAllowedViewOriginal(false);
    } else {
      setContentType(docType);
      setPermissionStatus("fully_licensed");
      setAllowedExternalAi(true);
      setAllowedQuizGen(true);
      setAllowedViewOriginal(true);
    }
  }, [docType]);

  const load = async () => {
    setLoading(true);
    const [{ data: subs }, { data: ds }] = await Promise.all([
      supabase.from("subjects").select("id, name, qualification, subject_code").order("name"),
      supabase.from("curriculum_documents").select("*").order("created_at", { ascending: false }),
    ]);
    setSubjects((subs as Subject[]) || []);
    setDocs((ds as Doc[]) || []);
    
    // Fetch latest logs for processing docs
    const processingIds = ((ds as Doc[]) || []).filter(d => d.index_status === "processing").map(d => d.id);
    if (processingIds.length > 0) {
      const { data: latestLogs } = await supabase
        .from("index_job_logs")
        .select("document_id, message, step, status")
        .in("document_id", processingIds)
        .order("created_at", { ascending: false });
        
      if (latestLogs) {
        const logsMap: Record<string, any> = {};
        latestLogs.forEach(log => {
          if (!logsMap[log.document_id]) logsMap[log.document_id] = log;
        });
        setLogs(logsMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const channel = supabase.channel("job_logs_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "index_job_logs" }, (payload) => {
        const newLog = payload.new;
        setLogs(prev => ({ ...prev, [newLog.document_id]: newLog }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpload = async () => {
    if (!file || !subjectId || !sourceName) {
      toast({ title: "Missing fields", description: "Pick a subject, name, and PDF.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${subjectId}/${Date.now()}-${sanitizedName}`;
      const detectedType = file.name.endsWith(".md") ? "text/markdown" : (file.type || "application/pdf");
      const { error: upErr } = await supabase.storage.from("curriculum-docs").upload(path, file, {
        contentType: detectedType,
      });
      if (upErr) throw upErr;

      const { data: doc, error: insErr } = await supabase
        .from("curriculum_documents")
        .insert({
          subject_id: subjectId,
          doc_type: docType,
          source_name: sourceName,
          year: year ? Number(year) : null,
          paper_number: paperNumber ? Number(paperNumber) : null,
          subject_code: subjectCode || null,
          provider: provider || null,
          exam_board: examBoard || null,
          edition: edition || null,
          storage_path: path,
          content_type: contentType,
          permission_status: permissionStatus,
          allowed_external_ai: allowedExternalAi,
          allowed_quiz_generation: allowedQuizGen,
          allowed_student_view: allowedViewOriginal,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      toast({ title: "Uploaded", description: "Indexing started…" });

      await runIndexing(doc.id);

      setFile(null); setSourceName(""); setYear(""); setPaperNumber("");
      setSubjectCode(""); setProvider(""); setExamBoard(""); setEdition("");
      await load();
      toast({ title: "Indexed", description: "Document is now searchable." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const runIndexing = async (id: string) => {
    toast({ title: "Extracting Structure", description: "Generating syllabus outline (this may take up to 30 seconds)...", duration: 10000 });
    try {
      const { data: extractData, error: extractErr } = await supabase.functions.invoke("index-curriculum-doc", {
        body: { document_id: id, action: "extract_structure" },
      });
      if (extractErr) throw extractErr;
      if (extractData && extractData.status === "requires_mapping") {
         toast({ title: "Requires Mapping", description: "Syllabus requires manual mapping.", variant: "destructive" });
         load();
         return;
      }
      if (extractData && extractData.ok === false) {
        throw new Error(extractData.error || "Failed to extract structure");
      }

    const totalPages = extractData.total_pages || 1;
    const batchSize = 5;

    for (let i = 1; i <= totalPages; i += batchSize) {
      const endPage = Math.min(i + batchSize - 1, totalPages);
      toast({ title: "Embedding Pages", description: `Processing pages ${i} to ${endPage} of ${totalPages}...`, duration: 5000 });
      
      const { data: embedData, error: embedErr } = await supabase.functions.invoke("index-curriculum-doc", {
        body: { document_id: id, action: "embed_pages", start_page: i, end_page: endPage },
      });
      if (embedErr) throw embedErr;
      if (embedData && embedData.ok === false) {
        throw new Error(embedData.error || `Failed embedding pages ${i}-${endPage}`);
      }
    }

    toast({ title: "Finalizing", description: "Updating document statistics..." });
    const { data: finData, error: finErr } = await supabase.functions.invoke("index-curriculum-doc", {
      body: { document_id: id, action: "finalize" },
    });
    if (finErr) throw finErr;
    if (finData && finData.ok === false) {
      throw new Error(finData.error || "Failed to finalize indexing");
    }
    } catch (e: any) {
      await supabase.from("curriculum_documents").update({ index_status: "failed", index_error: e.message || String(e) }).eq("id", id);
      throw e;
    }
  };

  const reindex = async (id: string) => {
    toast({ title: "Re-indexing…" });
    try {
      await runIndexing(id);
      toast({ title: "Done" }); 
      load();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || String(e), variant: "destructive" });
      load(); // ensure UI updates to show failed status
    }
  };

  const generateQuizzes = async (id: string) => {
    const doc = docs.find(d => d.id === id);
    if (!doc || !doc.structured_index) {
      toast({ title: "Failed", description: "Document index not found. Please index first.", variant: "destructive" });
      return;
    }

    const struct = doc.structured_index as any;
    const max_topics = 25;
    const flatTopics: Array<{ unitTitle: string; topic: any }> = [];
    for (const u of (struct.units || [])) {
      if (u.lessons && u.lessons.length > 0) {
        for (const l of u.lessons) {
          if (l.topics && l.topics.length > 0) {
            for (const tp of l.topics) {
              flatTopics.push({ unitTitle: u.title, topic: tp });
              if (flatTopics.length >= max_topics) break;
            }
          } else {
            flatTopics.push({ unitTitle: u.title, topic: { title: l.title } });
          }
          if (flatTopics.length >= max_topics) break;
        }
      }
      if (u.topics && flatTopics.length < max_topics) {
        for (const tp of u.topics) {
          flatTopics.push({ unitTitle: u.title, topic: tp });
          if (flatTopics.length >= max_topics) break;
        }
      }
      if (flatTopics.length >= max_topics) break;
    }

    if (flatTopics.length === 0) {
      toast({ title: "Failed", description: "No topics found in the index.", variant: "destructive" });
      return;
    }

    setGenerating(prev => ({ ...prev, [id]: true }));
    let totalInserted = 0;
    let hasError = false;

    try {
      for (let i = 0; i < flatTopics.length; i++) {
        toast({ title: "Generating quizzes…", description: `Processing topic ${i + 1} of ${flatTopics.length}` });
        const { data, error } = await supabase.functions.invoke("generate-curriculum-quizzes", {
          body: { document_id: id, per_topic: 5, topics_chunk: [flatTopics[i]] },
        });
        
        const errMsg = error?.message || (data as any)?.error;
        if (errMsg) {
          toast({ title: "Failed", description: errMsg, variant: "destructive" });
          hasError = true;
          break;
        }
        
        totalInserted += (data as any)?.inserted ?? 0;
      }
      if (!hasError) {
        toast({ title: "Quizzes generated", description: `${totalInserted} new questions added.` });
      }
    } catch (e: any) {
      toast({ title: "Failed", description: String(e), variant: "destructive" });
    } finally {
      setGenerating(prev => ({ ...prev, [id]: false }));
    }
  };

  const extractBlueprint = async (d: Doc) => {
    if (!d.subject_id) {
      toast({ title: "Failed", description: "Subject is required for this paper.", variant: "destructive" });
      return;
    }
    toast({ title: "Extracting blueprint…", description: "Analyzing past paper structure using AI." });
    
    // storage_path might not be on the type but it's returned by the DB
    const { data: rec } = await supabase.from("curriculum_documents").select("storage_path").eq("id", d.id).maybeSingle();
    if (!rec?.storage_path) {
      toast({ title: "Failed", description: "Storage path not found.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.functions.invoke("extract-mock-exam-blueprint", {
      body: { 
        file_path: rec.storage_path, 
        subject_id: d.subject_id, 
        title: d.source_name 
      },
    });
    
    const errMsg = error?.message || (data as any)?.error;
    if (errMsg) toast({ title: "Failed", description: errMsg, variant: "destructive" });
    else toast({ title: "Blueprint Extracted", description: "Saved to Mock Exam Blueprints." });
  };




  const downloadTemplate = async (subjectId: string) => {
    if (subjectId === "all") {
      toast({ title: "Please select a subject", description: "Filter by a specific subject first to download its template.", variant: "destructive" });
      return;
    }
    const subj = subjects.find(s => s.id === subjectId);
    if (!subj) return;

    toast({ title: "Generating template..." });
    const { data: units, error: unitsError } = await supabase.from("units").select("id, title, unit_number").eq("subject_id", subjectId).order("unit_number");
    if (unitsError) {
      toast({ title: "Error", description: unitsError.message, variant: "destructive" });
      return;
    }
    if (!units || units.length === 0) {
      toast({ title: "No units found", description: "This subject has no structure yet.", variant: "destructive" });
      return;
    }
    const { data: lessons } = await supabase.from("lessons").select("id, unit_id, title, lesson_number").in("unit_id", units.map(u => u.id)).order("lesson_number");

    let md = `# ${subj.name} Knowledge Base\n\n`;
    md += `Use this template to write or paste your content. Do not change the # Unit or ## Lesson headers.\n\n`;

    for (const u of units) {
      md += `# Unit ${u.unit_number}: ${u.title}\n\n`;
      const uLessons = (lessons || []).filter(l => l.unit_id === u.id);
      if (uLessons.length === 0) {
        md += `[Add unit content here...]\n\n`;
      } else {
        for (const l of uLessons) {
          md += `## Lesson ${l.lesson_number}: ${l.title}\n\n`;
          md += `[Add lesson content here...]\n\n`;
        }
      }
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subj.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Template downloaded" });
  };

  const remove = async (d: Doc) => {
    if (!confirm(`Delete "${d.source_name}"? This removes the PDF and all its indexed chunks.`)) return;
    if (d.id) {
      await supabase.from("curriculum_documents").delete().eq("id", d.id);
      // storage cleanup best-effort
      const { data: rec } = await supabase.from("curriculum_documents").select("storage_path").eq("id", d.id).maybeSingle();
      if (rec?.storage_path) await supabase.storage.from("curriculum-docs").remove([rec.storage_path]);
    }
    load();
  };

  const filteredDocs = docs.filter(d => 
    (filterSubjectId === "all" || d.subject_id === filterSubjectId) &&
    (filterDocType === "all" || d.doc_type === filterDocType)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5"/> Upload Curriculum PDF</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Programme</Label>
            <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
              <SelectTrigger><SelectValue placeholder="Programme"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programmes</SelectItem>
                <SelectItem value="o_level">Cambridge O Level</SelectItem>
                <SelectItem value="igcse">Cambridge IGCSE</SelectItem>
                <SelectItem value="a_level">Cambridge A Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select subject"/></SelectTrigger>
              <SelectContent>
                {filteredSubjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.subject_code ? `(${s.subject_code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Curriculum Provider or Book Name (e.g. Cambridge / Oxford)</Label>
            <Input value={provider} onChange={e => setProvider(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Source / Document name (e.g. Mathematics 0580 syllabus)</Label>
            <Input value={sourceName} onChange={e => setSourceName(e.target.value)} />
          </div>
          {docType === "past_paper" ? (
            <>
              <div className="space-y-1"><Label>Year</Label><Input type="number" value={year} onChange={e => setYear(e.target.value)} /></div>
              <div className="space-y-1"><Label>Paper Number</Label><Input type="number" value={paperNumber} onChange={e => setPaperNumber(e.target.value)} /></div>
            </>
          ) : (
            <>
              <div className="space-y-1"><Label>Exam Board</Label><Input value={examBoard} onChange={e => setExamBoard(e.target.value)} placeholder="e.g. CAIE, Edexcel" /></div>
              <div className="space-y-1"><Label>Edition / Year</Label><Input value={edition} onChange={e => setEdition(e.target.value)} placeholder="e.g. 2023-2025" /></div>
              <div className="space-y-1"><Label>Subject Code</Label><Input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. 0580" /></div>
            </>
          )}
          
          <div className="md:col-span-2 p-4 border rounded-md bg-muted/50 mt-2 space-y-4">
            <h3 className="font-medium flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> Content Rights & Provenance</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Permission Status</Label>
                <Select value={permissionStatus} onValueChange={setPermissionStatus}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
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
                <Switch checked={allowedExternalAi} onCheckedChange={setAllowedExternalAi} id="external-ai" />
                <Label htmlFor="external-ai" className="font-normal cursor-pointer">Allow External AI APIs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={allowedQuizGen} onCheckedChange={setAllowedQuizGen} id="quiz-gen" />
                <Label htmlFor="quiz-gen" className="font-normal cursor-pointer">Allow Quiz Generation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={allowedViewOriginal} onCheckedChange={setAllowedViewOriginal} id="view-orig" />
                <Label htmlFor="view-orig" className="font-normal cursor-pointer">Allow Viewing Original PDF</Label>
              </div>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2 mt-2">
            <Label>PDF file</Label>
            <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="md:col-span-2 mt-4">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Uploading & indexing…</> : "Upload & Index"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Indexed Documents ({filteredDocs.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadTemplate(filterSubjectId)}
              disabled={filterSubjectId === "all"}
              title="Download structured Markdown template for the selected subject"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            <div className="w-64">
              <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
                <SelectTrigger><SelectValue placeholder="Filter by subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
              <Select value={filterDocType} onValueChange={setFilterDocType}>
                <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : (
            <div className="space-y-2">
              {filteredDocs.length === 0 && <p className="text-sm text-muted-foreground">No documents found.</p>}
              {filteredDocs.map(d => {
                const subj = subjects.find(s => s.id === d.subject_id)?.name || "—";
                return (
                  <div key={d.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{d.source_name}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1 items-center">
                        <Badge variant="outline">{d.doc_type}</Badge>
                        {d.permission_status === 'restricted' && <Badge variant="outline" className="text-amber-500 border-amber-500">Restricted</Badge>}
                        {d.permission_status === 'fair_use' && <Badge variant="outline" className="text-blue-500 border-blue-500">Fair Use</Badge>}
                        <span>{subj}</span>
                        {d.year && <span>· {d.year}</span>}
                        {d.paper_number && <span>· Paper {d.paper_number}</span>}
                        <span>· {d.total_chunks} chunks</span>
                        {d.total_pages && <span>· {d.total_pages} pages</span>}
                        <Badge variant={d.index_status === "indexed" ? "default" : d.index_status === "failed" ? "destructive" : "secondary"}>{d.index_status}</Badge>
                      </div>
                      {d.index_status === "processing" && logs[d.id] && (
                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1.5 font-medium">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>{logs[d.id].message}</span>
                        </div>
                      )}
                      {d.index_error && <div className="text-xs text-destructive mt-1 truncate">{d.index_error}</div>}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {d.doc_type === "past_paper" && (
                        <Button variant="outline" size="sm" onClick={() => extractBlueprint(d)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Extract Blueprint
                        </Button>
                      )}
                      {d.doc_type === "curriculum" && (
                        <>
                          {d.index_status === "requires_mapping" && (
                            <Button variant="default" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => setMappingDoc({ id: d.id, subject_id: d.subject_id || "" })}>
                              <GitMerge className="h-4 w-4 mr-2" /> Map Structure
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => { setHierarchySubjectId(d.subject_id || ""); setHierarchySubjectName(subj); setHierarchyOpen(true); }}>
                            <FolderTree className="h-4 w-4 mr-2" /> Tree
                          </Button>
                          {d.doc_type === "curriculum" && d.structured_index && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => generateQuizzes(d.id)}
                              disabled={generating[d.id]}
                            >
                              {generating[d.id] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-500" />
                              ) : (
                                <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                              )}
                              {generating[d.id] ? "Generating..." : "Gen Quizzes"}
                            </Button>
                          )}
                        </>
                      )}
                      <Button variant="outline" size="icon" onClick={() => setEditDoc(d)} title="Edit Properties"><Pencil className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" onClick={() => reindex(d.id)} title="Re-index"><RefreshCw className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(d)} title="Delete"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CurriculumHierarchyDialog 
        open={hierarchyOpen} 
        onOpenChange={setHierarchyOpen}
        subjectId={hierarchySubjectId}
        subjectName={hierarchySubjectName}
      />

      <CurriculumMappingDialog
        documentId={mappingDoc?.id || null}
        subjectId={mappingDoc?.subject_id || null}
        open={!!mappingDoc}
        onOpenChange={(open) => !open && setMappingDoc(null)}
        onSuccess={() => load()}
      />

      <CurriculumEditDialog
        document={editDoc}
        subjects={subjects}
        open={!!editDoc}
        onOpenChange={(open) => !open && setEditDoc(null)}
        onSuccess={() => load()}
      />
    </div>
  );
}
