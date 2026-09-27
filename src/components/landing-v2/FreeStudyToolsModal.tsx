import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  FileText,
  Clock,
  Calendar,
  Layers,
  BookOpen,
  Award,
  CheckSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FolderTree,
  FileCode2,
  FileCheck,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface StudyToolItem {
  id: string;
  name: string;
  category: 'Past Papers' | 'Planning' | 'Exam Simulation' | 'Revision & Memory';
  description: string;
  icon: any;
  route: string;
  badge?: string;
  color: string;
}

export const ALL_FREE_STUDY_TOOLS: StudyToolItem[] = [
  {
    id: 'past-paper-finder',
    name: 'Past Paper Finder',
    category: 'Past Papers',
    description: 'Instant search across 10 years of Cambridge O Level, IGCSE & A Level papers by year, season, and component.',
    icon: Search,
    route: '/resources/past-paper-finder',
    badge: 'Popular',
    color: '#0D9488',
  },
  {
    id: 'exam-timetable-builder',
    name: 'Exam Timetable Builder',
    category: 'Planning',
    description: 'Input your Cambridge exam dates and automatically generate a conflict-free study and revision calendar.',
    icon: Calendar,
    route: '/resources/exam-timetable-builder',
    badge: 'Organize',
    color: '#8B5CF6',
  },
  {
    id: 'exam-countdown',
    name: 'Exam Countdown',
    category: 'Planning',
    description: 'Live countdown widgets for May/June and Oct/Nov Cambridge exam sessions with daily preparation milestones.',
    icon: Zap,
    route: '/resources/exam-countdown',
    color: '#EA580C',
  },
  {
    id: 'topic-past-paper-planner',
    name: 'Topic Past Paper Planner',
    category: 'Past Papers',
    description: 'Break down whole past papers into specific topical questions to drill individual chapters.',
    icon: FolderTree,
    route: '/resources/topic-past-paper-planner',
    color: '#10B981',
  },
  {
    id: 'lesson-planner',
    name: 'Lesson Planner',
    category: 'Planning',
    description: 'Curate daily Cambridge chapter goals, study targets, and video lesson schedules.',
    icon: BookOpen,
    route: '/planner',
    color: '#6366F1',
  },
  {
    id: 'exam-study-planner',
    name: 'Exam Study Planner',
    category: 'Planning',
    description: 'Comprehensive 8-week exam study roadmap calibrated against Cambridge exam dates.',
    icon: Calendar,
    route: '/planner',
    color: '#F59E0B',
  },
  {
    id: 'mock-exams',
    name: 'Mock Exams',
    category: 'Exam Simulation',
    description: 'Full-length timed Cambridge exam papers with auto-marking for Paper 1 and rubric breakdowns for Paper 2.',
    icon: FileCheck,
    route: '/mock-exams',
    badge: 'Core Tool',
    color: '#BE123C',
  },
  {
    id: 'flashcard-maker',
    name: 'Flashcard Maker',
    category: 'Revision & Memory',
    description: 'Create and review smart spaced-repetition flashcards for definitions, chemical formulas, and equations.',
    icon: Layers,
    route: '/resources/flashcard-maker',
    color: '#C026D3',
  },
  {
    id: 'grade-boundary-tracker',
    name: 'Grade Boundary Tracker',
    category: 'Exam Simulation',
    description: 'View real historical Cambridge threshold boundaries from 2018–2024 to see exact marks required for A* and A.',
    icon: Award,
    route: '/resources/grade-boundary-tracker',
    badge: 'CIE Official',
    color: '#CA8A04',
  },
  {
    id: 'formula-sheet-hub',
    name: 'Formula Sheet Hub',
    category: 'Revision & Memory',
    description: 'Downloadable formula sheets for Mathematics, Physics, and Chemistry formatted strictly to Cambridge syllabi.',
    icon: FileCode2,
    route: '/resources/formula-sheet-hub',
    color: '#2563EB',
  },
  {
    id: 'keyword-definition-lists',
    name: 'Keyword & Definition Lists',
    category: 'Revision & Memory',
    description: 'Master list of mandatory Cambridge definitions that examiners require word-for-word in Paper 2 and 4.',
    icon: Tag,
    route: '/resources/keyword-definition-lists',
    color: '#0D9488',
  },
];

interface FreeStudyToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FreeStudyToolsModal: React.FC<FreeStudyToolsModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = ['all', 'Past Papers', 'Planning', 'Exam Simulation', 'Revision & Memory'];

  const filteredTools = ALL_FREE_STUDY_TOOLS.filter((t) => {
    const matchCat = selectedCat === 'all' || t.category === selectedCat;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleLaunchTool = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-card border-border rounded-3xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border-b border-border text-white shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Free Cambridge Study Tools
              </div>
              <DialogTitle className="text-2xl font-black text-white">
                Free Cambridge Study & Exam Tools
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                No sign-up required. Free interactive tools to boost your exam score and streamline daily revision.
              </DialogDescription>
            </div>

            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto scrollbar-none pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Tools' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Tools Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => handleLaunchTool(tool.route)}
                className="p-4 rounded-2xl border border-border/80 bg-card hover:border-teal-500/50 hover:bg-muted/30 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: tool.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-1">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
