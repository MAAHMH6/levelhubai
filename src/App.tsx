import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { GeoRedirectBanner } from "@/components/seo/GeoRedirectBanner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import QuizSetup from "./pages/QuizSetup";
import SubjectOverview from "./pages/SubjectOverview";
import UnitDetail from "./pages/UnitDetail";
import Lesson from "./pages/Lesson";
import LessonComplete from "./pages/LessonComplete";
import PastPapers from "./pages/PastPapers";
import PaperView from "./pages/PaperView";
import ChallengeBattle from "./pages/ChallengeBattle";
import Challenges from "./pages/Challenges";
import ChallengeSetup from "./pages/ChallengeSetup";
import Performance from "./pages/Performance";
import TopicQuestions from "./pages/TopicQuestions";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/FeaturesPage";
import SubjectsPage from "./pages/SubjectsPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import Billing from "./pages/Billing";
import AlfaReturn from "./pages/AlfaReturn";
import TeacherDashboard from "./pages/TeacherDashboard";
import WritingChecker from "./pages/WritingChecker";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ChildOverview from "./pages/parent/ChildOverview";
import ResetPassword from "./pages/ResetPassword";
import MockExams from "./pages/MockExams";
import TakeMockExam from "./pages/TakeMockExam";
import { ActivityTracker } from "./components/ActivityTracker";
import { StudentProgrammeProvider } from "@/contexts/StudentProgrammeContext";
import { StudentAppLayout } from "@/components/layout/StudentAppLayout";
import { StudentHome } from "./pages/student/StudentHome";
import { StudentSubjectsCatalogue } from "./pages/student/StudentSubjectsCatalogue";
import { StudentSubjectWorkspace } from "./pages/student/StudentSubjectWorkspace";
import { StudentAITutorPage } from "./pages/student/StudentAITutorPage";
import { StudentPlannerPage } from "./pages/student/StudentPlannerPage";
import { StudentProgressPage } from "./pages/student/StudentProgressPage";
import { StudentGamificationPage } from "./pages/student/StudentGamificationPage";
import { StudentAccountPage } from "./pages/student/StudentAccountPage";
import { StudentUpgradePage } from "./pages/student/StudentUpgradePage";
import { StudentBillingPage } from "./pages/student/StudentBillingPage";
import { FloatingWhatsAppButton } from "./components/common/FloatingWhatsAppButton";
import { FloatingReportIssueButton } from "./components/common/FloatingReportIssueButton";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <BaseSeo />
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <StudentProgrammeProvider>
          <LanguageProvider>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <GeoRedirectBanner />
          <BrowserRouter>
          <ActivityTracker />
          <CookieConsent />
          <FloatingReportIssueButton />
          <FloatingWhatsAppButton />
            <Routes>
              {/* PUBLIC SEO CANONICAL ROUTES (INDEXED & CRAWLED BY GOOGLE) */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/subjects-catalogue" element={<SubjectsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />

              {/* CANONICAL CURRICULUM SUBJECT & TOPIC ROUTES (SEO INDEXED) */}
              <Route path="/subjects/:subjectSlug/past-papers" element={<PastPapers />} />
              <Route path="/a-level/:subjectSlug/past-papers" element={<PastPapers />} />
              <Route path="/subjects/:subjectSlug/past-papers/:paperId" element={<PaperView />} />
              <Route path="/a-level/:subjectSlug/past-papers/:paperId" element={<PaperView />} />
              <Route path="/subjects/:subjectSlug/unit/:unitId/questions" element={<TopicQuestions />} />
              <Route path="/a-level/:subjectSlug/unit/:unitId/questions" element={<TopicQuestions />} />
              <Route path="/lesson/:lessonId" element={<Lesson />} />
              <Route path="/lesson-complete" element={<LessonComplete />} />

              {/* STUDENT PLATFORM COMMAND CENTER (WITH TUTOPIYA UI & HEADER) */}
              <Route element={<StudentAppLayout />}>
                <Route path="/dashboard" element={<StudentHome />} />
                <Route path="/home" element={<StudentHome />} />
                <Route path="/learn" element={<StudentHome />} />
                <Route path="/performance" element={<StudentProgressPage />} />
                <Route path="/progress" element={<StudentProgressPage />} />
                <Route path="/quiz" element={<QuizSetup />} />
                <Route path="/quiz/:type" element={<QuizSetup />} />
                <Route path="/quiz/setup" element={<QuizSetup />} />
                <Route path="/quiz-quick" element={<QuizSetup />} />
                <Route path="/quiz-timed" element={<QuizSetup />} />
                <Route path="/quiz-center" element={<QuizSetup />} />
                <Route path="/ai-tutor" element={<StudentAITutorPage />} />
                <Route path="/planner" element={<StudentPlannerPage />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/gamification" element={<StudentGamificationPage />} />
                <Route path="/writing-checker" element={<WritingChecker />} />
                <Route path="/mock-exams" element={<MockExams />} />
                <Route path="/take-mock-exam/:id" element={<TakeMockExam />} />
                <Route path="/account" element={<StudentAccountPage />} />
                <Route path="/billing" element={<StudentBillingPage />} />
                <Route path="/upgrade" element={<StudentUpgradePage />} />
                <Route path="/subjects-hub" element={<StudentSubjectsCatalogue />} />
                {/* SUBJECT WORKSPACE — New UI inside Student Layout */}
                <Route path="/subjects/:subjectSlug" element={<StudentSubjectWorkspace />} />
                <Route path="/a-level/:subjectSlug" element={<StudentSubjectWorkspace />} />
                <Route path="/subjects/:subjectSlug/unit/:unitId" element={<StudentSubjectWorkspace />} />
                <Route path="/a-level/:subjectSlug/unit/:unitId" element={<StudentSubjectWorkspace />} />
                <Route path="/subjects-hub/:subjectId" element={<StudentSubjectWorkspace />} />
              </Route>

              {/* STANDALONE INTERACTIVE & PORTAL ROUTES */}
              <Route path="/challenge/setup/:friendId" element={<ChallengeSetup />} />
              <Route path="/challenge/:challengeId" element={<ChallengeBattle />} />
              <Route path="/subjects-hub/:subjectId/unit/:unitId" element={<UnitDetail />} />
              <Route path="/subjects-hub/:subjectId/lesson/:lessonId" element={<Lesson />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/alfa-return" element={<AlfaReturn />} />
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/child/:childId" element={<ChildOverview />} />
              {/* CATCH-ALL 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
        </StudentProgrammeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
