import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, Crown, Search, Sparkles, HelpCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStudentProgramme } from "@/contexts/StudentProgrammeContext";
import { CANONICAL_A_LEVEL_SUBJECTS } from "@/lib/canonicalALevelSubjects";
import { CANONICAL_O_LEVEL_SUBJECTS } from "@/lib/canonicalOLevelSubjects";
import { CANONICAL_IGCSE_SUBJECTS } from "@/lib/canonicalIGCSESubjects";
import { adminDataStore } from "@/lib/adminDataStore";
import { FinalConversionSection } from "@/components/landing-v2/FinalConversionSection";
import { FreeStudyToolsModal } from "@/components/landing-v2/FreeStudyToolsModal";
import * as Icons from "lucide-react";

const SubjectsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const progParam = searchParams.get("prog");
  const { programme } = useStudentProgramme();

  const [activeTab, setActiveTab] = useState<string>(
    progParam === "igcse" || progParam === "olevel" || progParam === "alevel"
      ? (progParam === "olevel" ? "o_level" : progParam === "alevel" ? "a_level" : "igcse")
      : (programme || "o_level")
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("subjects")
          .select("id, name, subject_code, qualification, icon, color, description, subscription_tier, is_premium, enabled, display_order")
          .order("display_order", { ascending: true })
          .order("name", { ascending: true });

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

  const RAINBOW_SPECTRUM = [
    "#EF4444", // 1. Crimson Red
    "#F97316", // 2. Bright Orange
    "#FB923C", // 3. Amber Orange
    "#F59E0B", // 4. Warm Gold
    "#EAB308", // 5. Golden Yellow
    "#84CC16", // 6. Vibrant Lime
    "#22C55E", // 7. Fresh Green
    "#10B981", // 8. Emerald Green
    "#14B8A6", // 9. Vibrant Teal
    "#06B6D4", // 10. Aqua Cyan
    "#0EA5E9", // 11. Vivid Sky Blue
    "#3B82F6", // 12. Cobalt Electric Blue
    "#2563EB", // 13. Royal Sapphire Blue
    "#6366F1", // 14. Deep Indigo
    "#8B5CF6", // 15. Vivid Violet
    "#A855F7", // 16. Electric Purple
    "#C026D3", // 17. Orchid Purple
    "#D946EF", // 18. Vivid Magenta Fuchsia
    "#EC4899", // 19. Hot Pink
    "#F43F5E", // 20. Deep Rose
    "#E11D48", // 21. Crimson Rose
    "#BE123C", // 22. Deep Ruby
  ];

  const displayedSubjects = useMemo(() => {
    const list =
      activeTab === "o_level"
        ? CANONICAL_O_LEVEL_SUBJECTS
        : activeTab === "igcse"
        ? CANONICAL_IGCSE_SUBJECTS
        : CANONICAL_A_LEVEL_SUBJECTS;

    const mapped = list.map((spec, idx) => {
      const dbMatch = dbSubjects.find(
        (s) =>
          s.id === spec.id ||
          (s.subject_code &&
            s.subject_code.trim() === spec.code &&
            (s.qualification === activeTab || s.qualification === "both"))
      );

      const rainbowColor = RAINBOW_SPECTRUM[idx % RAINBOW_SPECTRUM.length];

      return {
        id: dbMatch?.id || spec.id,
        name: spec.name,
        subject_code: spec.code,
        qualification: activeTab,
        color: rainbowColor,
        icon: spec.icon,
        display_order: spec.order,
        description: spec.description,
        subscription_tier:
          spec.code === "4024" ||
          spec.code === "5054" ||
          spec.code === "0417" ||
          spec.code === "0580" ||
          spec.code === "0625" ||
          spec.code === "9709"
            ? "free"
            : "pro",
        is_premium: !(
          spec.code === "4024" ||
          spec.code === "5054" ||
          spec.code === "0417" ||
          spec.code === "0580" ||
          spec.code === "0625" ||
          spec.code === "9709"
        ),
      };
    });

    if (!searchQuery.trim()) return mapped;

    const query = searchQuery.toLowerCase().trim();
    return mapped.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.subject_code && s.subject_code.toLowerCase().includes(query))
    );
  }, [dbSubjects, activeTab, searchQuery]);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello LevelHubAI! I'd like more information about Cambridge subjects and study resources."
    );
    window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cambridge Official Curriculum (2024–2026)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Authoritative{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Cambridge Subjects
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            19 IGCSE, 17 O Level, and 18 A Level subjects indexed strictly to official Cambridge syllabus codes with topical past papers, video lessons, and instant AI method marking.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or syllabus code (e.g. 0580, Physics, Chemistry)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border/80 shadow-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Subjects Content */}
      <div className="container mx-auto px-4 max-w-7xl pb-16">
        {/* Programme Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid grid-cols-3 w-full h-12 rounded-2xl bg-muted/80 p-1 border border-border/60">
              <TabsTrigger value="o_level" className="rounded-xl text-xs font-bold">
                O Level (17)
              </TabsTrigger>
              <TabsTrigger value="igcse" className="rounded-xl text-xs font-bold">
                IGCSE (19)
              </TabsTrigger>
              <TabsTrigger value="a_level" className="rounded-xl text-xs font-bold">
                A Level (18)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Count & Status Info */}
        <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Showing <span className="text-foreground font-bold">{displayedSubjects.length}</span>{" "}
            {activeTab === "o_level"
              ? "Cambridge O Level"
              : activeTab === "igcse"
              ? "Cambridge IGCSE"
              : "Cambridge International A Level"}{" "}
            Subjects
          </p>

          <button
            onClick={() => setToolsOpen(true)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            16 Free Study Tools Available
          </button>
        </div>

        {/* Subjects Grid (3 Columns Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {displayedSubjects.map((subject) => {
            const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;
            const isFree = subject.subscription_tier === "free" || subject.is_premium === false;

            return (
              <div
                key={subject.id}
                className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Color Accent Strip */}
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
                          <h3 className="font-display text-lg font-bold text-foreground leading-snug line-clamp-1">
                            {subject.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-mono font-bold text-primary">
                              {subject.subject_code ? `Code ${subject.subject_code}` : "Cambridge"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-muted/50 rounded-xl p-2.5 text-center border border-border/40">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {subject.subject_code || "Syllabus"}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Syllabus Code
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-border/40">
                        {isFree ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                            <Check className="w-3 h-3 mr-1" /> Free Core
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[10px] font-bold">
                            <Crown className="w-3 h-3 mr-1" /> Pro Plan
                          </Badge>
                        )}
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">
                          Access Tier
                        </p>
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

        {/* Free Study Tools Callout Banner */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Free Revision Resources</span>
            </div>
            <h4 className="text-2xl font-bold">Need instant formula sheets, past papers or timetables?</h4>
            <p className="text-muted-foreground text-sm max-w-xl">
              Access all Free Study Tools for your Cambridge subjects without requiring a paid subscription.
            </p>
          </div>

          <Button
            onClick={() => setToolsOpen(true)}
            className="font-bold shadow-md hover:shadow-primary/25 h-11 px-6 text-sm shrink-0"
          >
            Open Free Study Tools
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Final Conversion Section */}
      <FinalConversionSection
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      <Footer hideCta={true} />

      {/* Global Interactive Modals */}
      <FreeStudyToolsModal open={toolsOpen} onOpenChange={setToolsOpen} />
    </main>
  );
};

export default SubjectsPage;
