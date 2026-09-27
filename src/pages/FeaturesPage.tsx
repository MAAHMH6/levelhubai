import React, { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { StudyPlannerSection } from "@/components/landing-v2/StudyPlannerSection";
import { TopicQuizzesSection } from "@/components/landing-v2/TopicQuizzesSection";
import { AIMockExamsSection } from "@/components/landing-v2/AIMockExamsSection";
import { VideoMagnetSection } from "@/components/landing-v2/VideoMagnetSection";
import { CheatSheetsFlashcardsSection } from "@/components/landing-v2/CheatSheetsFlashcardsSection";
import { AnalyticsAssessmentSection } from "@/components/landing-v2/AnalyticsAssessmentSection";
import { AITutorFeatureSection } from "@/components/landing-v2/AITutorFeatureSection";
import { ParentMonitoringSection } from "@/components/landing-v2/ParentMonitoringSection";
import { PeerLeaderboardSection } from "@/components/landing-v2/PeerLeaderboardSection";
import { AwardsSection } from "@/components/landing-v2/AwardsSection";
import { FreeResourcesSection } from "@/components/landing-v2/FreeResourcesSection";
import { FinalConversionSection } from "@/components/landing-v2/FinalConversionSection";
import { FreeStudyToolsModal } from "@/components/landing-v2/FreeStudyToolsModal";
import { Sparkles, CheckCircle2, ArrowRight, Layers, Target, Brain, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturesPage = () => {
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello LevelHubAI! I'd like more information about Cambridge exam features and study tools."
    );
    window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
  };

  const handleOpenTools = () => {
    setToolsOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Features Page Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Cambridge AI Learning Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Engineered for <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">Cambridge Exam Mastery</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Every feature on LevelHubAI is purposefully built around official Cambridge CAIE criteria: topical past papers, instant method marking, video magnet lessons, AI revision planning, and transparent parent monitoring.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="font-bold shadow-lg shadow-primary/25 h-12 px-8"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleOpenTools}
              className="h-12 px-8 font-semibold"
            >
              Explore Free Study Tools
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Breakdown Sections */}
      <div className="space-y-4">
        {/* 1. AI Study Planner */}
        <StudyPlannerSection />

        {/* 2. Custom Topic Quizzes */}
        <TopicQuizzesSection />

        {/* 3. AI Mock Exams */}
        <AIMockExamsSection />

        {/* 4. Video Magnet Lessons */}
        <VideoMagnetSection />

        {/* 5. Cheat Sheets & Smart Flashcards */}
        <CheatSheetsFlashcardsSection onOpenTools={handleOpenTools} />

        {/* 6. Real-Time Analytics & Assessment */}
        <AnalyticsAssessmentSection />

        {/* 7. 24/7 AI Cambridge Examiner */}
        <AITutorFeatureSection />

        {/* 8. Parent Monitoring Dashboard */}
        <ParentMonitoringSection />

        {/* 9. Gamification & Peer Leaderboards */}
        <PeerLeaderboardSection />

        {/* 10. Achievements & Badges */}
        <AwardsSection />

        {/* 11. Free Tools Launcher */}
        <FreeResourcesSection onOpenTools={handleOpenTools} />

        {/* 12. Final Transformation CTA */}
        <FinalConversionSection
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      </div>

      <Footer hideCta={true} />

      {/* Modals */}
      <FreeStudyToolsModal open={toolsOpen} onOpenChange={setToolsOpen} />
    </main>
  );
};

export default FeaturesPage;
