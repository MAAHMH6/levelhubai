import React, { useState } from "react";
import IndexOriginal from "@/pages/IndexOriginal";

// Set to false to instantaneously revert to the original homepage layout
export const USE_NEW_HOMEPAGE = true;

// Landing V2 Section Components
import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { Subjects } from "@/components/landing/Subjects";
import { CambridgeCieAlignedSection } from "@/components/landing-v2/CambridgeCieAlignedSection";
import { GamifiedLearningSection } from "@/components/landing-v2/GamifiedLearningSection";
import { Testimonials } from "@/components/landing/Testimonials";
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
import { MissionSection } from "@/components/landing-v2/MissionSection";
import { TrustValueSection } from "@/components/landing-v2/TrustValueSection";
import { FinalConversionSection } from "@/components/landing-v2/FinalConversionSection";
import { FreeStudyToolsModal } from "@/components/landing-v2/FreeStudyToolsModal";
import { Footer } from "@/components/landing/Footer";

import { AboutSection } from "@/components/landing-v2/AboutSection";

const Index = () => {
  if (!USE_NEW_HOMEPAGE) {
    return <IndexOriginal />;
  }

  const [toolsOpen, setToolsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello LevelHubAI! I'd like more information about Cambridge exam self-study preparation and tools."
    );
    window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
  };

  const handleOpenTools = () => {
    setToolsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. Top Navigation with Original Logo Style, Resources Mega-Menu & WhatsApp + Dashboard */}
      <NavbarV2
        onOpenWhatsApp={handleOpenWhatsApp}
        onOpenTools={handleOpenTools}
      />

      <main className="flex-1">
        {/* 2. Hero Section with Online Self-Study CTAs & Large Dashboard Display */}
        <HeroV2
          onOpenWhatsApp={handleOpenWhatsApp}
          onOpenTools={handleOpenTools}
        />

        {/* 3. About Us Section (placed directly after Hero) */}
        <AboutSection
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 4. Canonical Subjects Section (Cambridge IGCSE, O Level & A Level) */}
        <div id="subjects">
          <Subjects />
        </div>

        {/* 5. 100% Cambridge CIE Syllabus Alignment Section */}
        <CambridgeCieAlignedSection />

        {/* 6. AI Study Planner & Timetable Section */}
        <StudyPlannerSection />

        {/* 7. Custom Topic Quizzes to Enhance Exam Readiness */}
        <TopicQuizzesSection />

        {/* 8. AI Mock Exams & Instant Marking */}
        <AIMockExamsSection />

        {/* 9. Video Magnet Lessons (Cambridge-Aligned Syllabus) */}
        <VideoMagnetSection />

        {/* 10. Cheat Sheets & Smart Flashcards */}
        <CheatSheetsFlashcardsSection onOpenTools={handleOpenTools} />

        {/* 11. Deep Analytics, Assessment Engine & Continuous Improvement */}
        <AnalyticsAssessmentSection />

        {/* 12. 24/7 Cambridge AI Tutor & Socratic Smart Hints */}
        <AITutorFeatureSection />

        {/* 13. Parent Monitoring Dashboard (6-digit linking code & real activity) */}
        <ParentMonitoringSection />

        {/* 14. Gamified Learning & XP Streak Challenges */}
        <GamifiedLearningSection />

        {/* 15. Gamification & Peer Leaderboard */}
        <PeerLeaderboardSection />

        {/* 16. Awards & Achievements */}
        <AwardsSection />

        {/* 17. Free Resources & 16 Free Study Tools */}
        <FreeResourcesSection onOpenTools={handleOpenTools} />

        {/* 18. Live Student Testimonials & Success Stories */}
        <Testimonials />

        {/* 18. Community & Mission ("We're More Than Just Grades") */}
        <MissionSection
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 19. Verified Serious Value ("Why Pay More When You Can Get More?") */}
        <TrustValueSection
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        {/* 20. Final High-Conversion Section */}
        <FinalConversionSection
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      </main>

      {/* Footer */}
      <Footer hideCta={true} />

      {/* Global Interactive Modals */}
      <FreeStudyToolsModal open={toolsOpen} onOpenChange={setToolsOpen} />
    </div>
  );
};

export default Index;
