import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Save, 
  AlertTriangle 
} from "lucide-react";

type QuizQuestion = Database["public"]["Tables"]["quiz_questions"]["Row"] & {
  subjects?: { name: string } | null;
  units?: { title: string } | null;
  lessons?: { title: string } | null;
};

export default function QuizQuestionsManager() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();

  // Review / Edit modal state
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const query = supabase
      .from("quiz_questions")
      .select("*, subjects(name), units(title), lessons(title)")
      .order("created_at", { ascending: false })
      .limit(5000);

    const { data, error } = await query;
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" });
    } else {
      setQuestions(data as any);
    }
    setLoading(false);
  };

  const handleToggleReject = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from("quiz_questions")
      .update({ is_rejected: nextStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } else {
      setQuestions(q => q.map(item => item.id === id ? { ...item, is_rejected: nextStatus } : item));
      toast({ 
        title: nextStatus ? "Question Rejected" : "Question Approved & Active", 
        description: nextStatus 
          ? "Removed from student quiz pool." 
          : "Question entered usable curated question pool." 
      });
    }
  };

  const handleOpenReview = (q: QuizQuestion) => {
    setSelectedQuestion(q);
    setEditText(q.question_text || "");
    setEditAnswer(q.correct_answer || "");
    setEditExplanation(q.explanation || "");
    setEditModalOpen(true);
  };

  const handleSaveQuestionEdit = async () => {
    if (!selectedQuestion) return;
    setIsSavingEdit(true);

    const { error } = await supabase
      .from("quiz_questions")
      .update({
        question_text: editText,
        correct_answer: editAnswer,
        explanation: editExplanation,
      })
      .eq("id", selectedQuestion.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? {
        ...q,
        question_text: editText,
        correct_answer: editAnswer,
        explanation: editExplanation,
      } : q));
      toast({ title: "Saved", description: "Question details updated successfully." });
      setEditModalOpen(false);
    }
    setIsSavingEdit(false);
  };

  const uniqueSubjects = Array.from(new Set(questions.map(q => q.subjects?.name).filter(Boolean))) as string[];
  const uniqueUnits = Array.from(new Set(questions.map(q => q.units?.title).filter(Boolean))) as string[];
  const uniqueSources = Array.from(new Set(questions.map(q => q.source).filter(Boolean))) as string[];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.question_text?.toLowerCase().includes(search.toLowerCase()) || 
                           q.source?.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = subjectFilter === "all" || q.subjects?.name === subjectFilter;
    const matchesUnit = unitFilter === "all" || q.units?.title === unitFilter;
    const matchesSource = sourceFilter === "all" || q.source === sourceFilter;
    const matchesType = typeFilter === "all" || q.question_type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" ? !q.is_rejected : q.is_rejected);
    
    return matchesSearch && matchesSubject && matchesUnit && matchesSource && matchesType && matchesStatus;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, subjectFilter, unitFilter, sourceFilter, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Quiz Curation & Moderation
          </h2>
          <p className="text-xs text-muted-foreground">
            Academic Question Pipeline: Review AI & Past Paper questions. Only approved questions enter the student pool.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? "question" : "questions"}
          </span>
          <Button size="sm" onClick={fetchQuestions} disabled={loading}>Refresh</Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 bg-muted/40 rounded-xl border border-border">
        <div className="col-span-2 sm:col-span-1">
          <Input 
            placeholder="Search questions..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {uniqueUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="structured">Structured</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Approved (Active)</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Academic Node</TableHead>
              <TableHead>Question & Answer</TableHead>
              <TableHead className="w-[100px]">Type / Diff</TableHead>
              <TableHead className="w-[130px]">Source</TableHead>
              <TableHead className="w-[140px] text-right">Curation Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading curated questions...</TableCell>
              </TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No questions found matching the selected filters.</TableCell>
              </TableRow>
            ) : (
              paginatedQuestions.map((q) => {
                const isApproved = !q.is_rejected;

                return (
                  <TableRow key={q.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{q.subjects?.name || "Subject"}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                        {q.units?.title || q.lessons?.title || "Curriculum topic"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 max-w-xl">
                        <p className="text-xs font-medium text-foreground line-clamp-2">
                          {q.question_text}
                        </p>
                        {q.correct_answer && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono line-clamp-1">
                            Answer: {q.correct_answer}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[10px] w-fit">
                          {q.question_type || "mcq"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Diff: {q.difficulty || 3}/5
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate block max-w-[120px]" title={q.source || ""}>
                        {q.source || "Generated"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenReview(q)}
                          title="Review & Edit Question"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Switch 
                          checked={!q.is_rejected} 
                          onCheckedChange={() => handleToggleReject(q.id, q.is_rejected || false)} 
                          title={isApproved ? "Approved (in student pool)" : "Rejected (excluded)"}
                        />
                        <span className={`text-xs font-semibold w-16 text-left ${isApproved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          {isApproved ? "Approved" : "Rejected"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review / Edit Question Modal */}
      {selectedQuestion && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" /> Review & Edit Curated Question
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {selectedQuestion.subjects?.name || "Subject"}
                </Badge>
                {selectedQuestion.units?.title && (
                  <Badge variant="outline" className="text-xs">
                    {selectedQuestion.units.title}
                  </Badge>
                )}
                {selectedQuestion.lessons?.title && (
                  <Badge variant="outline" className="text-xs">
                    {selectedQuestion.lessons.title}
                  </Badge>
                )}
                <Badge className={!selectedQuestion.is_rejected ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}>
                  {!selectedQuestion.is_rejected ? "Approved" : "Rejected"}
                </Badge>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Question Text</label>
                <Textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[100px] text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Correct Answer / Working</label>
                <Input 
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Explanation / Mark Scheme Rationale</label>
                <Textarea 
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="min-h-[80px] text-xs leading-relaxed"
                />
              </div>

              {selectedQuestion.options && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">MCQ Options</label>
                  <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                    {typeof selectedQuestion.options === 'string' ? selectedQuestion.options : JSON.stringify(selectedQuestion.options, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <Button
                variant={selectedQuestion.is_rejected ? "default" : "destructive"}
                size="sm"
                onClick={() => {
                  handleToggleReject(selectedQuestion.id, selectedQuestion.is_rejected || false);
                  setEditModalOpen(false);
                }}
              >
                {selectedQuestion.is_rejected ? "Approve Question" : "Reject Question"}
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveQuestionEdit} disabled={isSavingEdit}>
                  <Save className="h-4 w-4 mr-1" /> {isSavingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
