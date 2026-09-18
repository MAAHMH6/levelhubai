import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportRow {
  program?: string;
  subject?: string;
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  topic?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  image_url?: string;
  image_alt?: string;
  [key: string]: any;
}

interface ValidationResult {
  row: ImportRow;
  originalRow: any;
  status: "new" | "existing" | "duplicate" | "invalid";
  reason?: string;
}

export const BulkBlogImport = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, new: 0, existing: 0, duplicate: 0, invalid: 0 });
  const [importComplete, setImportComplete] = useState<{ imported: number; failed: number } | null>(null);

  const resetState = () => {
    setFile(null);
    setResults([]);
    setSummary({ total: 0, new: 0, existing: 0, duplicate: 0, invalid: 0 });
    setImportComplete(null);
  };

  const getFieldValue = (row: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
      const match = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
      if (match && row[match]) return String(row[match]).trim();
    }
    return undefined;
  };

  const parseKeywords = (row: any) => {
    const keywords: string[] = [];
    const pk = getFieldValue(row, ["primary keyword", "primary_keyword"]);
    const kcsv = getFieldValue(row, ["keyword from csv", "keywords", "keyword"]);
    if (pk) keywords.push(...pk.split(",").map(k => k.trim()));
    if (kcsv) keywords.push(...kcsv.split(",").map(k => k.trim()));
    return Array.from(new Set(keywords)).filter(Boolean);
  };

  const processData = async (data: any[]) => {
    setIsProcessing(true);
    try {
      const { data: existingArticles, error } = await supabase.from("blog_articles").select("slug, program, subject");
      if (error) throw error;

      const existingSlugs = new Set(existingArticles?.map(a => a.slug) || []);
      const currentBatchSlugs = new Set<string>();

      let newCount = 0;
      let existingCount = 0;
      let duplicateCount = 0;
      let invalidCount = 0;

      const processed: ValidationResult[] = data.map((rawRow, index) => {
        const row: ImportRow = {
          program: getFieldValue(rawRow, ["programme", "program"]),
          subject: getFieldValue(rawRow, ["subject", "related subject page"]),
          title: getFieldValue(rawRow, ["blog topic / working title", "title", "topic"]),
          slug: getFieldValue(rawRow, ["slug"]),
          content: getFieldValue(rawRow, ["blog content", "content"]),
          category: getFieldValue(rawRow, ["blog type", "category"]),
          topic: getFieldValue(rawRow, ["blog topic / working title", "topic"]),
          meta_title: getFieldValue(rawRow, ["meta title", "seo meta title", "meta_title"]),
          meta_description: getFieldValue(rawRow, ["meta description", "meta_description", "description"]),
          image_url: getFieldValue(rawRow, ["featured image", "image", "image url", "image_url"]),
          image_alt: getFieldValue(rawRow, ["image alt text", "alt text", "image_alt"]),
          keywords: parseKeywords(rawRow),
        };

        if (!row.program || !row.subject || !row.title || !row.slug || !row.content) {
          invalidCount++;
          return { row, originalRow: rawRow, status: "invalid", reason: "Missing required fields (Programme, Subject, Title, Slug, Content)" };
        }

        if (existingSlugs.has(row.slug)) {
          existingCount++;
          return { row, originalRow: rawRow, status: "existing", reason: "Already exists in database" };
        }

        if (currentBatchSlugs.has(row.slug)) {
          duplicateCount++;
          return { row, originalRow: rawRow, status: "duplicate", reason: "Duplicate slug in spreadsheet" };
        }

        currentBatchSlugs.add(row.slug);
        newCount++;
        return { row, originalRow: rawRow, status: "new" };
      });

      setSummary({ total: data.length, new: newCount, existing: existingCount, duplicate: duplicateCount, invalid: invalidCount });
      setResults(processed);
    } catch (error: any) {
      toast.error("Error verifying data: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    resetState();
    setFile(selectedFile);

    const isCsv = selectedFile.name.endsWith(".csv");
    
    if (isCsv) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data),
        error: (error) => toast.error("Error parsing CSV: " + error.message),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        try {
          const workbook = XLSX.read(bstr, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          processData(data);
        } catch (error: any) {
          toast.error("Error parsing Excel file: " + error.message);
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleImport = async () => {
    const toImport = results.filter(r => r.status === "new").map(r => ({
      slug: r.row.slug,
      title: r.row.title,
      program: r.row.program,
      subject: r.row.subject,
      content: r.row.content,
      category: r.row.category || "Guide",
      topic: r.row.topic || null,
      meta_title: r.row.meta_title || null,
      meta_description: r.row.meta_description || null,
      keywords: r.row.keywords || [],
      image_url: r.row.image_url || null,
      image_alt: r.row.image_alt || null,
      published: false,
      featured: false,
      featured_on_subject_page: false,
      read_time: "5 min read",
      author: "Admin",
    }));

    if (toImport.length === 0) return;

    setIsImporting(true);
    try {
      const { error } = await supabase.from("blog_articles").insert(toImport);
      if (error) throw error;
      
      toast.success(`Successfully imported ${toImport.length} blogs as drafts!`);
      setImportComplete({ imported: toImport.length, failed: 0 });
      onSuccess();
    } catch (error: any) {
      toast.error("Error during import: " + error.message);
      setImportComplete({ imported: 0, failed: toImport.length });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrorReport = () => {
    const failedRows = results.filter(r => r.status !== "new").map(r => ({
      ...r.originalRow,
      "Import Status": r.status,
      "Failure Reason": r.reason,
    }));

    if (failedRows.length === 0) {
      toast.info("No failed rows to download.");
      return;
    }

    const csv = Papa.unparse(failedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_blog_import_error_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!isImporting) { setOpen(v); if(!v) resetState(); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" /> 📥 Bulk Import Blogs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Blogs</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!importComplete ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Upload CSV or XLSX file</label>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isProcessing || isImporting}
                />
              </div>

              {isProcessing && <div className="text-sm text-muted-foreground animate-pulse">Processing file...</div>}

              {results.length > 0 && !isProcessing && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Import Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-3 bg-muted rounded-md text-center">
                      <div className="text-2xl font-bold">{summary.total}</div>
                      <div className="text-xs text-muted-foreground">Total Rows</div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-md text-center">
                      <div className="text-2xl font-bold text-green-600">{summary.new}</div>
                      <div className="text-xs text-green-600 font-medium">Valid / New</div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-md text-center">
                      <div className="text-2xl font-bold text-blue-600">{summary.existing}</div>
                      <div className="text-xs text-blue-600 font-medium">Already Exists</div>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-md text-center">
                      <div className="text-2xl font-bold text-orange-600">{summary.duplicate}</div>
                      <div className="text-xs text-orange-600 font-medium">Duplicate Slug</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-md text-center">
                      <div className="text-2xl font-bold text-red-600">{summary.invalid}</div>
                      <div className="text-xs text-red-600 font-medium">Invalid</div>
                    </div>
                  </div>

                  {summary.new > 0 && (
                    <div className="bg-muted/50 p-4 rounded-md flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Ready to Import</p>
                        <p className="text-muted-foreground">{summary.new} valid blogs will be imported as <strong>Drafts</strong>. They will not be visible to users until published manually.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={downloadErrorReport} disabled={summary.total === summary.new}>
                      <Download className="mr-2 h-4 w-4" /> Download Excluded Rows
                    </Button>
                    <Button onClick={handleImport} disabled={summary.new === 0 || isImporting}>
                      {isImporting ? "Importing..." : `Import ${summary.new} Blogs`}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-medium">Import Completed!</h3>
              <p className="text-muted-foreground">
                Successfully imported <strong>{importComplete.imported}</strong> blogs as drafts.
                {importComplete.failed > 0 && ` (${importComplete.failed} failed)`}
              </p>
              
              <div className="flex justify-center gap-3 mt-8">
                {summary.total > summary.new && (
                  <Button variant="outline" onClick={downloadErrorReport}>
                    <Download className="mr-2 h-4 w-4" /> Download Skipped Rows Report
                  </Button>
                )}
                <Button onClick={() => setOpen(false)}>Close Window</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
