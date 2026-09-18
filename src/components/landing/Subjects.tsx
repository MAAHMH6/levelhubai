import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calculator, Atom, FlaskConical, Dna, Receipt, Monitor, Map, Moon, Languages } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";

export const Subjects = () => {
  const navigate = useNavigate();
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true })
        .limit(8);
      if (data) {
        setDbSubjects(data);
      }
    }
    loadSubjects();
  }, []);
  
  const getSubjectSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent-foreground">Cambridge Curriculum</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Complete Coverage of O-Level, IGCSE & A Level{" "}
            Subjects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete curriculum coverage for O-Level, IGCSE & A Level with 15,000+ practice questions mapped to official syllabus.
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dbSubjects.map((subject, i) => {
            const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;
            const bgColorClass = subject.color && subject.color.startsWith('hsl') ? { background: subject.color } : {};

            return (
            <div
              key={i}
              className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/${subject.qualification === 'a_level' ? 'a-level' : 'subjects'}/${getSubjectSlug(subject.name)}`)}
            >
              {/* Header */}
              <div 
                className={`h-2 ${subject.color && subject.color.startsWith('from-') ? `bg-gradient-to-r ${subject.color}` : ''}`} 
                style={bgColorClass}
              />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${subject.color && subject.color.startsWith('from-') ? `bg-gradient-to-br ${subject.color}` : 'bg-primary'}`}
                      style={bgColorClass}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.qualification === 'a_level' ? 'A Level' : subject.qualification === 'igcse' ? 'IGCSE' : 'O-Level'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="font-display text-lg font-bold text-foreground line-clamp-1">{subject.subject_code || 'Full'}</p>
                    <p className="text-xs text-muted-foreground">Syllabus</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="font-display text-lg font-bold text-foreground">1000+</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/subjects">
              View All Subjects
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
