import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, BookOpen, Layers, FileText, Tags, Video, FileQuestion, Users, School, Bell, MessageSquare, Newspaper, Activity, Library, PlayCircle, CreditCard, Palette, Share2, Gift } from "lucide-react";
import BillingDashboard from "@/components/admin/BillingDashboard";
import SubjectsManager from "@/components/admin/SubjectsManager";
import UnitsManager from "@/components/admin/UnitsManager";
import LessonsManager from "@/components/admin/LessonsManager";
import TopicsManager from "@/components/admin/TopicsManager";
import VideoLinksManager from "@/components/admin/VideoLinksManager";
import PastPapersManager from "@/components/admin/PastPapersManager";
import UsersManager from "@/components/admin/UsersManager";
import SchoolsManager from "@/components/admin/SchoolsManager";
import NotifyStudentsManager from "@/components/admin/NotifyStudentsManager";
import FeedbackManager from "@/components/admin/FeedbackManager";
import BlogManager from "@/components/admin/BlogManager";
import ActivityDashboard from "@/components/admin/ActivityDashboard";
import CurriculumLibraryManager from "@/components/admin/CurriculumLibraryManager";
import IntroVideoManager from "@/components/admin/IntroVideoManager";
import BrandSettingsManager from "@/components/admin/BrandSettingsManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import CountriesManager from "@/components/admin/CountriesManager";
import TeacherPartnersManager from "@/components/admin/TeacherPartnersManager";
import { StudentReferralsManager } from "@/components/admin/StudentReferralsManager";
import StudentEventsMatrix from "@/components/admin/StudentEventsMatrix";
import MockExamBlueprintsManager from "@/components/admin/MockExamBlueprintsManager";
import QuizQuestionsManager from "@/components/admin/QuizQuestionsManager";
import AIManager from "@/components/admin/AIManager";
import QuizHistoryManager from "@/components/admin/QuizHistoryManager";
import BadgesManager from "@/components/admin/BadgesManager";
import { FlashcardsCheatsheetManager } from "@/components/admin/FlashcardsCheatsheetManager";
import { FinalCurriculumTreeTab } from "@/components/admin/FinalCurriculumTreeTab";
import { Award, GitBranch } from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
        toast({ title: "Access Denied", description: "You don't have admin privileges.", variant: "destructive" });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="activity" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Activity
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Subjects
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> Units
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="final_tree" className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
              <GitBranch className="h-4 w-4" /> Final Curriculum Tree
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-1.5">
              <Tags className="h-4 w-4" /> Topics
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1.5">
              <Video className="h-4 w-4" /> Videos
            </TabsTrigger>
            <TabsTrigger value="papers" className="flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4" /> Past Papers
            </TabsTrigger>
            <TabsTrigger value="blueprints" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Exam Blueprints
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex items-center gap-1.5">
              <Library className="h-4 w-4" /> Curriculum Library
            </TabsTrigger>
            <TabsTrigger value="quiz_curation" className="flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4" /> Quiz Curation
            </TabsTrigger>
            <TabsTrigger value="quiz_history" className="flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4" /> Quiz History
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-1.5">
              <School className="h-4 w-4" /> Schools
            </TabsTrigger>
            <TabsTrigger value="notify" className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" /> Feedback
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-1.5">
              <Newspaper className="h-4 w-4" /> Blog
            </TabsTrigger>
            <TabsTrigger value="intro" className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4" /> Intro Video
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Billing
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center gap-1.5">
              <Palette className="h-4 w-4" /> Brand
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1.5">
              <Share2 className="h-4 w-4" /> Social
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-1.5">
              🌍 Countries
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1.5">
              <School className="h-4 w-4" /> Partners
            </TabsTrigger>
            <TabsTrigger value="student_referrals" className="flex items-center gap-1.5">
              <Gift className="h-4 w-4" /> Student Referrals
            </TabsTrigger>
            <TabsTrigger value="events_matrix" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Events Matrix
            </TabsTrigger>
            <TabsTrigger value="ai_config" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> AI Config
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Badges & XP
            </TabsTrigger>
            <TabsTrigger value="study_materials" className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-teal-600" /> Flashcards & Cheatsheets
            </TabsTrigger>
          </TabsList>


          <TabsContent value="activity"><ActivityDashboard /></TabsContent>
          <TabsContent value="subjects"><SubjectsManager /></TabsContent>
          <TabsContent value="units"><UnitsManager /></TabsContent>
          <TabsContent value="lessons"><LessonsManager /></TabsContent>
          <TabsContent value="final_tree"><FinalCurriculumTreeTab /></TabsContent>
          <TabsContent value="topics"><TopicsManager /></TabsContent>
          <TabsContent value="videos"><VideoLinksManager /></TabsContent>
          <TabsContent value="papers"><PastPapersManager /></TabsContent>
          <TabsContent value="blueprints"><MockExamBlueprintsManager /></TabsContent>
          <TabsContent value="curriculum"><CurriculumLibraryManager /></TabsContent>
          <TabsContent value="quiz_curation"><QuizQuestionsManager /></TabsContent>
          <TabsContent value="quiz_history"><QuizHistoryManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="schools"><SchoolsManager /></TabsContent>
          <TabsContent value="notify"><NotifyStudentsManager /></TabsContent>
          <TabsContent value="feedback"><FeedbackManager /></TabsContent>
          <TabsContent value="blog"><BlogManager /></TabsContent>
          <TabsContent value="intro"><IntroVideoManager /></TabsContent>
          <TabsContent value="billing"><BillingDashboard /></TabsContent>
          <TabsContent value="brand"><BrandSettingsManager /></TabsContent>
          <TabsContent value="social"><SocialLinksManager /></TabsContent>
          <TabsContent value="countries"><CountriesManager /></TabsContent>
          <TabsContent value="teachers"><TeacherPartnersManager /></TabsContent>
          <TabsContent value="student_referrals"><StudentReferralsManager /></TabsContent>
          <TabsContent value="events_matrix"><StudentEventsMatrix /></TabsContent>
          <TabsContent value="ai_config"><AIManager /></TabsContent>
          <TabsContent value="badges"><BadgesManager /></TabsContent>
          <TabsContent value="study_materials"><FlashcardsCheatsheetManager /></TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
