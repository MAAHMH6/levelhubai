import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Calendar, 
  Zap, 
  Layers, 
  FileCode2, 
  Tag, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap,
  Clock,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface ToolSeoData {
  slug: string;
  name: string;
  title: string;
  metaDesc: string;
  badge: string;
  icon: any;
  color: string;
  headline: string;
  subheadline: string;
  keyFeatures: { title: string; desc: string }[];
  curriculumCoverage: string[];
  faqs: { q: string; a: string }[];
}

const SEO_TOOLS_DATA: Record<string, ToolSeoData> = {
  'exam-timetable-builder': {
    slug: 'exam-timetable-builder',
    name: 'Exam Timetable Builder',
    title: 'Free Cambridge Exam Timetable Builder 2026 | LevelHubAI',
    metaDesc: 'Generate a personalized, conflict-free study schedule tailored to your exact Cambridge O Level, IGCSE, and A Level exam dates.',
    badge: 'Study Planning Tool',
    icon: Calendar,
    color: '#8B5CF6',
    headline: 'Build Your Perfect Cambridge Exam Timetable',
    subheadline: 'Input your Cambridge exam dates and automatically generate a personalized, conflict-free revision calendar with spaced repetition milestones.',
    keyFeatures: [
      { title: 'Conflict-Free Schedule Generator', desc: 'Balances high-priority Paper 2 and Paper 4 exams to prevent burn-out before exam week.' },
      { title: 'Syllabus Calibration', desc: 'Calibrated specifically for May/June and Oct/Nov Cambridge exam sessions across all time zones (Zone 3 & 4).' },
      { title: 'Interactive Weekly Milestones', desc: 'Syncs daily study goals with your LevelHubAI student command center.' },
      { title: 'Printable & PDF Export', desc: 'Export high-resolution study calendars to hang on your study wall or share with parents.' },
    ],
    curriculumCoverage: ['Cambridge O Level (4024, 5054, 5070, 5090, 2059)', 'Cambridge IGCSE (0580, 0625, 0620, 0610, 0478)', 'Cambridge AS & A Level (9709, 9702, 9701, 9700, 9708)'],
    faqs: [
      { q: 'Is the Exam Timetable Builder completely free?', a: 'Yes, all Cambridge study tools on LevelHubAI are 100% free with no subscription required.' },
      { q: 'Can I add multiple subjects across different boards?', a: 'Yes, you can configure O Level, IGCSE, and A Level papers simultaneously into one unified timetable.' },
      { q: 'Does it support both May/June and Oct/Nov sessions?', a: 'Yes, standard Cambridge examination dates for both major examination series are supported.' },
    ],
  },
  'exam-countdown': {
    slug: 'exam-countdown',
    name: 'Exam Countdown',
    title: 'Cambridge Exam Countdown 2026 — Live Countdown Timer | LevelHubAI',
    metaDesc: 'Live countdown widgets and revision pacing timers for Cambridge May/June and Oct/Nov exam sessions with daily milestones.',
    badge: 'Exam Simulation',
    icon: Zap,
    color: '#EA580C',
    headline: 'Live Cambridge Exam Session Countdown',
    subheadline: 'Stay focused and track exact days, hours, and minutes remaining until your Cambridge exam papers begin.',
    keyFeatures: [
      { title: 'Live Second-by-Second Countdown', desc: 'Real-time countdown widgets for May/June and October/November Cambridge sessions.' },
      { title: 'Subject-Level Paper Timers', desc: 'Track individual countdowns for Paper 1, Paper 2, and Alternative to Practical (ATP) papers.' },
      { title: 'Revision Pacing Alerts', desc: 'Visual reminders indicating when to switch from topical questions to full-length timed mocks.' },
      { title: 'Daily Milestone Badges', desc: 'Keep streaks alive as you complete practice sessions leading up to exam day.' },
    ],
    curriculumCoverage: ['Cambridge IGCSE Sessions', 'Cambridge O Level Sessions', 'Cambridge International AS & A Level Series'],
    faqs: [
      { q: 'How accurate are the exam countdown timers?', a: 'Timers are synchronized to the official Cambridge examination timetable schedules for Zone 3 and Zone 4.' },
      { q: 'Can I save countdowns to my student dashboard?', a: 'Yes, signing into your free account pins your active subject countdowns right onto your Command Center.' },
    ],
  },
  'flashcard-maker': {
    slug: 'flashcard-maker',
    name: 'Flashcard Maker',
    title: 'Smart Cambridge Spaced-Repetition Flashcard Maker | LevelHubAI',
    metaDesc: 'Create and review smart flashcards for Cambridge definitions, chemical formulas, and equations with active recall algorithms.',
    badge: 'Active Recall Tool',
    icon: Layers,
    color: '#C026D3',
    headline: 'Master Cambridge Definitions with Smart Flashcards',
    subheadline: 'Supercharge your memory with spaced repetition flashcards for tricky formulas, organic chemistry reactions, and examiner definitions.',
    keyFeatures: [
      { title: 'Spaced Repetition Algorithm', desc: 'Cards you find challenging reappear more frequently to ensure long-term memory retention.' },
      { title: 'Pre-loaded Cambridge Decks', desc: 'Instant access to verified flashcard decks for Physics formulas, Chemistry equations, and Biology terms.' },
      { title: 'Custom Deck Builder', desc: 'Create your own custom cards with LaTeX equations, diagrams, and quick notes.' },
      { title: 'Mobile Friendly Flip Mode', desc: 'Review flashcards on any mobile device, tablet, or desktop during daily commutes.' },
    ],
    curriculumCoverage: ['Physics 5054 / 0625 / 9702 Formulas', 'Chemistry 5070 / 0620 / 9701 Equations', 'Biology 5090 / 0610 / 9700 Definitions', 'Maths 4024 / 0580 / 9709 Formulae'],
    faqs: [
      { q: 'How does spaced repetition help in Cambridge exams?', a: 'Spaced repetition combats the forgetting curve, ensuring you retain word-for-word keywords for Paper 2 and Paper 4.' },
      { q: 'Can I create unlimited custom flashcards?', a: 'Yes, students can create unlimited subject decks and flashcards in the Quick Access hub.' },
    ],
  },
  'formula-sheet-hub': {
    slug: 'formula-sheet-hub',
    name: 'Formula Sheet Hub',
    title: 'Official Cambridge Formula Sheets (Maths, Physics, Chemistry) | LevelHubAI',
    metaDesc: 'Download free printable Cambridge formula sheets for O Level, IGCSE & A Level Mathematics, Physics, and Chemistry syllabi.',
    badge: 'Curriculum Sheets',
    icon: FileCode2,
    color: '#2563EB',
    headline: 'Cambridge Syllabus Formula Sheets Hub',
    subheadline: 'Verified formula cheat-sheets for Mathematics, Physics, and Chemistry formatted strictly to official Cambridge syllabus standards.',
    keyFeatures: [
      { title: '100% Cambridge Syllabus Aligned', desc: 'Contains all mandatory formulae required for O Level 4024, IGCSE 0580, and A Level 9709.' },
      { title: 'Physics Constant & Unit Tables', desc: 'Includes SI units, standard constants, mechanics formulae, and wave equation sheets.' },
      { title: 'Organic Chemistry Reaction Maps', desc: 'Clear visual maps of homologous series, reagents, conditions, and color changes.' },
      { title: 'Downloadable Clean PDFs', desc: 'Designed for quick offline revision and clean A4 wall printing.' },
    ],
    curriculumCoverage: ['Mathematics (4024 / 0580 / 9709)', 'Physics (5054 / 0625 / 9702)', 'Chemistry (5070 / 0620 / 9701)', 'Computer Science (2210 / 0478 / 9618)'],
    faqs: [
      { q: 'Are these formula sheets up-to-date for 2026 exams?', a: 'Yes, all sheets are verified against the latest Cambridge International examination syllabi.' },
      { q: 'Can I download and print these for offline revision?', a: 'Yes, high-resolution PDF downloads are available free inside the student portal.' },
    ],
  },
  'keyword-definition-lists': {
    slug: 'keyword-definition-lists',
    name: 'Keyword & Definition Lists',
    title: 'Mandatory Cambridge Examiner Keyword & Definition Glossaries | LevelHubAI',
    metaDesc: 'Master list of word-for-word Cambridge definitions and keywords required by examiners for full marks in structured papers.',
    badge: 'Examiner Glossary',
    icon: Tag,
    color: '#0D9488',
    headline: 'Cambridge Examiner Keyword & Definition Lists',
    subheadline: 'Learn the exact word-for-word scientific and mathematical definitions required by Cambridge mark schemes to secure full marks.',
    keyFeatures: [
      { title: 'Exact Mark Scheme Phrasing', desc: 'Highlighted bold keywords that examiners require to award marking points in Paper 2 & 4.' },
      { title: 'Common Pitfalls & Banned Words', desc: 'Learn which ambiguous terms lose marks according to Cambridge examiner reports.' },
      { title: 'Subject-by-Subject Categorization', desc: 'Search terms across Physics, Chemistry, Biology, Economics, and Computer Science.' },
      { title: 'Interactive Search & Filter', desc: 'Instantly find any term or unit definition in under 2 seconds.' },
    ],
    curriculumCoverage: ['Biology Terminology & Physiology', 'Physics Definitions & Laws', 'Chemistry Principles & Trends', 'Economics Terms & Elasticities'],
    faqs: [
      { q: 'Why are exact definitions important in Cambridge exams?', a: 'Cambridge mark schemes specifically underline compulsory keywords. Missing even one keyword can forfeit the entire mark.' },
      { q: 'How often are the glossaries updated?', a: 'Our curriculum team cross-references recent examiner reports every exam session.' },
    ],
  },
  'past-paper-finder': {
    slug: 'past-paper-finder',
    name: 'Past Paper Finder',
    title: '10-Year Cambridge Past Paper Finder (O Level, IGCSE, A Level) | LevelHubAI',
    metaDesc: 'Search and download 10 years of Cambridge past papers, mark schemes, and examiner reports organized by year, season, and component.',
    badge: 'Past Papers Search',
    icon: Search,
    color: '#0D9488',
    headline: 'Instant Cambridge Past Paper Finder',
    subheadline: 'Access 10+ years of Cambridge O Level, IGCSE, and A Level question papers, mark schemes, and grade thresholds in one search.',
    keyFeatures: [
      { title: '10 Years of Cambridge Papers', desc: 'Complete archives from 2015–2025 across May/June and Oct/Nov examination sessions.' },
      { title: 'Question Paper + Mark Scheme Pairing', desc: 'One-click toggle between question papers and official marking guidelines.' },
      { title: 'Variant & Component Filtering', desc: 'Quickly find Paper 11, 12, 21, 22, 41, or 42 based on your school registration zone.' },
      { title: 'Topical Question Breakdown', desc: 'Connect past papers directly with LevelHubAI topical quizzes and video explanations.' },
    ],
    curriculumCoverage: ['Cambridge O Level (All Subjects)', 'Cambridge IGCSE (All Subjects)', 'Cambridge International AS & A Level (All Subjects)'],
    faqs: [
      { q: 'Are all mark schemes and examiner reports included?', a: 'Yes, each question paper includes its corresponding mark scheme, grade threshold table, and examiner report.' },
      { q: 'Is there a limit on how many papers I can download?', a: 'No, past paper searches and downloads are completely unlimited.' },
    ],
  },
};

export const PublicResourceSeoPage: React.FC = () => {
  const { toolSlug } = useParams<{ toolSlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fallback to timetable builder if slug is invalid or empty
  const activeSlug = (toolSlug && SEO_TOOLS_DATA[toolSlug]) ? toolSlug : 'exam-timetable-builder';
  const tool = SEO_TOOLS_DATA[activeSlug];
  const Icon = tool.icon;

  const handleLaunchInDashboard = () => {
    if (user) {
      navigate(`/quick-access/${tool.slug}`);
    } else {
      navigate(`/auth?redirect=/quick-access/${tool.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Helmet>
        <title>{tool.title}</title>
        <meta name="description" content={tool.metaDesc} />
        <meta property="og:title" content={tool.title} />
        <meta property="og:description" content={tool.metaDesc} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://levelhub.ai/tools/${tool.slug}`} />
      </Helmet>

      {/* Public Landing Navbar */}
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Top Breadcrumb & Hero */}
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/tools" className="hover:text-foreground">Free Study Tools</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{tool.name}</span>
          </div>

          {/* Hero Banner Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-teal-500/30 text-white shadow-2xl relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase mb-4">
                <Icon className="w-4 h-4" />
                <span>{tool.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {tool.headline}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl">
                {tool.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={handleLaunchInDashboard}
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm px-8 h-12 rounded-2xl shadow-lg gap-2 group"
                >
                  <span>Launch in Student Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>100% Free • Cambridge CAIE Aligned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Breakdown */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Designed For Cambridge High Achievers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Engineered to meet the exact standards of Cambridge International syllabi and examiner reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tool.keyFeatures.map((feat, idx) => (
                <Card key={idx} className="p-6 rounded-2xl border-border bg-card hover:border-teal-500/40 transition-all shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Syllabus & Curriculum Coverage */}
          <div className="p-8 rounded-3xl bg-muted/40 border border-border mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Syllabus Coverage
                </div>
                <h3 className="text-xl font-bold text-foreground">Supported Cambridge Qualifications</h3>
                <p className="text-xs text-muted-foreground mt-1">Full coverage across all major Cambridge CAIE examination series.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tool.curriculumCoverage.map((curr, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-xs rounded-xl font-medium">
                    {curr}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access CTA Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 via-background to-purple-500/10 border-2 border-teal-500/30 text-center space-y-4 mb-16 shadow-lg">
            <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto" />
            <h3 className="text-2xl font-black text-foreground">
              Ready to Accelerate Your Revision?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Access {tool.name} directly inside the student portal along with AI tutors, past paper solutions, and personalized quizzes.
            </p>
            <div className="pt-2">
              <Button
                onClick={handleLaunchInDashboard}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-8 h-11 rounded-xl shadow-md"
              >
                Open in Student Dashboard
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-black text-foreground mb-6 text-center">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {tool.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-card border border-border">
                  <h4 className="text-sm font-bold text-foreground mb-1.5">{faq.q}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Tools Cross-Links */}
          <div className="border-t border-border pt-10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Explore More Free Cambridge Study Tools
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.values(SEO_TOOLS_DATA)
                .filter(t => t.slug !== activeSlug)
                .map((other) => {
                  const OtherIcon = other.icon;
                  return (
                    <Link
                      key={other.slug}
                      to={`/tools/${other.slug}`}
                      className="p-3.5 rounded-2xl bg-card border border-border hover:border-teal-500/40 hover:bg-muted/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                          <OtherIcon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">
                          {other.name}
                        </div>
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-2 flex items-center gap-1">
                        <span>Learn More</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      {/* Website Footer */}
      <Footer />
    </div>
  );
};
