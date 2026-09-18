import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProgramme, ALL_FALLBACK_SUBJECTS } from "@/contexts/StudentProgrammeContext";
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

        if (!error && data && data.length > 0) {
          setDbSubjects(data);
        }
      } catch (err) {
        console.error("Error loading subjects in SubjectsPage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  const displayedSubjects = useMemo(() => {
    const pool = [...dbSubjects];
    ALL_FALLBACK_SUBJECTS.forEach(fallback => {
      const exists = pool.some(s => 
        s.id === fallback.id || 
        (s.subject_code && fallback.subject_code && s.subject_code.trim() === fallback.subject_code.trim())
      );
      if (!exists) pool.push(fallback as any);
    });

    const filtered = pool.filter(subj => {
      if (subj.enabled === false) return false;
      const q = (subj.qualification || '').toLowerCase();
      const n = (subj.name || '').toLowerCase();
      if (activeTab === 'o_level') {
        if (q === 'o_level' || n.includes('olevel') || n.includes('o level')) return true;
        if (q === 'both') {
          const baseName = n.split(' ')[0];
          const hasSpecific = pool.some(s => 
            (s.qualification?.toLowerCase() === 'o_level' || s.name?.toLowerCase().includes('olevel')) &&
            s.name?.toLowerCase().startsWith(baseName)
          );
          return !hasSpecific;
        }
        return false;
      }
      if (activeTab === 'igcse') {
        if (q === 'igcse' || n.includes('igcse')) return true;
        if (q === 'both') {
          const baseName = n.split(' ')[0];
          const hasSpecific = pool.some(s => 
            (s.qualification?.toLowerCase() === 'igcse' || s.name?.toLowerCase().includes('igcse')) &&
            s.name?.toLowerCase().startsWith(baseName)
          );
          return !hasSpecific;
        }
        return false;
      }
      if (activeTab === 'a_level') {
        if (q === 'a_level' || n.includes('a-level') || n.includes('a level')) return true;
        return false;
      }
      return true;
    });

    return filtered.map(subj => {
      const cleanName = (subj.name || '').trim().toLowerCase();
      let code = (subj.subject_code ? subj.subject_code.trim() : null) || '';
      let name = subj.name;

      if (activeTab === 'o_level') {
        if (code === '2210' || cleanName.includes('2210')) {
          name = 'Computer Science';
          code = '2210';
        } else if (code === '0417' || cleanName.includes('0417')) {
          name = 'Information and Communication Technology';
          code = '0417';
        } else if (cleanName.includes('mathematics') && !cleanName.includes('additional')) {
          name = 'Mathematics';
          code = '4024';
        } else if (cleanName.includes('physics')) {
          name = 'Physics';
          code = '5054';
        } else if (cleanName.includes('english') && !cleanName.includes('literature')) {
          name = 'English Language';
          code = '1123';
        } else if (cleanName.includes('chemistry')) {
          name = 'Chemistry';
          code = '5070';
        } else if (cleanName.includes('biology')) {
          name = 'Biology';
          code = '5090';
        } else if (cleanName.includes('islamiyat')) {
          name = 'Islamiyat';
          code = '2058';
        } else if (cleanName.includes('pakistan studies')) {
          name = 'Pakistan Studies';
          code = '2059';
        } else if (cleanName.includes('accounting')) {
          name = 'Accounting';
          code = '7707';
        } else if (cleanName.includes('urdu') && cleanName.includes('first')) {
          name = 'Urdu – First Language';
          code = '3247';
        } else if (cleanName.includes('urdu') && (cleanName.includes('second') || cleanName.includes('2nd'))) {
          name = 'Urdu – Second Language';
          code = '3248';
        }
      }

      return {
        ...subj,
        name,
        subject_code: code,
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

          {/* Subjects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedSubjects.map((subject) => {
              const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;
              const isFree = subject.subscription_tier === 'free' || subject.is_premium === false;
              const bgColorClass = subject.color && subject.color.startsWith('hsl') ? { background: subject.color } : {};

              return (
                <div
                  key={subject.id}
                  className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Color strip */}
                  <div>
                    <div 
                      className={`h-2.5 ${subject.color && subject.color.startsWith('from-') ? `bg-gradient-to-r ${subject.color}` : 'bg-primary'}`} 
                      style={bgColorClass}
                    />
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${subject.color && subject.color.startsWith('from-') ? `bg-gradient-to-br ${subject.color}` : 'bg-primary'}`}
                            style={bgColorClass}
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
