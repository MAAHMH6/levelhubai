import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { resourcesStore, ResourceToolMeta } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  FileText, 
  Clock, 
  Calendar, 
  Layers, 
  BookOpen, 
  Award, 
  CheckSquare, 
  TrendingUp, 
  AlertTriangle, 
  FolderTree, 
  FileCode2, 
  FileCheck, 
  Zap, 
  Tag, 
  Bot,
  Flame,
  ExternalLink
} from 'lucide-react';

// Tool Components
import { PastPaperFinderTool } from '@/components/tools/PastPaperFinderTool';
import { TimetableBuilderTool } from '@/components/tools/TimetableBuilderTool';
import { ExamCountdownTool } from '@/components/tools/ExamCountdownTool';
import { FlashcardMakerTool } from '@/components/tools/FlashcardMakerTool';
import { FormulaSheetHubTool } from '@/components/tools/FormulaSheetHubTool';
import { KeywordsDefinitionsTool } from '@/components/tools/KeywordsDefinitionsTool';

const ICON_MAP: Record<string, any> = {
  'exam-timetable-builder': Calendar,
  'exam-countdown': Zap,
  'flashcard-maker': Layers,
  'formula-sheet-hub': FileCode2,
  'keyword-definition-lists': Tag,
  'past-paper-finder': Search,
  'lesson-planner': BookOpen,
  'exam-study-planner': Calendar,
  'mock-exams': FileCheck,
};

export const StudentResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toolId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeToolId = toolId || searchParams.get('tool') || null;

  const [tools, setTools] = useState<ResourceToolMeta[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  useEffect(() => {
    setTools(resourcesStore.getTools());
  }, []);

  const categories = ['all', 'Planning', 'Revision & Memory', 'Past Papers', 'Exam Simulation'];

  const filteredTools = tools.filter((t) => {
    if (t.status === 'archived') return false;
    const matchCat = selectedCat === 'all' || t.category === selectedCat;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleLaunchTool = (tool: ResourceToolMeta) => {
    if (tool.id === 'mock-exams') {
      navigate('/mock-exams');
      return;
    }
    if (tool.id === 'lesson-planner' || tool.id === 'exam-study-planner') {
      navigate('/planner');
      return;
    }
    navigate(`/quick-access/${tool.id}`);
  };

  const activeToolMeta = tools.find(t => t.id === activeToolId);

  // Render individual tool view if active
  if (activeToolId && activeToolMeta) {
    return (
      <div className="space-y-6 pb-16">
        {/* Return Button */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/quick-access')}
            variant="ghost"
            className="rounded-xl text-xs font-bold gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quick Access</span>
          </Button>

          <Badge variant="outline" className="text-xs font-semibold border-teal-500/30 text-teal-600 dark:text-teal-400">
            {activeToolMeta.category}
          </Badge>
        </div>

        {/* Embedded Active Tool Component */}
        {activeToolId === 'exam-timetable-builder' && <TimetableBuilderTool />}
        {activeToolId === 'exam-countdown' && <ExamCountdownTool />}
        {activeToolId === 'flashcard-maker' && <FlashcardMakerTool />}
        {activeToolId === 'formula-sheet-hub' && <FormulaSheetHubTool />}
        {activeToolId === 'keyword-definition-lists' && <KeywordsDefinitionsTool />}
        {activeToolId === 'past-paper-finder' && <PastPaperFinderTool />}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-teal-500/20 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Student Quick Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cambridge Study & Revision Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Fast interactive tools to generate timetables, track exam countdowns, practice spaced repetition flashcards, and access official syllabus formula sheets.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 mt-6 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-teal-500 text-slate-950 shadow-sm font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Tools' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const Icon = ICON_MAP[tool.id] || Sparkles;
          return (
            <Card
              key={tool.id}
              onClick={() => handleLaunchTool(tool)}
              className="p-5 rounded-3xl border-border bg-card hover:border-teal-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: tool.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20">
                      {tool.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
