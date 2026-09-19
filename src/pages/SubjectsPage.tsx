import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProgramme } from "@/contexts/StudentProgrammeContext";
import { CANONICAL_A_LEVEL_SUBJECTS } from "@/lib/canonicalALevelSubjects";
import { CANONICAL_O_LEVEL_SUBJECTS } from "@/lib/canonicalOLevelSubjects";
import { CANONICAL_IGCSE_SUBJECTS } from "@/lib/canonicalIGCSESubjects";
import { adminDataStore } from "@/lib/adminDataStore";
import * as Icons from "lucide-react";

const SubjectsPage = () => {
  const navigate = useNavigate();
  const { programme } = useStudentProgramme();
  const [activeTab, setActiveTab] = useState<string>(programme || 'o_level');
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, subject_code, qualification, icon, color, description, subscription_tier, is_premium, enabled, display_order')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });

        const merged = adminDataStore.applySubjectOverrides(data || []);
        setDbSubjects(merged);
      } catch (err) {
        console.error("Error loading subjects in SubjectsPage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const displayedSubjects = useMemo(() => {
    const list = 
      activeTab === 'o_level' ? CANONICAL_O_LEVEL_SUBJECTS :
      activeTab === 'igcse' ? CANONICAL_IGCSE_SUBJECTS :
      CANONICAL_A_LEVEL_SUBJECTS;

    return list.map(spec => {
      const dbMatch = dbSubjects.find(s =>
        s.id === spec.id ||
        (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === activeTab || s.qualification === 'both'))
      );

      return {
        id: dbMatch?.id || spec.id,
        name: spec.name,
        subject_code: spec.code,
        qualification: activeTab,
        color: spec.hex,
        icon: spec.icon,
        display_order: spec.order,
        description: spec.description,
        subscription_tier: (spec.code === '4024' || spec.code === '5054' || spec.code === '0417' || spec.code === '0580' || spec.code === '0625' || spec.code === '9709') ? 'free' : 'pro',
        is_premium: !(spec.code === '4024' || spec.code === '5054' || spec.code === '0417' || spec.code === '0580' || spec.code === '0625' || spec.code === '9709'),
        qualification_variant: undefined,
      };
    });
  }, [dbSubjects, activeTab]);

  const getSubjectSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent-foreground">Cambridge Curriculum</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Authoritative <span className="text-gradient-primary">Subjects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete curriculum coverage mapped strictly to Cambridge official syllabus codes.
            </p>
          </div>

          {/* Programme Tabs */}
          <div className="flex justify-center mb-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
              <TabsList className="grid grid-cols-3 w-full h-11 rounded-2xl bg-muted/80 p-1">
                <TabsTrigger value="o_level" className="rounded-xl text-xs font-bold">
                  O Level
                </TabsTrigger>
                <TabsTrigger value="igcse" className="rounded-xl text-xs font-bold">
                  IGCSE
                </TabsTrigger>
                <TabsTrigger value="a_level" className="rounded-xl text-xs font-bold">
                  A Level
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Count & Info */}
          <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-3">
            <p className="text-sm font-semibold text-muted-foreground">
              Showing <span className="text-foreground font-bold">{displayedSubjects.length}</span> {activeTab === 'o_level' ? 'Cambridge O Level' : activeTab === 'igcse' ? 'Cambridge IGCSE' : 'Cambridge International A Level'} Subjects
            </p>
          </div>

          {/* Subjects Grid (3 Columns Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSubjects.map((subject) => {
              const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;
              const isFree = subject.subscription_tier === 'free' || subject.is_premium === false;

              return (
                <div
                  key={subject.id}
                  className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Color strip */}
                  <div>
                    <div 
                      className="h-2.5 w-full transition-all duration-300 group-hover:h-3" 
                      style={{ backgroundColor: subject.color }}
                    />
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105"
                            style={{
                              backgroundColor: `${subject.color}18`,
                              color: subject.color,
                              border: `1px solid ${subject.color}35`,
                            }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground leading-snug line-clamp-1">{subject.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-mono font-bold text-primary">
                                {subject.subject_code ? `Code ${subject.subject_code}` : 'Cambridge'}
                              </span>
                              {subject.qualification_variant && (
                                <span className="text-[10px] text-muted-foreground">({subject.qualification_variant})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-secondary/60 rounded-xl p-2.5 text-center">
                          <p className="font-mono text-sm font-bold text-foreground">{subject.subject_code || 'Syllabus'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Syllabus Code</p>
                        </div>
                        <div className="bg-secondary/60 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
                          {isFree ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                              <Check className="w-3 h-3 mr-1" /> Free Core
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                              <Crown className="w-3 h-3 mr-1" /> Pro Plan
                            </Badge>
                          )}
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">Access Tier</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl font-bold text-xs h-10"
                      onClick={() => navigate(`/subjects-hub/${subject.id}`)}
                    >
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SubjectsPage;
