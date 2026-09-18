import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Search,
  Lock,
  Crown,
  Check
} from 'lucide-react';
import { useStudentProgramme, SubjectItem } from '@/contexts/StudentProgrammeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export const StudentSubjectsCatalogue: React.FC = () => {
  const navigate = useNavigate();
  const { programmeLabel, subjects, freeSubjects, limitedSubjects } = useStudentProgramme();
  const sub = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');

  const filterList = (list: SubjectItem[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.syllabusCode.toLowerCase().includes(q)
    );
  };

  const filteredFree = filterList(freeSubjects);
  const filteredLimited = filterList(limitedSubjects);

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Cambridge Programme: {programmeLabel}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subjects Catalogue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select any Cambridge subject below to enter its unit dashboard, video lectures, and practice workspace.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search subjects or syllabus code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs h-10"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: FREE SUBJECTS (3 INCLUDED) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold text-sm">
              {freeSubjects.length}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Free Access Subjects ({freeSubjects.length} Included)</span>
                <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 text-[10px] font-extrabold">
                  Full Access Unlocked
                </Badge>
              </h2>
              <p className="text-xs text-slate-500">
                100% unlocked access to all units, video lectures, and past paper quizzes.
              </p>
            </div>
          </div>
        </div>

        {filteredFree.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No free subjects match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFree.map((subject) => {
              return (
                <Card
                  key={subject.id}
                  onClick={() => navigate(`/subjects-hub/${subject.id}`)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: subject.color }} 
                        />
                        <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {subject.subject_code ? `Code ${subject.subject_code}` : subject.syllabusCode}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {subject.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                        {subject.progressPercent}%
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold">Complete</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Topics Progress</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {subject.completedTopics} of {subject.totalTopics}
                      </span>
                    </div>
                    <Progress value={subject.progressPercent} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{subject.accuracy}%</div>
                      <div className="text-[10px] text-slate-400">Accuracy</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{subject.studyTimeHours}h</div>
                      <div className="text-[10px] text-slate-400">Study Time</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Included
                  </span>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8">
                    Workspace <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </div>

      {/* SECTION 2: PRO SUBJECTS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold text-sm">
              <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{sub.isPro ? "Cambridge Syllabus Subjects" : "Cambridge Pro Syllabus Subjects"}</span>
                {sub.isPro ? (
                  <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 text-[10px] font-extrabold">
                    Pro Subscription Active
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-[10px] font-extrabold">
                    Pro Plan Required
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {sub.isPro 
                  ? "You have full, unlimited access to all Cambridge syllabus units, video lectures, practice questions, and past papers."
                  : "Free Plan includes access to 3 Cambridge subjects (Math, Physics, ICT), diagnostic assessment, and foundational practice quizzes."}
              </p>
            </div>
          </div>

          {!sub.isPro && (
            <Button
              onClick={() => navigate('/billing')}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs h-8 px-3 gap-1.5 self-start sm:self-auto"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Unlock All with Pro</span>
            </Button>
          )}
        </div>

        {filteredLimited.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No subjects match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLimited.map((subject) => {
              return (
                <Card
                  key={subject.id}
                  onClick={() => navigate(`/subjects-hub/${subject.id}`)}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                    sub.isPro 
                      ? 'border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600'
                  }`}
                >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: subject.color }} 
                        />
                        <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {subject.subject_code ? `Code ${subject.subject_code}` : subject.syllabusCode}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                        {subject.name}
                      </h3>
                    </div>

                    {!sub.isPro && (
                      <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold gap-1">
                        <Lock className="w-3 h-3" /> Pro Access
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Syllabus Status</span>
                      <span className={`font-semibold ${sub.isPro ? 'text-teal-600' : 'text-amber-600'}`}>
                        {sub.isPro ? `${subject.progressPercent}% Complete` : "Requires Pro"}
                      </span>
                    </div>
                    <Progress value={sub.isPro ? subject.progressPercent : 0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {subject.totalTopics > 0 ? `${subject.totalTopics} Topics` : 'Cambridge'}
                      </div>
                      <div className="text-[10px] text-slate-400">Syllabus Units</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{subject.studyTimeHours}h</div>
                      <div className="text-[10px] text-slate-400">Study Time</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {sub.isPro ? "Full Syllabus" : "Preview or Upgrade"}
                  </span>
                  <Button 
                    size="sm" 
                    className={sub.isPro 
                      ? "bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4" 
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold h-8"}
                  >
                    {sub.isPro ? "Start Learning" : "Open Preview"} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};
