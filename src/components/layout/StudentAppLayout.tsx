import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Bot, 
  Calendar, 
  BarChart3, 
  Swords, 
  User, 
  Flame, 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  Bell,
  Coins, 
  Compass, 
  ArrowLeft,
  Target,
  Shield,
  Gift,
  CreditCard,
  PenTool,
  Zap,
  Crown,
  Download,
  Play,
  FileText,
  Users
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSubscription } from '@/hooks/useSubscription';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { IntroVideoPopup } from '@/components/onboarding/IntroVideoPopup';
import { WeeklyReportExportModal } from '@/components/reporting/WeeklyReportExportModal';
import { Footer } from '@/components/landing/Footer';
import { StudentSubjectInterestModal } from '@/components/onboarding/StudentSubjectInterestModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: Home },
  { path: '/subjects-hub', label: 'Subjects', icon: BookOpen },
  { path: '/planner', label: 'Planner', icon: Calendar },
  { path: '/quiz', label: 'Quizzes', icon: Zap },
  { path: '/mock-exams', label: 'AI Mock Exams', icon: FileText },
  { path: '/writing-checker', label: 'Writing Checker', icon: PenTool },
  { path: '/ai-tutor', label: 'AI Tutor', icon: Bot },
  { path: '/performance', label: 'Progress', icon: BarChart3 },
  { path: '/challenges', label: 'Challenges', icon: Swords },
  { path: '/account', label: 'Account', icon: User },
];

export const StudentAppLayout: React.FC = () => {
  const { profile, programmeLabel } = useStudentProgramme();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const sub = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleExportReport = () => {
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen z-30 select-none shadow-sm">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/logo.png" alt="LevelHubAI Logo" className="h-9 w-auto object-contain" />
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
              LevelHub<span className="text-teal-600 dark:text-teal-400">AI</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">
              Student Platform
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200 font-semibold shadow-xs border border-teal-200/60 dark:border-teal-800/60' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Admin Portal Link for Authorized Admins */}
          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <NavLink
                to="/admin"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
                  ${isActive 
                    ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 shadow-xs border border-purple-200/60 dark:border-purple-800/60' 
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-950/40'}
                `}
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin Portal</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Sidebar Footer Gamification Pill */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {profile.streakDays} Day Streak
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Active today</div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20">
                🔥 Hot
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total XP</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{profile.xpPoints.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Back to Website Button */}
          <div className="mt-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 shadow-xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-teal-600" />
              <span>Back to Website</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-extrabold text-base text-slate-900 dark:text-white">
                <img src="/logo.png" alt="LevelHubAI" className="h-8 w-auto object-contain" />
                <span>LevelHub<span className="text-teal-600">AI</span></span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                      ${isActive 
                        ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200 font-semibold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'}
                    `}
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAdmin && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold
                      ${isActive 
                        ? 'bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-300' 
                        : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50'}
                    `}
                  >
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Admin Portal</span>
                  </NavLink>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80"
              >
                <ArrowLeft className="w-4 h-4 text-teal-600" />
                <span>Back to Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER (MATCHING USER'S SCREENSHOT TYPE: Export, Challenge, Coins, Streak, Intro, Bell, Theme, Avatar, Logout) */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 gap-3">
          {/* Left section: mobile hamburger + Programme badge */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-9 w-9 text-slate-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {programmeLabel}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 border-l border-slate-300 dark:border-slate-600 pl-2">
                Exam {profile.examYear}
              </span>
            </div>
          </div>

          {/* Right section: Header Actions matching Images 1 & 2 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Admin Portal button for authorized administrators */}
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                className="h-8 rounded-xl px-3 text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Button>
            )}

            {/* Pro Badge or Upgrade button (routes to /billing) */}
            {sub.isPro ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 text-xs font-black shadow-xs">
                <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>PRO SCHOLAR</span>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/billing')}
                className="h-8 rounded-xl px-3 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </Button>
            )}

            {/* Export Report button (from user's image) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="hidden md:inline-flex h-8 rounded-xl px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </Button>

            {/* Challenge shortcut (from user's image) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/challenges')}
              className="hidden lg:inline-flex h-8 rounded-xl px-3 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Swords className="w-3.5 h-3.5 text-amber-500" />
              <span>Challenge</span>
            </Button>

            {/* Gamification Coins / Gems */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{profile.coins}</span>
            </div>

            {/* Daily Streak Flame */}
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/60 px-2.5 py-1 rounded-full text-xs font-bold text-orange-700 dark:text-orange-300">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{profile.streakDays}d</span>
            </div>

            {/* Interactive Notifications Bell */}
            <NotificationBell />

            {/* Intro Video button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const evt = new CustomEvent('open-intro-video');
                  window.dispatchEvent(evt);
                }
              }}
              className="hidden sm:inline-flex h-8 rounded-xl px-2.5 text-xs font-semibold gap-1 border-slate-200 dark:border-slate-700"
            >
              <Play className="w-3.5 h-3.5 fill-current text-teal-600" />
              <span>Intro</span>
            </Button>

            <ThemeToggle />

            {/* Student Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-teal-600 text-white text-xs font-bold">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 p-2 space-y-1">
                <DropdownMenuLabel className="p-2">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{profile.displayName}</div>
                  <div className="text-xs text-teal-600 font-semibold">{programmeLabel} • Exam {profile.examYear}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account?tab=profile')} className="rounded-xl cursor-pointer">
                  <User className="w-4 h-4 mr-2 text-teal-600" />
                  <span>Profile & School</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=programme')} className="rounded-xl cursor-pointer">
                  <BookOpen className="w-4 h-4 mr-2 text-teal-600" />
                  <span>Enrolled Programme</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=exam')} className="rounded-xl cursor-pointer">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Exam Goals & Targets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=privacy')} className="rounded-xl cursor-pointer">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Privacy & Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=billing')} className="rounded-xl cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                  <span>Plan & Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account?tab=referral')} className="rounded-xl cursor-pointer">
                  <Gift className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Refer a Friend (Free Pro)</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin')} 
                      className="rounded-xl cursor-pointer text-purple-700 dark:text-purple-300 font-bold bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100"
                    >
                      <Shield className="w-4 h-4 mr-2 text-purple-600" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 rounded-xl cursor-pointer font-semibold">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Sign Out icon button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-600"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* MAIN OUTLET CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* ALWAYS-ON MAIN WEBSITE FOOTER (WITHOUT CTA BAR IN STUDENT PLATFORM) */}
        <Footer hideCta={true} />
      </div>

      {/* Intro Video Walkthrough Dialog */}
      <IntroVideoPopup />

      {/* Weekly Progress & Performance Export Modal */}
      <WeeklyReportExportModal 
        open={reportModalOpen} 
        onOpenChange={setReportModalOpen} 
      />

      {/* First-Time Student Interest Subjects & Free Resume Modal */}
      <StudentSubjectInterestModal />
    </div>
  );
};
