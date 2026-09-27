import React, { useState, useEffect } from 'react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, FormulaSheetRecord } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileCode2, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Sparkles, 
  BookOpen,
  Atom,
  Binary
} from 'lucide-react';
import { toast } from 'sonner';

export const FormulaSheetHubTool: React.FC = () => {
  const { programmeLabel } = useStudentProgramme();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const [sheets, setSheets] = useState<FormulaSheetRecord[]>([]);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = () => {
    const data = resourcesStore.getAllFormulaSheets();
    setSheets(data);
  };

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied to clipboard!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSheets = sheets.filter((sheet) => {
    if (sheet.status === 'archived') return false;
    if (selectedSubject !== 'all' && !sheet.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sheet.title.toLowerCase().includes(q);
      const matchTopic = sheet.topic.toLowerCase().includes(q);
      const matchFormula = sheet.sections.some(sec => 
        sec.items.some(item => item.name.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q))
      );
      if (!matchTitle && !matchTopic && !matchFormula) return false;
    }
    return true;
  });

  const subjects = Array.from(new Set(sheets.map(s => s.subject)));

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Banner (Hidden during print) */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-blue-500/20 text-white shadow-md print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase mb-3">
              <FileCode2 className="w-3.5 h-3.5" />
              Cambridge Syllabus Formula Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Formula Sheet Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Curated Cambridge formula and reference sheets for Mathematics, Physics, and Chemistry formatted strictly to official CIE syllabi specifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="rounded-xl text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700 gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Export</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Subjects ({subjects.length})</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search formula (e.g. Quadratic, Kinetic Energy)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Sheets Grid */}
      {filteredSheets.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <Atom className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No formula sheets found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search query or subject filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredSheets.map((sheet) => (
            <Card key={sheet.id} className="p-6 rounded-3xl border-border bg-card shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                      {sheet.subject}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {sheet.topic}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    {sheet.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sheet.description}
                  </p>
                </div>
              </div>

              {/* Formula Sections */}
              <div className="space-y-4">
                {sheet.sections.map((section, secIdx) => (
                  <div key={secIdx} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.items.map((item, itemIdx) => {
                        const isCopied = copiedFormula === item.formula;
                        return (
                          <div
                            key={itemIdx}
                            className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-foreground">
                                {item.name}
                              </div>
                              <div className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 mt-1">
                                {item.formula}
                              </div>
                              {item.explanation && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {item.explanation}
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => handleCopy(item.formula)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 print:hidden"
                              title="Copy Formula"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
