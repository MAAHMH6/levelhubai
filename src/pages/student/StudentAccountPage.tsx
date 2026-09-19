import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Bell, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Check, 
  ShieldCheck,
  Zap,
  Sparkles,
  Download,
  Copy,
  Gift,
  Lock,
  Clock,
  Award,
  Globe,
  School,
  FileSpreadsheet,
  Users,
  Link as LinkIcon
} from 'lucide-react';
import { useStudentProgramme, ProgrammeType, PROGRAMME_LABELS } from '@/contexts/StudentProgrammeContext';
import { CANONICAL_A_LEVEL_SUBJECTS } from '@/lib/canonicalALevelSubjects';
import { CANONICAL_O_LEVEL_SUBJECTS } from '@/lib/canonicalOLevelSubjects';
import { CANONICAL_IGCSE_SUBJECTS } from '@/lib/canonicalIGCSESubjects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { featureStorage } from '@/integrations/supabase/featureClient';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ProfileManager from '@/components/profile/ProfileManager';
import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { toast } from 'sonner';

export const StudentAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab') as 'profile' | 'programme' | 'exam' | 'privacy' | 'billing' | 'referral' | 'parent' | null;
  const { profile, updateProfile, programme, programmeLabel, subjects } = useStudentProgramme();
  const { signOut, user } = useAuth();
  const sub = useSubscription();

  const [activeTab, setActiveTab] = useState<'profile' | 'programme' | 'exam' | 'privacy' | 'billing' | 'referral' | 'parent'>(
    tabQuery && ['profile', 'programme', 'exam', 'privacy', 'billing', 'referral', 'parent'].includes(tabQuery) ? tabQuery : 'profile'
  );

  useEffect(() => {
    if (tabQuery && ['profile', 'programme', 'exam', 'privacy', 'billing', 'referral', 'parent'].includes(tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // Parent Connect State
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [linkedParents, setLinkedParents] = useState<any[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const fetchActiveCode = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('child_linking_codes')
        .select('code, expires_at')
        .eq('child_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.code) {
        setLinkingCode(data.code);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLinkedParents = async () => {
    if (!user) return;
    setLoadingParents(true);
    try {
      const { data, error } = await supabase
        .from('parent_children')
        .select('id, parent_id, created_at')
        .eq('child_id', user.id);
      if (!error && data && data.length > 0) {
        const parentIds = data.map(d => d.parent_id);
        const { data: parentProfiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', parentIds);
        const merged = data.map(d => ({
          ...d,
          parentName: parentProfiles?.find(p => p.id === d.parent_id)?.display_name || 'Parent'
        }));
        setLinkedParents(merged);
      } else {
        setLinkedParents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'parent') {
      fetchActiveCode();
      fetchLinkedParents();
    }
  }, [activeTab, user]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const { data, error } = await supabase.rpc('generate_child_linking_code');
      if (error) throw error;
      setLinkingCode(data as string);
      toast.success('6-Digit linking code generated!');
    } catch (err: any) {
      console.error('Error generating linking code:', err);
      toast.error(err.message || 'Failed to generate linking code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!linkingCode) return;
    navigator.clipboard.writeText(linkingCode);
    toast.success('Linking code copied to clipboard!');
  };

  const handleUnlinkParent = async (linkId: string) => {
    try {
      const { error } = await supabase.from('parent_children').delete().eq('id', linkId);
      if (error) throw error;
      toast.success('Parent unlinked successfully');
      setLinkedParents(prev => prev.filter(p => p.id !== linkId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlink parent');
    }
  };
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [school, setSchool] = useState(profile.school);
  const [city, setCity] = useState(profile.city);
  const [country, setCountry] = useState(profile.country);
  const [targetGrade, setTargetGrade] = useState(profile.targetGrade);
  const [examSession, setExamSession] = useState(profile.examSession);
  const [examYear, setExamYear] = useState(profile.examYear);
  const [selectedProg, setSelectedProg] = useState<ProgrammeType>(programme);
  const [isSavingProg, setIsSavingProg] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Synchronize local form state whenever profile updates from DB/storage
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setSchool(profile.school || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setTargetGrade(profile.targetGrade || '');
      setExamSession(profile.examSession || '');
      setExamYear(profile.examYear || '');
      if (profile.programme) {
        setSelectedProg(profile.programme);
      }
    }
  }, [profile]);

  // Synchronize selectedProg whenever context programme changes
  useEffect(() => {
    if (programme) {
      setSelectedProg(programme);
    }
  }, [programme]);

  // Additional comprehensive settings
  const [dailyXpGoal, setDailyXpGoal] = useState('100');
  const [dailyQuestionsGoal, setDailyQuestionsGoal] = useState('20');
  const [weeklyStudyHours, setWeeklyStudyHours] = useState('10');
  const [leaderboardVisibility, setLeaderboardVisibility] = useState('public');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mockFrequency, setMockFrequency] = useState('Weekly');

  const referralCode = `LH-${user?.id?.slice(0, 6)?.toUpperCase() || 'STUDENT'}`;

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      await updateProfile({
        displayName,
        school,
        city,
        country,
        targetGrade,
        examSession,
        examYear,
        programme: selectedProg,
      });
      toast.success('Account preferences saved successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save account preferences');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateProgramme = async () => {
    try {
      setIsSavingProg(true);
      await updateProfile({
        programme: selectedProg,
      });
      const progLabel = PROGRAMME_LABELS[selectedProg] || selectedProg;
      toast.success(`Successfully switched active programme to ${progLabel}! All subjects and past papers updated.`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update programme');
    } finally {
      setIsSavingProg(false);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://olevel.com.pk/auth?ref=${referralCode}`);
    toast.success('Referral link copied to clipboard!');
  };

  const handleExportData = () => {
    const exportPayload = {
      user_id: user?.id,
      email: user?.email,
      profile,
      enrolled_programme: programmeLabel,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LevelHubAI-student-data-${user?.id?.slice(0, 6)}.json`;
    a.click();
    toast.success('Data export downloaded successfully!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <User className="w-3.5 h-3.5 text-teal-600" />
          Student Account & Preferences
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your student identity, Cambridge enrolled programme, study targets, privacy, and billing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'profile' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Profile & School
        </button>
        <button
          onClick={() => setActiveTab('programme')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'programme' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Enrolled Programme
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'exam' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Exam Goals & Targets
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'privacy' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Privacy & Security
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'billing' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Plan & Billing
        </button>
        <button
          onClick={() => setActiveTab('parent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'parent' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Parent Connect
        </button>
        <button
          onClick={() => setActiveTab('referral')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'referral' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          Refer a Friend
        </button>
      </div>

      {/* TAB CONTENT: PROFILE & SCHOOL */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Student Details
              </h3>
              <p className="text-xs text-slate-500">
                Your personal and academic identification details across LevelHubAI.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Display Name</label>
                <Input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="rounded-xl mt-1.5" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Email</label>
                <Input 
                  value={user?.email || ''} 
                  disabled 
                  className="rounded-xl mt-1.5 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School / College</label>
                <Input 
                  value={school} 
                  onChange={(e) => setSchool(e.target.value)} 
                  placeholder="e.g. Lahore Grammar School" 
                  className="rounded-xl mt-1.5" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="e.g. Islamabad" 
                  className="rounded-xl mt-1.5" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Country</label>
                <Input 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  placeholder="e.g. Pakistan" 
                  className="rounded-xl mt-1.5" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Public Student UID</label>
                <Input 
                  value={user?.id || 'uid-active'} 
                  disabled 
                  className="rounded-xl mt-1.5 font-mono text-xs bg-slate-50 dark:bg-slate-800/50" 
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isSavingProfile}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-10 px-6"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </Button>

              <Button onClick={handleSignOut} variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold">
                <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
              </Button>
            </div>
          </Card>

          {/* Detailed Profile Avatar Manager */}
          <ProfileManager />
        </div>
      )}

      {/* TAB CONTENT: ENROLLED PROGRAMME */}
      {activeTab === 'programme' && (
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Cambridge Qualification</h3>
            <p className="text-xs text-slate-500">
              The enrolled programme automatically tunes all subjects, syllabi, past paper references, and AI tutor explanations to your exact exam board specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'o_level' as ProgrammeType, title: 'Cambridge O Level', desc: 'Curriculum 5054, 5070, 5090, 1123, 2058, 4024...' },
              { id: 'igcse' as ProgrammeType, title: 'Cambridge IGCSE', desc: 'Curriculum 0580, 0625, 0620, 0610, 0478, 0450...' },
              { id: 'a_level' as ProgrammeType, title: 'Cambridge International AS & A Level', desc: 'Curriculum 9709, 9701, 9702, 9700, 9608, 9708...' },
            ].map((p) => {
              const isSelected = selectedProg === p.id;
              const isCurrent = programme === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProg(p.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {p.title}
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                          Active
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button 
              onClick={handleUpdateProgramme} 
              disabled={isSavingProg}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-10 px-6 shadow-xs"
            >
              {isSavingProg ? 'Updating Programme...' : (selectedProg === programme ? 'Programme Currently Active' : `Switch to ${selectedProg === 'o_level' ? 'Cambridge O Level' : selectedProg === 'igcse' ? 'Cambridge IGCSE' : 'Cambridge International A Level'}`)}
            </Button>
            {selectedProg !== programme && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                Click button to apply programme switch
              </span>
            )}
          </div>

          {/* Enrolled Subjects List for this Programme */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedProg === programme 
                  ? `Enrolled Subjects (${subjects.length})` 
                  : `Preview Subjects for ${PROGRAMME_LABELS[selectedProg]}`}
              </h4>
              <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                Cambridge Indexed
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(selectedProg === programme ? subjects : (
                selectedProg === 'o_level' ? CANONICAL_O_LEVEL_SUBJECTS.map(s => ({ id: s.id, name: s.name, syllabusCode: s.code, color: s.hex })) :
                selectedProg === 'igcse' ? CANONICAL_IGCSE_SUBJECTS.map(s => ({ id: s.id, name: s.name, syllabusCode: s.code, color: s.hex })) :
                CANONICAL_A_LEVEL_SUBJECTS.map(s => ({ id: s.id, name: s.name, syllabusCode: s.code, color: s.hex }))
              )).map(s => (
                <div key={s.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{s.syllabusCode}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: EXAM GOALS & TARGETS */}
      {activeTab === 'exam' && (
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Exam Series & Targets</h3>
            <p className="text-xs text-slate-500">
              Configure your upcoming Cambridge examination series and daily study expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Session</label>
              <Select value={examSession} onValueChange={setExamSession}>
                <SelectTrigger className="rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="May / June">May / June Series</SelectItem>
                  <SelectItem value="October / November">October / November Series</SelectItem>
                  <SelectItem value="January / February">January / February Series</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Exam Year</label>
              <Select value={examYear} onValueChange={setExamYear}>
                <SelectTrigger className="rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                  <SelectItem value="2028">2028</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Grade</label>
              <Select value={targetGrade} onValueChange={setTargetGrade}>
                <SelectTrigger className="rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A*">A* (Distinction)</SelectItem>
                  <SelectItem value="A">A (Merit)</SelectItem>
                  <SelectItem value="B">B (Credit)</SelectItem>
                  <SelectItem value="C">C (Pass)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily XP Target</label>
              <Input
                type="number"
                value={dailyXpGoal}
                onChange={(e) => setDailyXpGoal(e.target.value)}
                className="rounded-xl mt-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Questions Target</label>
              <Input
                type="number"
                value={dailyQuestionsGoal}
                onChange={(e) => setDailyQuestionsGoal(e.target.value)}
                className="rounded-xl mt-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weekly Hours Target</label>
              <Input
                type="number"
                value={weeklyStudyHours}
                onChange={(e) => setWeeklyStudyHours(e.target.value)}
                className="rounded-xl mt-1.5"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveProfile} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-10 px-6">
              Save Exam Goals & Targets
            </Button>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: PRIVACY & SECURITY */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Data & Account Privacy
              </h3>
              <p className="text-xs text-slate-500">
                Control your visibility on leaderboards, manage your data, and export your learning history.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Leaderboard Visibility</div>
                  <div className="text-xs text-slate-500">Allow your username and XP to be shown on the public leaderboard.</div>
                </div>
                <Select value={leaderboardVisibility} onValueChange={setLeaderboardVisibility}>
                  <SelectTrigger className="w-[140px] rounded-xl text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Email Study Reminders</div>
                  <div className="text-xs text-slate-500">Receive weekly summaries and daily streak notifications.</div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Export Learning History</div>
                  <div className="text-xs text-slate-500">Download all your quiz attempts, assessments, and profile metadata.</div>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5 border-slate-200">
                  <Download className="w-3.5 h-3.5" />
                  Download JSON
                </Button>
              </div>
            </div>
          </Card>

          {/* Embedded Privacy Settings Component */}
          <PrivacySettings />
        </div>
      )}

      {/* TAB CONTENT: PLAN & BILLING */}
      {activeTab === 'billing' && (
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            sub.isPro
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-300/60 dark:border-amber-700/40'
              : 'bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border-teal-200/60 dark:border-teal-900/40'
          }`}>
            <div>
              {sub.isPro ? (
                <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold mb-2">LevelHub Pro Plan 👑</Badge>
              ) : (
                <Badge className="bg-teal-600 text-white text-[10px] font-bold mb-2">Free Plan</Badge>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {sub.isPro ? 'Active Pro Membership' : 'Free Student Membership'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {sub.isPro
                  ? 'Full access to all Cambridge O Level, IGCSE & A Level subjects, unlimited AI Tutor messages, real-time mock exam checking, and 1v1 quiz battles.'
                  : 'Access to 3 Cambridge subjects (Math, Physics, ICT), diagnostic assessment, and foundational practice quizzes.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {!sub.isPro && (
                <Button
                  onClick={() => navigate('/billing')}
                  className="rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs shrink-0"
                >
                  Upgrade to Pro
                </Button>
              )}
              <Button
                onClick={() => navigate('/billing')}
                variant="outline"
                className="rounded-xl text-xs font-bold border-teal-300 dark:border-teal-700 hover:bg-teal-50 shrink-0"
              >
                {sub.isPro ? 'Manage Subscription' : 'View Plans'}
              </Button>
            </div>
          </div>

          {/* Referral Center */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Refer a Friend & Earn Free Pro
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Share your personal link with classmates. When they sign up, both of you get 1 free month of LevelHub Pro!
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={`https://olevel.com.pk/auth?ref=${referralCode}`}
                readOnly
                className="font-mono text-xs rounded-xl bg-white dark:bg-slate-900"
              />
              <Button onClick={handleCopyReferral} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: REFER A FRIEND */}
      {activeTab === 'referral' && (
        <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/60">
              <Gift className="w-3.5 h-3.5 text-teal-600" />
              <span>Student Referral Program</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Refer a Friend & Unlock Free Cambridge Pro
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
              Give your friends 1 free month of LevelHubAI Pro. For every friend who signs up and starts studying, you'll also get 1 free month added to your account + 500 bonus XP!
            </p>
          </div>

          {/* Referral Link & Code Box */}
          <div className="p-5 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Your Personal Invite Link
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={`https://olevel.com.pk/auth?ref=${referralCode}`}
                readOnly
                className="font-mono text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-10"
              />
              <Button 
                onClick={handleCopyReferral} 
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold px-5 h-10 shrink-0 shadow-xs"
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Share Your Link</div>
              <p className="text-xs text-slate-400">Send your invite link to classmates on WhatsApp, Telegram, or Discord.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Classmate Joins</div>
              <p className="text-xs text-slate-400">They create a free account and choose their Cambridge programme.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">You Both Get Pro</div>
              <p className="text-xs text-slate-400">Instantly receive 1 Month of Free Pro access and 500 bonus XP points.</p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: PARENT CONNECT */}
      {activeTab === 'parent' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                <Users className="w-3.5 h-3.5" />
                Parent & Guardian Access
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Parent Connect
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Share a secure 6-digit linking code with your parent or guardian so they can monitor your Cambridge revision, quiz scores, and subject progress from their own Parent Dashboard.
              </p>
            </div>

            {/* Linking Code Generator & Display */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-teal-200/60 dark:border-teal-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    Your 6-Digit Linking Code
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Valid for 24 hours. Single-use only.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateCode}
                  disabled={generatingCode}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-xs font-bold shrink-0"
                >
                  {generatingCode ? 'Generating...' : linkingCode ? 'Generate New Code' : 'Generate Code'}
                </Button>
              </div>

              {linkingCode ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <div className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-500/40 shadow-inner flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-[0.25em] text-teal-600 dark:text-teal-400">
                      {linkingCode}
                    </span>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold px-6 h-12 shadow-xs"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              ) : (
                <div className="py-4 text-center sm:text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    You haven't generated an active linking code yet. Click the button below to create one.
                  </p>
                  <Button
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold px-6 h-10 shadow-xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5 mr-2" />
                    {generatingCode ? 'Generating...' : 'Generate 6-Digit Code'}
                  </Button>
                </div>
              )}
            </div>

            {/* Instructions for Parent */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                How Your Parent Connects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Parent Signs Up</div>
                  <p className="text-[11px] text-slate-400">Your parent registers on LevelHubAI using their own email as a Parent account.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Clicks Add Child</div>
                  <p className="text-[11px] text-slate-400">From their Parent Dashboard, they tap "+ Add Child" in the child selector.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Enters 6-Digit Code</div>
                  <p className="text-[11px] text-slate-400">They type your code above to instantly link and view your weekly progress.</p>
                </div>
              </div>
            </div>

            {/* Currently Linked Parents */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Connected Parents & Guardians
              </h4>
              {loadingParents ? (
                <p className="text-xs text-slate-400">Loading linked accounts...</p>
              ) : linkedParents.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  No parent accounts linked yet. Generate a code above to invite your parent.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedParents.map(link => (
                    <div
                      key={link.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {link.parentName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Connected on {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlinkParent(link.id)}
                        className="rounded-xl border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold h-8"
                      >
                        Unlink
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
