import React, { useState, useEffect } from 'react';
import { resourcesStore, ResourceToolMeta, GradeBoundaryRecord, CambridgeExamScheduleRecord, FormulaSheetRecord, KeywordDefinitionRecord } from '@/lib/resourcesStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Layers, 
  Award, 
  Clock, 
  Calendar, 
  FileCode2, 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  ExternalLink, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  FileCheck,
  TrendingUp,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import PastPapersManager from '@/components/admin/PastPapersManager';

export const ResourcesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grade_boundaries' | 'exam_schedules' | 'formula_sheets' | 'keywords' | 'past_papers'>('overview');

  const [tools, setTools] = useState<ResourceToolMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Grade Boundaries state
  const [gradeBoundaries, setGradeBoundaries] = useState<GradeBoundaryRecord[]>([]);
  const [gbDialogOpen, setGbDialogOpen] = useState<boolean>(false);
  const [editingGb, setEditingGb] = useState<Partial<GradeBoundaryRecord>>({});

  // Exam Schedules state
  const [schedules, setSchedules] = useState<CambridgeExamScheduleRecord[]>([]);
  const [schDialogOpen, setSchDialogOpen] = useState<boolean>(false);
  const [editingSch, setEditingSch] = useState<Partial<CambridgeExamScheduleRecord>>({});

  // Formula Sheets state
  const [formulaSheets, setFormulaSheets] = useState<FormulaSheetRecord[]>([]);
  const [fsDialogOpen, setFsDialogOpen] = useState<boolean>(false);
  const [editingFs, setEditingFs] = useState<Partial<FormulaSheetRecord>>({});

  // Keywords state
  const [keywords, setKeywords] = useState<KeywordDefinitionRecord[]>([]);
  const [kwDialogOpen, setKwDialogOpen] = useState<boolean>(false);
  const [editingKw, setEditingKw] = useState<Partial<KeywordDefinitionRecord>>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setTools(resourcesStore.getTools());
    setGradeBoundaries(resourcesStore.getAllGradeBoundaries());
    setSchedules(resourcesStore.getAllExamSchedules());
    setFormulaSheets(resourcesStore.getAllFormulaSheets());
    setKeywords(resourcesStore.getAllKeywords());
  };

  const handleToolStatusToggle = (toolId: string, newStatus: ResourceToolMeta['status']) => {
    resourcesStore.updateToolStatus(toolId, newStatus);
    setTools(resourcesStore.getTools());
    toast.success(`Resource status updated to ${newStatus}.`);
  };

  // Grade Boundary CRUD
  const handleSaveGb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGb.subject || !editingGb.component || !editingGb.max_mark) {
      toast.error('Please fill in required boundary fields.');
      return;
    }
    const record: GradeBoundaryRecord = {
      id: editingGb.id || `gb-${Date.now()}`,
      qualification: editingGb.qualification || 'o_level',
      subject: editingGb.subject || 'Mathematics',
      subject_code: editingGb.subject_code || '4024',
      year: Number(editingGb.year) || 2024,
      session: editingGb.session || 'May/June',
      component: editingGb.component || 'Paper 12',
      max_mark: Number(editingGb.max_mark) || 100,
      a_star: Number(editingGb.a_star) || 80,
      a: Number(editingGb.a) || 70,
      b: Number(editingGb.b) || 60,
      c: Number(editingGb.c) || 50,
      d: Number(editingGb.d) || 40,
      e: Number(editingGb.e) || 30,
      status: editingGb.status || 'published',
      updated_at: new Date().toISOString(),
    };
    resourcesStore.saveGradeBoundary(record);
    setGradeBoundaries(resourcesStore.getAllGradeBoundaries());
    setGbDialogOpen(false);
    toast.success('Grade Boundary saved and published to student tools.');
  };

  const handleDeleteGb = (id: string) => {
    resourcesStore.deleteGradeBoundary(id);
    setGradeBoundaries(resourcesStore.getAllGradeBoundaries());
    toast.info('Grade Boundary record deleted.');
  };

  // Exam Schedule CRUD
  const handleSaveSch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSch.subject || !editingSch.paper || !editingSch.exam_date) {
      toast.error('Please complete all exam schedule details.');
      return;
    }
    const record: CambridgeExamScheduleRecord = {
      id: editingSch.id || `sch-${Date.now()}`,
      qualification: editingSch.qualification || 'o_level',
      year: Number(editingSch.year) || 2026,
      session: editingSch.session || 'May/June',
      subject: editingSch.subject || 'Mathematics',
      subject_code: editingSch.subject_code || '4024',
      paper: editingSch.paper || 'Paper 12',
      component: editingSch.component || '12',
      exam_date: editingSch.exam_date || '2026-05-10',
      start_time: editingSch.start_time || '09:00 AM',
      duration_minutes: Number(editingSch.duration_minutes) || 120,
      status: editingSch.status || 'published',
      updated_at: new Date().toISOString(),
    };
    resourcesStore.saveExamSchedule(record);
    setSchedules(resourcesStore.getAllExamSchedules());
    setSchDialogOpen(false);
    toast.success('Exam schedule saved.');
  };

  const handleDeleteSch = (id: string) => {
    resourcesStore.deleteExamSchedule(id);
    setSchedules(resourcesStore.getAllExamSchedules());
    toast.info('Exam date removed.');
  };

  // Keywords CRUD
  const handleSaveKw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKw.keyword || !editingKw.definition) {
      toast.error('Please enter both keyword and definition.');
      return;
    }
    const record: KeywordDefinitionRecord = {
      id: editingKw.id || `kw-${Date.now()}`,
      qualification: editingKw.qualification || 'o_level',
      subject: editingKw.subject || 'Mathematics',
      unit_or_topic: editingKw.unit_or_topic || 'General',
      keyword: editingKw.keyword || '',
      definition: editingKw.definition || '',
      examiner_notes: editingKw.examiner_notes || '',
      status: editingKw.status || 'published',
      updated_at: new Date().toISOString(),
    };
    resourcesStore.saveKeyword(record);
    setKeywords(resourcesStore.getAllKeywords());
    setKwDialogOpen(false);
    toast.success('Keyword definition saved and live in student glossary.');
  };

  const handleDeleteKw = (id: string) => {
    resourcesStore.deleteKeyword(id);
    setKeywords(resourcesStore.getAllKeywords());
    toast.info('Keyword definition removed.');
  };

  // Overview Stats
  const totalResources = tools.length;
  const publishedCount = tools.filter(t => t.status === 'published').length;
  const draftCount = tools.filter(t => t.status === 'draft').length;
  const comingSoonCount = tools.filter(t => t.status === 'coming_soon').length;

  const filteredTools = tools.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-teal-500/20 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Resources Command Center
            </div>
            <h2 className="text-2xl font-black text-white">
              Free Cambridge Study & Exam Tools Management
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Manage live tool states, historical grade boundaries, Cambridge exam series timetables, formula sheets, and mandatory definition glossaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.open('/resources', '_blank')}
              className="rounded-xl text-xs font-bold px-4 h-9 bg-teal-500 hover:bg-teal-400 text-slate-950 gap-1.5 shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Student Hub</span>
            </Button>
          </div>
        </div>

        {/* Aggregate Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Total Resources</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalResources}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Published & Live</div>
            <div className="text-2xl font-black text-teal-400 mt-0.5">{publishedCount}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Grade Thresholds</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{gradeBoundaries.length}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold">Glossary Keywords</div>
            <div className="text-2xl font-black text-purple-400 mt-0.5">{keywords.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1.5 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Tools Overview ({totalResources})
          </TabsTrigger>
          <TabsTrigger value="grade_boundaries" className="rounded-xl text-xs font-bold gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Grade Boundaries ({gradeBoundaries.length})
          </TabsTrigger>
          <TabsTrigger value="exam_schedules" className="rounded-xl text-xs font-bold gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-500" /> Exam Series Dates ({schedules.length})
          </TabsTrigger>
          <TabsTrigger value="formula_sheets" className="rounded-xl text-xs font-bold gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-blue-500" /> Formula Sheets ({formulaSheets.length})
          </TabsTrigger>
          <TabsTrigger value="keywords" className="rounded-xl text-xs font-bold gap-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-500" /> Mandatory Keywords ({keywords.length})
          </TabsTrigger>
          <TabsTrigger value="past_papers" className="rounded-xl text-xs font-bold gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Past Papers Data
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 16 Tools Overview Table */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 h-9 text-xs rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Past Papers">Past Papers</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Exam Simulation">Exam Simulation</SelectItem>
                  <SelectItem value="Revision & Memory">Revision & Memory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">Tool Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Student Route</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Access Tier</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tool.color }} />
                        <span>{tool.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-medium">{tool.category}</td>
                    <td className="p-3.5 font-mono text-[11px] text-teal-600 dark:text-teal-400">{tool.route}</td>
                    <td className="p-3.5">
                      <Badge className={`text-[10px] font-bold ${
                        tool.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        tool.status === 'draft' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {tool.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] font-bold border-teal-500/30 text-teal-600">
                        100% Free
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {tool.status === 'published' ? (
                        <Button
                          onClick={() => handleToolStatusToggle(tool.id, 'draft')}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-amber-600 hover:bg-amber-500/10 rounded-lg"
                        >
                          Unpublish
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleToolStatusToggle(tool.id, 'published')}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-emerald-600 hover:bg-emerald-500/10 rounded-lg font-bold"
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        onClick={() => window.open(tool.route, '_blank')}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-lg gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 2: Grade Boundaries Manager */}
        <TabsContent value="grade_boundaries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Cambridge Grade Threshold Datasets ({gradeBoundaries.length})
            </h3>

            <Button
              onClick={() => {
                setEditingGb({
                  qualification: 'o_level',
                  year: 2024,
                  session: 'May/June',
                  max_mark: 100,
                  a_star: 80,
                  a: 70,
                  b: 60,
                  c: 50,
                  d: 40,
                  e: 30,
                  status: 'published'
                });
                setGbDialogOpen(true);
              }}
              className="rounded-xl text-xs font-bold h-9 bg-amber-600 hover:bg-amber-500 text-white gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Threshold Record
            </Button>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-3">Subject & Code</th>
                  <th className="p-3">Series</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Max Mark</th>
                  <th className="p-3">A*</th>
                  <th className="p-3">A</th>
                  <th className="p-3">B</th>
                  <th className="p-3">C</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gradeBoundaries.map((gb) => (
                  <tr key={gb.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">
                      {gb.subject} <span className="text-muted-foreground font-mono">({gb.subject_code})</span>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">{gb.session} {gb.year}</td>
                    <td className="p-3 font-semibold text-foreground">{gb.component}</td>
                    <td className="p-3 font-mono font-bold">{gb.max_mark}</td>
                    <td className="p-3 font-mono font-black text-amber-600 dark:text-amber-400">{gb.a_star}</td>
                    <td className="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">{gb.a}</td>
                    <td className="p-3 font-mono font-black text-sky-600 dark:text-sky-400">{gb.b}</td>
                    <td className="p-3 font-mono font-black text-purple-600 dark:text-purple-400">{gb.c}</td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => handleDeleteGb(gb.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 3: Exam Schedules */}
        <TabsContent value="exam_schedules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Cambridge Exam Schedule Master ({schedules.length})
            </h3>

            <Button
              onClick={() => {
                setEditingSch({
                  qualification: 'o_level',
                  year: 2026,
                  session: 'May/June',
                  start_time: '09:00 AM',
                  duration_minutes: 120,
                  status: 'published'
                });
                setSchDialogOpen(true);
              }}
              className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Exam Date
            </Button>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-3">Subject & Code</th>
                  <th className="p-3">Paper / Component</th>
                  <th className="p-3">Exam Date</th>
                  <th className="p-3">Start Time</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">
                      {sch.subject} <span className="text-muted-foreground font-mono">({sch.subject_code})</span>
                    </td>
                    <td className="p-3 font-semibold text-foreground">{sch.paper}</td>
                    <td className="p-3 font-medium text-purple-600 dark:text-purple-400">{sch.exam_date}</td>
                    <td className="p-3 text-muted-foreground">{sch.start_time}</td>
                    <td className="p-3 text-muted-foreground">{sch.duration_minutes}m</td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => handleDeleteSch(sch.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 4: Formula Sheets */}
        <TabsContent value="formula_sheets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-blue-500" />
              Syllabus Formula Sheets ({formulaSheets.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulaSheets.map((fs) => (
              <div key={fs.id} className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600">
                      {fs.subject} • {fs.topic}
                    </Badge>
                    <h4 className="text-sm font-bold text-foreground mt-1">{fs.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{fs.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                  Contains {fs.sections.length} formula sections ({fs.sections.reduce((acc, s) => acc + s.items.length, 0)} total equations)
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: Keywords & Definitions */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-500" />
              Mandatory Cambridge Glossary Terms ({keywords.length})
            </h3>

            <Button
              onClick={() => {
                setEditingKw({
                  qualification: 'o_level',
                  subject: 'Physics',
                  unit_or_topic: 'General Physics',
                  status: 'published'
                });
                setKwDialogOpen(true);
              }}
              className="rounded-xl text-xs font-bold h-9 bg-teal-600 hover:bg-teal-500 text-white gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Glossary Keyword
            </Button>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-3">Subject / Topic</th>
                  <th className="p-3">Keyword</th>
                  <th className="p-3">Definition Requirement</th>
                  <th className="p-3">Examiner Tip</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-muted-foreground">{kw.subject} ({kw.unit_or_topic})</td>
                    <td className="p-3 font-bold text-foreground">{kw.keyword}</td>
                    <td className="p-3 text-foreground font-medium max-w-sm">{kw.definition}</td>
                    <td className="p-3 text-muted-foreground text-[11px] max-w-xs">{kw.examiner_notes || '-'}</td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => handleDeleteKw(kw.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 6: Past Papers Manager */}
        <TabsContent value="past_papers">
          <PastPapersManager />
        </TabsContent>
      </Tabs>

      {/* Grade Boundary Dialog */}
      <Dialog open={gbDialogOpen} onOpenChange={setGbDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground">Add Grade Boundary Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGb} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Subject Name</label>
              <Input
                value={editingGb.subject || ''}
                onChange={e => setEditingGb({ ...editingGb, subject: e.target.value })}
                placeholder="e.g. Physics"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Subject Code</label>
                <Input
                  value={editingGb.subject_code || ''}
                  onChange={e => setEditingGb({ ...editingGb, subject_code: e.target.value })}
                  placeholder="5054"
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Component</label>
                <Input
                  value={editingGb.component || ''}
                  onChange={e => setEditingGb({ ...editingGb, component: e.target.value })}
                  placeholder="Paper 22"
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Max Mark</label>
                <Input
                  type="number"
                  value={editingGb.max_mark || ''}
                  onChange={e => setEditingGb({ ...editingGb, max_mark: Number(e.target.value) })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">A* Mark</label>
                <Input
                  type="number"
                  value={editingGb.a_star || ''}
                  onChange={e => setEditingGb({ ...editingGb, a_star: Number(e.target.value) })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">A Mark</label>
                <Input
                  type="number"
                  value={editingGb.a || ''}
                  onChange={e => setEditingGb({ ...editingGb, a: Number(e.target.value) })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setGbDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-amber-600 text-white">
                Save Threshold
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Keywords Dialog */}
      <Dialog open={kwDialogOpen} onOpenChange={setKwDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground">Add Glossary Keyword</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveKw} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Subject</label>
              <Input
                value={editingKw.subject || ''}
                onChange={e => setEditingKw({ ...editingKw, subject: e.target.value })}
                placeholder="e.g. Physics"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Topic / Chapter</label>
              <Input
                value={editingKw.unit_or_topic || ''}
                onChange={e => setEditingKw({ ...editingKw, unit_or_topic: e.target.value })}
                placeholder="e.g. Waves"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Keyword / Term</label>
              <Input
                value={editingKw.keyword || ''}
                onChange={e => setEditingKw({ ...editingKw, keyword: e.target.value })}
                placeholder="e.g. Diffraction"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Exact Definition</label>
              <Textarea
                value={editingKw.definition || ''}
                onChange={e => setEditingKw({ ...editingKw, definition: e.target.value })}
                placeholder="Official Cambridge definition..."
                className="text-xs rounded-xl min-h-[70px]"
                required
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setKwDialogOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-teal-600 text-white">
                Save Keyword
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
