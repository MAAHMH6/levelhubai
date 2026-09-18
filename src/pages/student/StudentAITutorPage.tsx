import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, ChevronDown } from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AITutorChat } from '@/components/ai/AITutorChat';

export const StudentAITutorPage: React.FC = () => {
  const { isPro, isSchool } = useSubscription();
  const { profile, programmeLabel, programme, coreSubjects, subjects } = useStudentProgramme();

  const allSubjects = subjects.length > 0 ? subjects : coreSubjects;
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    allSubjects[0]?.id || ''
  );
  const [isChatOpen, setIsChatOpen] = useState(true);

  const selectedSubject = allSubjects.find(s => s.id === selectedSubjectId) || allSubjects[0];

  // Map programme to qualification string for AITutorChat
  const qualification = programme === 'a_level' ? 'a_level' : programme === 'igcse' ? 'igcse' : 'o_level';

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
            <Bot className="w-3.5 h-3.5" />
            Programme: {programmeLabel}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            AI Cambridge Tutor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Powered by Gemini AI • Subject-specific • {programmeLabel} curriculum-aware
          </p>
        </div>

        {/* Subject selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Study Subject:</div>
          <Select
            value={selectedSubjectId}
            onValueChange={(val) => setSelectedSubjectId(val)}
          >
            <SelectTrigger className="w-52 rounded-xl font-semibold text-xs h-10 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {allSubjects.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.syllabusCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isPro && !isSchool && (
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-semibold">
              10 questions/day (Free)
            </Badge>
          )}
          {(isPro || isSchool) && (
            <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 text-[10px] font-semibold">
              Unlimited (Pro) ✓
            </Badge>
          )}
        </div>
      </div>

      {/* How-to quick guide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '💡', title: 'Explain Concepts', desc: 'Ask for step-by-step explanations of any topic' },
          { icon: '✏️', title: 'Check Answers', desc: 'Paste your answer for instant AI marking feedback' },
          { icon: '❓', title: 'Practice Questions', desc: 'Request exam-style questions with mark schemes' },
          { icon: '⚠️', title: 'Common Mistakes', desc: 'Learn what examiners look for and pitfalls to avoid' },
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xl shrink-0">{tip.icon}</div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{tip.title}</div>
              <div className="text-[10px] text-slate-400 leading-relaxed">{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* REAL FULL-PAGE AI TUTOR CHATBOT FORMAT */}
      <div className="pt-2">
        <AITutorChat
          isOpen={true}
          embedded={true}
          onClose={() => {}}
          subjectName={selectedSubject?.name}
          subjectId={selectedSubject?.id}
          qualification={qualification}
        />
      </div>
    </div>
  );
};
