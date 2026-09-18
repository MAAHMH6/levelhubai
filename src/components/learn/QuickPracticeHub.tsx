import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Timer, 
  Brain, 
  Shuffle, 
  ArrowRight, 
  Sparkles, 
  BookOpen,
  Lock,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { PaidSubjectModal } from "@/components/subscription/PaidSubjectModal";

export interface SubjectItemHub {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  subscription_tier?: string;
  syllabusCode?: string;
}

interface QuickPracticeHubProps {
  subjects: SubjectItemHub[];
}

// Distinct, vibrant color palette for each Cambridge subject
const getSubjectDotColor = (name: string, fallbackColor?: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('account')) return '#F43F5E'; // Rose
  if (lower.includes('bio')) return '#10B981'; // Emerald
  if (lower.includes('busin')) return '#F59E0B'; // Amber
  if (lower.includes('chem')) return '#06B6D4'; // Cyan
  if (lower.includes('comp') || lower.includes('cs')) return '#6366F1'; // Indigo
  if (lower.includes('econ')) return '#F97316'; // Orange
  if (lower.includes('eng')) return '#3B82F6'; // Blue
  if (lower.includes('ict')) return '#0EA5E9'; // Sky
  if (lower.includes('math') && lower.includes('a-level')) return '#14B8A6'; // Teal-Green
  if (lower.includes('math')) return '#0D9488'; // Teal
  if (lower.includes('phys')) return '#8B5CF6'; // Purple
  if (lower.includes('psych')) return '#EC4899'; // Pink
  return fallbackColor || '#00B4B6';
};

export const QuickPracticeHub: React.FC<QuickPracticeHubProps> = ({ subjects }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, isSchool } = useSubscription();
  const isFreePlan = !isPro && !isSchool;

  // Paid subject modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState<{ name: string; code?: string }>({ name: "" });

  const allPracticeOptions = [
    {
      id: "quick",
      title: "Quick Quiz",
      description: "Generate a quick quiz from indexed past papers.",
      icon: Zap,
      color: "bg-teal-600 hover:bg-teal-700 text-white",
      badgeColor: "bg-teal-500/30 text-white",
      path: "/quiz?type=quick",
    },
    {
      id: "timed",
      title: "Timed Quiz",
      description: "Test yourself against the clock.",
      icon: Timer,
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      badgeColor: "bg-orange-400/30 text-white",
      path: "/quiz?type=timed",
    },
    {
      id: "center",
      title: "Quiz Center",
      description: "Generate quizzes by subject, unit, or lesson.",
      icon: Brain,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
      badgeColor: "bg-purple-500/30 text-white",
      path: "/quiz?type=center",
    },
  ];

  const handleSubjectClick = (subject: SubjectItemHub) => {
    const isLocked = isFreePlan && subject.subscription_tier !== 'free' && subject.subscription_tier !== undefined;
    if (isLocked) {
      navigate('/billing');
      return;
    }
    // Launch quick quiz for this subject
    navigate(`/quiz?type=quick&subject_id=${subject.id}`);
  };

  return (
    <>
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>Quick Practice Hub</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3 Main Practice Cards matching Image 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {allPracticeOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(option.path)}
                  className={cn(
                    "p-6 rounded-2xl cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group",
                    option.color
                  )}
                >
                  <div className="space-y-2">
                    <Icon className="h-6 w-6" />
                    <h3 className="font-extrabold text-base tracking-tight">{option.title}</h3>
                    <p className="text-xs text-white/90 leading-relaxed">{option.description}</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", option.badgeColor)}>
                      Start
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Practice by Subject Section (ALL SUBJECTS DISPLAYED WITH UNIQUE COLOR DOTS) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Practice by Subject ({subjects.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click any subject to practice</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const dotColor = getSubjectDotColor(subject.name, subject.color);
                const isLocked = isFreePlan && subject.subscription_tier !== 'free' && subject.subscription_tier !== undefined;

                return (
                  <Button
                    key={subject.id}
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl px-3 text-xs font-semibold gap-2 border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-slate-800 dark:text-slate-200">{subject.name}</span>
                    {isLocked && (
                      <Lock className="w-3 h-3 text-amber-500 ml-0.5 shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
