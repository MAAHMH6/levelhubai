import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminDataStore } from "@/lib/adminDataStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CANONICAL_O_LEVEL_SUBJECTS } from "@/lib/canonicalOLevelSubjects";
import { CANONICAL_IGCSE_SUBJECTS } from "@/lib/canonicalIGCSESubjects";
import { CANONICAL_A_LEVEL_SUBJECTS } from "@/lib/canonicalALevelSubjects";

type ProgrammeTab = "o_level" | "igcse" | "a_level";

interface DisplaySubject {
  id: string;
  name: string;
  code: string;
  qualification: string;
  color: string;
  icon: string;
  order: number;
  slug: string;
}

export const Subjects = () => {
  const navigate = useNavigate();
  const [activeProgramme, setActiveProgramme] = useState<ProgrammeTab>("o_level");
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data } = await supabase
          .from("subjects")
          .select("id, name, subject_code, qualification, color, icon, enabled, display_order")
          .eq("enabled", true)
          .order("display_order", { ascending: true });

        const merged = adminDataStore.applySubjectOverrides(data || []);
        setDbSubjects(merged);
      } catch (err) {
        console.warn("Failed to load subjects from Supabase:", err);
      }
    }
    loadSubjects();
  }, []);

  const getSubjectSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Resolve subjects for active programme with 100% unique, non-duplicating colors
  const programmeSubjects = useMemo<DisplaySubject[]>(() => {
    if (activeProgramme === "o_level") {
      return CANONICAL_O_LEVEL_SUBJECTS.map((spec) => {
        const dbMatch = dbSubjects.find(
          (s) =>
            s.id === spec.id ||
            (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === "o_level" || s.qualification === "both"))
        );
        return {
          id: dbMatch?.id || spec.id,
          name: spec.name,
          code: spec.code,
          qualification: "o_level",
          color: spec.hex, // Guaranteed unique non-duplicate color
          icon: spec.icon,
          order: spec.order,
          slug: getSubjectSlug(spec.name),
        };
      });
    }

    if (activeProgramme === "igcse") {
      return CANONICAL_IGCSE_SUBJECTS.map((spec) => {
        const dbMatch = dbSubjects.find(
          (s) =>
            s.id === spec.id ||
            (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === "igcse" || s.qualification === "both"))
        );
        return {
          id: dbMatch?.id || spec.id,
          name: spec.name,
          code: spec.code,
          qualification: "igcse",
          color: spec.hex, // Guaranteed unique non-duplicate color
          icon: spec.icon,
          order: spec.order,
          slug: getSubjectSlug(spec.name),
        };
      });
    }

    // A Level
    return CANONICAL_A_LEVEL_SUBJECTS.map((spec) => {
      const dbMatch = dbSubjects.find(
        (s) =>
          s.id === spec.id ||
          (s.subject_code && s.subject_code.trim() === spec.code && s.qualification === "a_level")
      );
      return {
        id: dbMatch?.id || spec.id,
        name: spec.name,
        code: spec.code,
        qualification: "a_level",
        color: spec.hex, // Guaranteed unique non-duplicate color
        icon: spec.icon,
        order: spec.order,
        slug: getSubjectSlug(spec.name),
      };
    });
  }, [activeProgramme, dbSubjects]);

  const programmeLabel =
    activeProgramme === "o_level"
      ? "Cambridge O Level"
      : activeProgramme === "igcse"
      ? "Cambridge IGCSE"
      : "Cambridge International A Level";

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 rounded-full px-4 py-1.5 mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Cambridge Official Curriculum</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Master Every Subject Across All 3 Programmes
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Switch between Cambridge programmes below. Every subject features complete syllabus coverage, curated video lectures, topical practice, and exam mocks.
          </p>
        </div>

        {/* Programme Switcher Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs
            value={activeProgramme}
            onValueChange={(val) => setActiveProgramme(val as ProgrammeTab)}
            className="w-full max-w-md"
          >
            <TabsList className="grid grid-cols-3 w-full h-12 rounded-2xl bg-muted/90 p-1 border border-border/60 shadow-xs">
              <TabsTrigger
                value="o_level"
                className="rounded-xl text-xs md:text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                O Level
              </TabsTrigger>
              <TabsTrigger
                value="igcse"
                className="rounded-xl text-xs md:text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                IGCSE
              </TabsTrigger>
              <TabsTrigger
                value="a_level"
                className="rounded-xl text-xs md:text-sm font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                A Level
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Programme Subtitle & Count */}
        <div className="flex items-center justify-between max-w-7xl mx-auto mb-6 px-1 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-sm font-bold text-foreground">
              {programmeLabel}
            </span>
            <Badge variant="outline" className="text-xs font-semibold ml-1">
              {programmeSubjects.length} Official Subjects
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
            Unique Curriculum Color Coding • Official Cambridge Codes
          </span>
        </div>

        {/* Subjects Grid (3 Columns Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-14">
          {programmeSubjects.map((subject) => {
            const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;

            return (
              <div
                key={subject.code}
                onClick={() =>
                  navigate(
                    `/${subject.qualification === "a_level" ? "a-level" : "subjects"}/${subject.slug}`
                  )
                }
                className="group relative bg-card hover:bg-card/90 rounded-2xl border border-border/60 hover:border-border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Accent Top Ribbon with Unique Hex Color */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 group-hover:h-2"
                  style={{ backgroundColor: subject.color }}
                />

                <div>
                  {/* Top Row: Icon + Syllabus Code Badge */}
                  <div className="flex items-center justify-between mb-4 pt-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-xs"
                      style={{
                        backgroundColor: `${subject.color}15`,
                        color: subject.color,
                        border: `1px solid ${subject.color}30`,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <Badge
                      variant="secondary"
                      className="font-mono text-xs font-bold px-2.5 py-1 bg-muted/80 text-foreground border border-border/60"
                    >
                      Code {subject.code}
                    </Badge>
                  </div>

                  {/* Subject Name */}
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {subject.name}
                  </h3>

                  <p className="text-xs text-muted-foreground font-medium mb-4">
                    {activeProgramme === "o_level"
                      ? "Cambridge O Level"
                      : activeProgramme === "igcse"
                      ? "Cambridge IGCSE"
                      : "Cambridge International AS & A Level"}
                  </p>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span>Curriculum Ready</span>
                  </div>

                  <span className="font-semibold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            asChild
          >
            <Link to="/subjects" className="inline-flex items-center gap-2">
              <span>View Full Subjects Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
