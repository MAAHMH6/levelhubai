import React, { useState } from "react";
import { Play, CheckCircle2, Sparkles, BookOpen, Clock, Layers, ArrowRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface VideoMagnetSectionProps {}

export function VideoMagnetSection({}: VideoMagnetSectionProps = {}) {
  const [activeVideo, setActiveVideo] = useState(0);

  const lessons = [
    {
      title: "Electrolysis & Half Equations",
      subject: "Cambridge IGCSE Chemistry (0620)",
      duration: "6m 45s",
      tag: "Tricky Topic",
      views: "1,420+ students mastered",
      summary: "Visual electron movement at cathode and anode, molten vs aqueous salts, and predicting halogen discharge.",
      color: "from-teal-500/20 to-blue-500/20",
    },
    {
      title: "Centripetal Acceleration & Gravitation",
      subject: "Cambridge A Level Physics (9702)",
      duration: "8m 12s",
      tag: "High Yield",
      views: "980+ students mastered",
      summary: "Deconstructing v²/r, Newton's law of gravitation, and satellite orbital mechanics with visual 3D vector arrows.",
      color: "from-purple-500/20 to-indigo-500/20",
    },
    {
      title: "Circle Theorems in 5 Rules",
      subject: "Cambridge O Level Mathematics (4024)",
      duration: "5m 30s",
      tag: "Exam Guaranteed",
      views: "2,150+ students mastered",
      summary: "Angle at centre is twice angle at circumference, alternate segment theorem, and cyclic quadrilaterals decoded.",
      color: "from-amber-500/20 to-rose-500/20",
    },
  ];

  const current = lessons[activeVideo];

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="video-lessons">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Video className="w-3.5 h-3.5" />
            <span>Video Magnet Lessons</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            High-Impact Video Lessons{" "}
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Aligned 100% to Cambridge Syllabi
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            No 2-hour boring lectures. Get bite-sized, high-retention visual breakdowns of the most commonly tested concepts with embedded checkpoint questions.
          </p>
        </div>

        {/* Video Player & Playlist Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Video Screen Mockup (7 cols) */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            {/* Screen Frame */}
            <div className={`relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br ${current.color} border border-border flex items-center justify-center group cursor-pointer shadow-inner`}>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 ml-1 fill-primary-foreground" />
                </div>
              </div>

              {/* Video overlays */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-background/90 text-foreground backdrop-blur-md">
                  {current.tag}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {current.duration}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md rounded-xl p-3 border border-border/60">
                <div className="text-xs font-bold text-foreground truncate">{current.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{current.subject}</div>
              </div>
            </div>

            {/* Video description */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground">{current.title}</h4>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {current.views}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {current.summary}
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Embedded Cambridge checkpoints
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Notes & cheat sheet included
                </span>
              </div>
            </div>

            {/* Lesson Takeaway Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Cambridge Syllabus Specification:</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {current.notes}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Video Playlist (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lesson Playlist</span>

              <div className="space-y-2.5">
                {lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveVideo(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      activeVideo === idx
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border/70 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary font-mono">{lesson.duration}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">{lesson.tag}</span>
                    </div>
                    <h5 className="font-bold text-sm text-foreground mb-0.5">{lesson.title}</h5>
                    <p className="text-xs text-muted-foreground truncate">{lesson.subject}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3">
              <h5 className="font-bold text-sm">Want full syllabus video access?</h5>
              <p className="text-xs text-muted-foreground">
                Explore every chapter across 19 IGCSE, 17 O Level, and 18 A Level subjects.
              </p>
              <div className="flex gap-2">
                <Link to="/subjects" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                    Browse All Subjects
                  </Button>
                </Link>
                <Link to="/auth" className="flex-1">
                  <Button size="sm" className="w-full text-xs font-bold">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
