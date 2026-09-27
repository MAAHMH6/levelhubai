import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  AlertCircle,
  FileCheck2,
  BookOpen
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { toast } from 'sonner';

// Real Canonical Cambridge Past Papers Catalog
const CANONICAL_FALLBACK_PAPERS = [
  // Mathematics 4024 / 0580
  {
    id: 'math-4024-2024-mj-p12',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    qualification: 'o_level',
    paper_number: '12',
    paper_name: 'Paper 12 (Non-Calculator)',
    paper_type: 'Non-Calculator',
    year: 2024,
    session: 'May/June',
    duration_minutes: 120,
    total_marks: 80,
    calculator_allowed: false,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2024/4024_s24_ms_12.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2024/4024_s24_qp_12.pdf',
  },
  {
    id: 'math-4024-2024-mj-p22',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    qualification: 'o_level',
    paper_number: '22',
    paper_name: 'Paper 22 (Calculator)',
    paper_type: 'Calculator',
    year: 2024,
    session: 'May/June',
    duration_minutes: 150,
    total_marks: 100,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2024/4024_s24_ms_22.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2024/4024_s24_qp_22.pdf',
  },
  {
    id: 'math-4024-2023-on-p12',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    qualification: 'o_level',
    paper_number: '12',
    paper_name: 'Paper 12 (Non-Calculator)',
    paper_type: 'Non-Calculator',
    year: 2023,
    session: 'Oct/Nov',
    duration_minutes: 120,
    total_marks: 80,
    calculator_allowed: false,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2023/4024_w23_ms_12.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Mathematics%20(4024)/2023/4024_w23_qp_12.pdf',
  },
  {
    id: 'math-0580-2024-mj-p22',
    subject: 'Cambridge IGCSE Mathematics',
    subject_code: '0580',
    qualification: 'igcse',
    paper_number: '22',
    paper_name: 'Paper 22 (Extended)',
    paper_type: 'Extended Theory',
    year: 2024,
    session: 'May/June',
    duration_minutes: 90,
    total_marks: 70,
    calculator_allowed: false,
    marking_scheme_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Mathematics%20(0580)/2024/0580_s24_ms_22.pdf',
    pdf_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Mathematics%20(0580)/2024/0580_s24_qp_22.pdf',
  },
  {
    id: 'math-0580-2024-mj-p42',
    subject: 'Cambridge IGCSE Mathematics',
    subject_code: '0580',
    qualification: 'igcse',
    paper_number: '42',
    paper_name: 'Paper 42 (Extended Structured)',
    paper_type: 'Extended Structured',
    year: 2024,
    session: 'May/June',
    duration_minutes: 150,
    total_marks: 130,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Mathematics%20(0580)/2024/0580_s24_ms_42.pdf',
    pdf_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Mathematics%20(0580)/2024/0580_s24_qp_42.pdf',
  },
  // Physics 5054 / 0625
  {
    id: 'phys-5054-2024-mj-p12',
    subject: 'Physics',
    subject_code: '5054',
    qualification: 'o_level',
    paper_number: '12',
    paper_name: 'Paper 12 (Multiple Choice)',
    paper_type: 'Multiple Choice',
    year: 2024,
    session: 'May/June',
    duration_minutes: 60,
    total_marks: 40,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_ms_12.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_qp_12.pdf',
  },
  {
    id: 'phys-5054-2024-mj-p22',
    subject: 'Physics',
    subject_code: '5054',
    qualification: 'o_level',
    paper_number: '22',
    paper_name: 'Paper 22 (Theory)',
    paper_type: 'Theory',
    year: 2024,
    session: 'May/June',
    duration_minutes: 105,
    total_marks: 80,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_ms_22.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_qp_22.pdf',
  },
  {
    id: 'phys-5054-2024-mj-p42',
    subject: 'Physics',
    subject_code: '5054',
    qualification: 'o_level',
    paper_number: '42',
    paper_name: 'Paper 42 (Alternative to Practical)',
    paper_type: 'Alternative to Practical',
    year: 2024,
    session: 'May/June',
    duration_minutes: 60,
    total_marks: 40,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_ms_42.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Physics%20(5054)/2024/5054_s24_qp_42.pdf',
  },
  // Chemistry 5070 / 0620
  {
    id: 'chem-5070-2024-mj-p22',
    subject: 'Chemistry',
    subject_code: '5070',
    qualification: 'o_level',
    paper_number: '22',
    paper_name: 'Paper 22 (Theory)',
    paper_type: 'Theory',
    year: 2024,
    session: 'May/June',
    duration_minutes: 105,
    total_marks: 80,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/O%20Levels/Chemistry%20(5070)/2024/5070_s24_ms_22.pdf',
    pdf_url: 'https://papers.gceguide.net/O%20Levels/Chemistry%20(5070)/2024/5070_s24_qp_22.pdf',
  },
  // Computer Science 0478
  {
    id: 'cs-0478-2024-mj-p12',
    subject: 'Computer Science',
    subject_code: '0478',
    qualification: 'igcse',
    paper_number: '12',
    paper_name: 'Paper 12 (Computer Systems)',
    paper_type: 'Computer Systems',
    year: 2024,
    session: 'May/June',
    duration_minutes: 105,
    total_marks: 75,
    calculator_allowed: false,
    marking_scheme_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Computer%20Science%20(0478)/2024/0478_s24_ms_12.pdf',
    pdf_url: 'https://papers.gceguide.net/Cambridge%20IGCSE/Computer%20Science%20(0478)/2024/0478_s24_qp_12.pdf',
  },
  // A Level Pure Mathematics 9709
  {
    id: 'alevel-math-9709-2024-mj-p12',
    subject: 'Pure Mathematics',
    subject_code: '9709',
    qualification: 'a_level',
    paper_number: '12',
    paper_name: 'Paper 12 (Pure Mathematics 1)',
    paper_type: 'Pure Mathematics',
    year: 2024,
    session: 'May/June',
    duration_minutes: 110,
    total_marks: 75,
    calculator_allowed: true,
    marking_scheme_url: 'https://papers.gceguide.net/A%20Levels/Mathematics%20(9709)/2024/9709_s24_ms_12.pdf',
    pdf_url: 'https://papers.gceguide.net/A%20Levels/Mathematics%20(9709)/2024/9709_s24_qp_12.pdf',
  },
];

export const PastPaperFinderTool: React.FC = () => {
  const navigate = useNavigate();
  const { programme } = useStudentProgramme();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
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

      // Merge database past papers with canonical Cambridge past papers
      const dbPapers = pps || [];
      const merged = [...dbPapers];
      
      CANONICAL_FALLBACK_PAPERS.forEach(cp => {
        if (!merged.some(m => m.id === cp.id || (m.subject_code === cp.subject_code && m.year === cp.year && m.paper_number === cp.paper_number))) {
          merged.push(cp);
        }
      });

      setPapers(merged);
    } catch (e) {
      console.error('Error loading past papers:', e);
      setPapers(CANONICAL_FALLBACK_PAPERS);
    } finally {
      setLoading(false);
    }
  };

  const years = useMemo(() => {
    const list = Array.from(new Set(papers.map(p => p.year).filter(Boolean))).sort((a: any, b: any) => b - a);
    return list.length > 0 ? list : [2024, 2023, 2022, 2021, 2020];
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      if (selectedSubject !== 'all') {
        const matchSub = (p.subject || '').toLowerCase().includes(selectedSubject.toLowerCase()) ||
          p.subject_id === selectedSubject ||
          (p.subject_code && p.subject_code.includes(selectedSubject));
        if (!matchSub) return false;
      }
      if (selectedYear !== 'all' && p.year?.toString() !== selectedYear) return false;
      if (selectedSession !== 'all' && p.session?.toLowerCase() !== selectedSession.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.paper_name || '').toLowerCase().includes(q);
        const matchCode = (p.subject_code || '').toLowerCase().includes(q);
        const matchSubject = (p.subject || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchSubject) return false;
      }
      return true;
    });
  }, [papers, selectedSubject, selectedYear, selectedSession, searchQuery]);

  const handleLaunchPaper = (paper: any, mode: 'view' | 'timed') => {
    const subObj = subjectsList.find(s => s.id === paper.subject_id || s.name === paper.subject);
    const subSlug = subObj ? subObj.name.toLowerCase().replace(/\s+/g, '-') : (paper.subject ? paper.subject.toLowerCase().replace(/\s+/g, '-') : 'mathematics');
    navigate(`/subjects/${subSlug}/past-papers/${paper.id}?mode=${mode}`);
  };

  const handleOpenDoc = (url?: string, label = 'Document') => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.info(`${label} is accessible in interactive exam player.`);
    }
  };

  const resetFilters = () => {
    setSelectedSubject('all');
    setSelectedYear('all');
    setSelectedSession('all');
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
              Cambridge Official Past Paper Repository
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Past Paper Finder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Instant search across real Cambridge O Level, IGCSE & A Level papers. Launch interactive view with marking schemes or start timed examination simulations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-bold px-3 py-1.5 bg-slate-800/80 border-slate-700 text-teal-300">
              {filteredPapers.length} Papers Indexed
            </Badge>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search paper code (e.g. 4024/12)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400 text-xs"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Cambridge Subjects</SelectItem>
              <SelectItem value="Mathematics">Mathematics (0580 / 4024)</SelectItem>
              <SelectItem value="Physics">Physics (0625 / 5054)</SelectItem>
              <SelectItem value="Chemistry">Chemistry (0620 / 5070)</SelectItem>
              <SelectItem value="Biology">Biology (0610 / 5090)</SelectItem>
              <SelectItem value="Computer Science">Computer Science (0478)</SelectItem>
              <SelectItem value="Pure Mathematics">A-Level Pure Mathematics (9709)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Years</SelectItem>
              {years.map((yr: any) => (
                <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="h-10 rounded-xl bg-slate-800/90 border-slate-700 text-white text-xs">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="May/June">May / June (Summer)</SelectItem>
              <SelectItem value="Oct/Nov">Oct / Nov (Winter)</SelectItem>
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
              <RotateCcw className="w-3 h-3" /> Clear All Filters
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
            Try adjusting your year or subject filters.
          </p>
          <Button onClick={resetFilters} variant="outline" className="mt-4 rounded-xl text-xs font-bold">
            Reset All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => (
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

                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {paper.paper_name || `${paper.subject} - Paper ${paper.paper_number || '1'}`}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{paper.subject}</span>
                  {paper.subject_code && <span>({paper.subject_code})</span>}
                  <span>•</span>
                  <span>Max Marks: {paper.total_marks || 80}</span>
                </div>

                {paper.calculator_allowed !== undefined && (
                  <div className="mt-2">
                    <Badge variant="outline" className={`text-[10px] ${
                      paper.calculator_allowed ? 'border-blue-500/30 text-blue-500' : 'border-amber-500/30 text-amber-500'
                    }`}>
                      {paper.calculator_allowed ? 'Calculator Allowed' : 'Non-Calculator'}
                    </Badge>
                  </div>
                )}
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

                {paper.marking_scheme_url && (
                  <Button
                    onClick={() => handleOpenDoc(paper.marking_scheme_url, 'Mark Scheme')}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-teal-600"
                    title="View Marking Scheme"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </Button>
                )}

                {paper.pdf_url && (
                  <Button
                    onClick={() => handleOpenDoc(paper.pdf_url, 'Question Paper')}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Download Official Question Paper PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
