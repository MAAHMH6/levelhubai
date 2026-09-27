import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  ExternalLink, 
  Filter, 
  Layers, 
  Sparkles, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { toast } from 'sonner';

export const PastPaperFinderTool: React.FC = () => {
  const navigate = useNavigate();
  const { programme } = useStudentProgramme();

  const [qualification, setQualification] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedPaperType, setSelectedPaperType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSubjectsAndPapers();
  }, []);

  const loadSubjectsAndPapers = async () => {
    setLoading(true);
    try {
      const [{ data: subs }, { data: pps }] = await Promise.all([
        supabase.from('subjects').select('id, name, subject_code, qualification').order('name'),
        (supabase.from('past_papers') as any).select('*').order('year', { ascending: false }),
      ]);

      setSubjectsList(subs || []);
      setPapers(pps || []);
    } catch (e) {
      console.error('Error loading past papers:', e);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(new Set(papers.map(p => p.year).filter(Boolean))).sort((a: any, b: any) => b - a);
  const defaultYears = years.length > 0 ? years : [2024, 2023, 2022, 2021, 2020, 2019, 2018];

  const filteredPapers = papers.filter((p) => {
    if (selectedSubject !== 'all' && p.subject_id !== selectedSubject && p.subject !== selectedSubject) return false;
    if (selectedYear !== 'all' && p.year?.toString() !== selectedYear) return false;
    if (selectedSession !== 'all' && p.session?.toLowerCase() !== selectedSession.toLowerCase()) return false;
    if (selectedPaperType !== 'all' && p.paper_type?.toLowerCase() !== selectedPaperType.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.paper_name || '').toLowerCase().includes(q);
      const matchCode = (p.subject_code || '').toLowerCase().includes(q);
      const matchSubject = (p.subject || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSubject) return false;
    }
    return true;
  });

  const handleLaunchPaper = (paper: any, mode: 'view' | 'timed') => {
    // Determine subject slug
    const subObj = subjectsList.find(s => s.id === paper.subject_id);
    const subSlug = subObj ? subObj.name.toLowerCase().replace(/\s+/g, '-') : 'mathematics';
    navigate(`/subjects/${subSlug}/past-papers/${paper.id}?mode=${mode}`);
  };

  const handleOpenPdf = (pdfUrl?: string) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.info('Interactive exam reader initialized for this paper.');
    }
  };

  const resetFilters = () => {
    setQualification('all');
    setSelectedSubject('all');
    setSelectedYear('all');
    setSelectedSession('all');
    setSelectedPaperType('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-teal-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-3">
              <Search className="w-3.5 h-3.5" />
              Cambridge Past Paper Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Past Paper Finder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Instant search across real Cambridge O Level, IGCSE & A Level papers. Filter by subject, year, session, and paper variant with full marking schemes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-bold px-3 py-1.5 bg-slate-800/80 border-slate-700 text-teal-300">
              {filteredPapers.length} Papers Indexed
            </Badge>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search paper code (e.g. 4024/22)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Subject Filter */}
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Subjects ({subjectsList.length})</SelectItem>
              {subjectsList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.subject_code ? `(${s.subject_code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Years</SelectItem>
              {defaultYears.map((yr: any) => (
                <SelectItem key={yr} value={yr.toString()}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Session Filter */}
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="May/June">May / June (Summer)</SelectItem>
              <SelectItem value="Oct/Nov">Oct / Nov (Winter)</SelectItem>
              <SelectItem value="Feb/March">Feb / March (Spring)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Reset */}
        {(selectedSubject !== 'all' || selectedYear !== 'all' || selectedSession !== 'all' || searchQuery) && (
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto" />
          <p className="text-xs text-muted-foreground mt-3 font-medium">Fetching Cambridge past papers...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-border bg-card">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No matching past papers found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Try adjusting your year, session, or subject filters, or clear your search term.
          </p>
          <Button onClick={resetFilters} variant="outline" className="mt-4 rounded-xl text-xs font-bold">
            Reset All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const sub = subjectsList.find(s => s.id === paper.subject_id);
            return (
              <Card
                key={paper.id}
                className="p-5 rounded-3xl border-border bg-card hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20">
                      {paper.year} • {paper.session}
                    </Badge>
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" />
                      {paper.duration_minutes || 90} mins
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {paper.paper_name || `${sub?.name || 'Cambridge Paper'} - Paper ${paper.paper_number || '1'}`}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{sub?.name || 'Cambridge Examination'}</span>
                    <span>•</span>
                    <span>Max Marks: {paper.total_marks || 80}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/80 flex items-center gap-2">
                  <Button
                    onClick={() => handleLaunchPaper(paper, 'view')}
                    className="flex-1 h-9 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Practice Paper</span>
                  </Button>

                  <Button
                    onClick={() => handleLaunchPaper(paper, 'timed')}
                    variant="outline"
                    className="h-9 px-3 rounded-xl text-xs font-bold border-border hover:bg-muted text-foreground gap-1"
                    title="Start Timed Exam"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Timed</span>
                  </Button>

                  {paper.pdf_url && (
                    <Button
                      onClick={() => handleOpenPdf(paper.pdf_url)}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
