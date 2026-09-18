import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Zap,
  Play
} from 'lucide-react';
import { useStudentProgramme, SubjectItem } from '@/contexts/StudentProgrammeContext';
import { useAuth } from '@/contexts/AuthContext';

export const StudentSubjectInterestModal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, programmeLabel, subjects, freeSubjects, updateProfile } = useStudentProgramme();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'confirmed'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Check if first-time student (no subjects selected in profile and not dismissed yet)
  useEffect(() => {
    if (!profile.id || profile.id === 'guest_student') return;

    const storageKey = `levelhub_interest_onboarding_${profile.id}`;
    const alreadyCompleted = localStorage.getItem(storageKey) === 'true';

    if (!alreadyCompleted && (!profile.selectedSubjectIds || profile.selectedSubjectIds.length === 0)) {
      // Pre-select free subjects by default so student has immediate starting points
      const defaultIds = freeSubjects.map(s => s.id);
      setSelectedIds(defaultIds.length > 0 ? defaultIds : subjects.slice(0, 3).map(s => s.id));
      setOpen(true);
    }
  }, [profile.id, profile.selectedSubjectIds, freeSubjects, subjects]);

  const handleToggleSubject = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveInterest = async () => {
    if (selectedIds.length === 0) return;

    await updateProfile({ selectedSubjectIds: selectedIds });
    localStorage.setItem(`levelhub_interest_onboarding_${profile.id}`, 'true');
    setStep('confirmed');
  };

  const handleResumeFreeSubject = (subjectId: string) => {
    setOpen(false);
    navigate(`/subjects-hub/${subjectId}`);
  };

  const handleGoToSubjects = () => {
    setOpen(false);
    navigate('/subjects-hub');
  };

  // Find the primary free subject to recommend
  const chosenFreeSubject = freeSubjects.find(s => selectedIds.includes(s.id)) || freeSubjects[0] || subjects[0];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        localStorage.setItem(`levelhub_interest_onboarding_${profile.id}`, 'true');
      }
      setOpen(isOpen);
    }}>
      <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {step === 'select' ? (
          <>
            <DialogHeader className="text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-bold text-teal-700 dark:text-teal-300 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Cambridge {programmeLabel} Onboarding</span>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Your Exam Subjects 📚
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose the Cambridge subjects you are studying this session. We will customize your syllabus progress, smart quizzes, and unlock your free Cambridge subjects!
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2.5 my-4">
              {subjects.map((subject) => {
                const isSelected = selectedIds.includes(subject.id);
                const isFree = subject.subscription_tier === 'free';

                return (
                  <div
                    key={subject.id}
                    onClick={() => handleToggleSubject(subject.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSubject(subject.id)}
                        className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {subject.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({subject.syllabusCode})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {subject.qualification === 'a_level' ? 'AS & A Level Syllabus' : 'IGCSE / O Level Syllabus'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isFree ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-[10px] font-extrabold">
                          Free Access
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-300 text-[10px]">
                          Pro Access
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={handleGoToSubjects}
                className="text-xs text-slate-500 rounded-xl"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSaveInterest}
                disabled={selectedIds.length === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs px-6 h-10 shadow-lg shadow-teal-600/20"
              >
                <span>Save {selectedIds.length} Subjects</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Step 2: Inform student about free subject and prompt resume */}
            <DialogHeader className="text-left space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Subjects Configured! 🚀
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Your syllabus preferences have been saved to your Cambridge profile.
              </DialogDescription>
            </DialogHeader>

            {chosenFreeSubject && (
              <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/80 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5">
                    100% Free Plan Included
                  </Badge>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    Code: {chosenFreeSubject.syllabusCode}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    {chosenFreeSubject.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Full video lessons, topical Cambridge past papers, and diagnostic quizzes are completely unlocked for you on the free plan!
                  </p>
                </div>

                <Button
                  onClick={() => handleResumeFreeSubject(chosenFreeSubject.id)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs h-10 shadow-md shadow-teal-600/25"
                >
                  <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                  <span>Resume {chosenFreeSubject.name} (Free Access)</span>
                </Button>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={handleGoToSubjects}
                className="w-full rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 h-10"
              >
                <span>Go to Subjects Hub</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
