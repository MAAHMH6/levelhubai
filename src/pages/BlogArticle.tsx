import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { blogArticles as legacyArticles, getArticleBySlug } from "@/data/blogArticles"; // Keep for GenericArticle legacy fallback
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { formatSubjectSlug } from "@/lib/utils";

const typographyClasses = `
  prose prose-lg max-w-none dark:prose-invert
  prose-headings:font-display prose-headings:text-foreground
  prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:font-bold prose-h1:mb-8 prose-h1:mt-2
  prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border prose-h2:pb-3
  prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
  prose-h4:text-xl prose-h4:font-bold prose-h4:mt-6 prose-h4:mb-3
  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
  prose-a:text-primary prose-a:font-medium prose-a:underline-offset-4 hover:prose-a:underline
  prose-strong:text-foreground prose-strong:font-semibold
  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2 prose-li:text-muted-foreground prose-li:marker:text-primary/70
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
`.trim().replace(/\s+/g, ' ');

function formatBlogContent(content: string): string {
  if (!content) return "";
  
  if (/<(p|h[1-6]|ul|ol|li|div|strong|em)>/i.test(content) && !/^#+\s/m.test(content)) {
    return content;
  }

  let html = content;

  html = html.replace(/^####\s+(.*$)/gim, '\n\n<h4>$1</h4>\n\n');
  html = html.replace(/^###\s+(.*$)/gim, '\n\n<h3>$1</h3>\n\n');
  html = html.replace(/^##\s+(.*$)/gim, '\n\n<h2>$1</h2>\n\n');
  html = html.replace(/^#\s+(.*$)/gim, '\n\n<h1>$1</h1>\n\n');
  
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  html = html.replace(/^\s*-\s+(.*$)/gim, '\n\n<ul><li>$1</li></ul>\n\n');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '\n\n<ol><li>$1</li></ol>\n\n');
  html = html.replace(/<\/ol>\s*<ol>/gim, '');

  html = html.split(/\n\n+/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|ul|ol|li|div|p)>/i.test(block)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br />')}</p>`;
  }).join('\n\n');

  return html;
}

// Article content map
const articleContent: Record<string, React.ReactNode> = {
  "olevel-study-guide": <OLevelStudyGuide />,
  "olevel-past-papers": <GenericArticle slug="olevel-past-papers" />,
  "how-to-get-a-star-in-olevel": <GenericArticle slug="how-to-get-a-star-in-olevel" />,
  "olevel-mathematics-tips": <GenericArticle slug="olevel-mathematics-tips" />,
  "olevel-exam-preparation-pakistan": <GenericArticle slug="olevel-exam-preparation-pakistan" />,
};

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted">
      <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="rounded-xl border border-border bg-card p-6 sticky top-24">
      <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Table of Contents</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function OLevelStudyGuide() {
  return (
    <div className={typographyClasses}>
      <h2 id="introduction" className="text-2xl font-bold mt-8 mb-4">Introduction to O-Levels</h2>
      <p>O-Level (Ordinary Level) examinations are one of the most important academic milestones for students following the Cambridge International curriculum. Whether you are a student in Karachi, Lahore, Islamabad, or anywhere else in Pakistan, O-Level exams are your gateway to academic excellence and future opportunities.</p>
      <p>O-Levels help students build strong academic foundations in subjects like <strong>Mathematics, Physics, Chemistry, Biology, English, ICT, Economics, Business Studies, Accounting, Urdu, and Islamiyat</strong>. For students in Pakistan, preparing for <strong>Cambridge O-Level exams</strong> requires the right strategy, quality study resources, and consistent practice with <strong>O-Level past papers</strong> and exam-style questions.</p>
      <p>This comprehensive <strong>O-Level study guide</strong> will help you understand how to prepare effectively, improve your grades, and succeed academically in your Cambridge O-Level examinations.</p>

      <h2 id="what-are-olevels" className="text-2xl font-bold mt-10 mb-4">What Are Cambridge O-Levels?</h2>
      <p>Cambridge O-Level qualifications are internationally recognized exams offered by <strong>Cambridge Assessment International Education</strong>. These exams are typically taken by students aged 14–16 and are widely accepted by universities, colleges, and employers worldwide.</p>
      <p>The <strong>Cambridge O-Level syllabus</strong> focuses on:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Conceptual understanding</strong> — deep learning beyond memorization</li>
        <li><strong>Analytical thinking</strong> — developing critical reasoning skills</li>
        <li><strong>Problem-solving skills</strong> — applying knowledge to real-world scenarios</li>
        <li><strong>Exam preparation</strong> — structured learning aligned with assessment objectives</li>
      </ul>
      <p>In Pakistan, O-Level examinations are conducted through the British Council and various Cambridge-affiliated schools. Students typically register for 7–9 subjects and take exams in the May/June or October/November sessions.</p>

      <h2 id="olevel-subjects" className="text-2xl font-bold mt-10 mb-4">O-Level Subjects</h2>
      <p>Students usually take multiple subjects as part of their O-Level qualification. Here is an overview of the most popular <strong>O-Level subjects</strong>:</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Mathematics</h3>
      <p><strong>O-Level Mathematics</strong> is a core subject that focuses on algebra, geometry, trigonometry, probability, and statistics. Strong mathematical skills are essential for science and engineering fields. Students should focus on practicing numerical problems daily and mastering formula application. <Link to="/subjects" className="text-primary hover:underline">Explore our Mathematics course →</Link></p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Physics</h3>
      <p><strong>O-Level Physics</strong> helps students understand fundamental laws of nature including motion, electricity, magnetism, waves, and energy. Physics requires both conceptual understanding and mathematical application. Practice with past paper questions is essential for scoring well.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Chemistry</h3>
      <p><strong>O-Level Chemistry</strong> focuses on atoms, molecules, chemical reactions, organic chemistry, and laboratory skills. Students should create summary notes for reactions and practice balancing equations regularly.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Biology</h3>
      <p><strong>O-Level Biology</strong> explores living organisms, human body systems, genetics, ecosystems, and biological processes. Diagram practice and understanding biological terminology are key to success.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level English Language</h3>
      <p><strong>O-Level English</strong> develops reading comprehension, essay writing, grammar, vocabulary, and communication skills. Regular reading and writing practice are essential for improving English scores.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level ICT</h3>
      <p><strong>O-Level ICT</strong> teaches computer systems, programming basics, databases, spreadsheets, and digital technologies. This subject combines theory with practical computing skills.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Business Studies & Economics</h3>
      <p><strong>O-Level Business Studies</strong> introduces entrepreneurship, marketing, finance, and business management concepts. <strong>O-Level Economics</strong> teaches supply and demand, economic systems, markets, and financial decision making. Both subjects require understanding of real-world applications.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">O-Level Accounting, Islamiyat, Pakistan Studies & Urdu</h3>
      <p><strong>O-Level Accounting</strong> focuses on financial records, bookkeeping, and financial statements. <strong>O-Level Islamiyat</strong> and <strong>O-Level Pakistan Studies</strong> are compulsory subjects for Pakistani students, covering Islamic history and the history and geography of Pakistan. <strong>O-Level Urdu</strong> develops language skills in Pakistan's national language.</p>

      <h2 id="how-to-prepare" className="text-2xl font-bold mt-10 mb-4">How to Prepare for O-Level Exams</h2>
      <p>Effective <strong>O-Level exam preparation</strong> requires a structured approach. Here are the key steps every student should follow:</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">1. Understand the Cambridge Syllabus</h3>
      <p>The first step to O-Level success is understanding the official <strong>Cambridge O-Level syllabus</strong> for each subject. The syllabus outlines topics to study, learning objectives, exam structure, and assessment methods. Students should always align their study plan with the syllabus to ensure complete coverage.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">2. Create a Study Schedule</h3>
      <p>A well-organized study schedule helps you manage your time effectively. Allocate specific hours for each subject, include regular breaks, and set weekly goals. Consistency is more important than long cramming sessions.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">3. Use Quality Study Resources</h3>
      <p>Invest in good textbooks, revision guides, and <strong>online learning platforms</strong> that provide structured content aligned with the Cambridge syllabus. Interactive resources with quizzes and practice questions make learning more engaging. <Link to="/features" className="text-primary hover:underline">See our learning features →</Link></p>

      <h2 id="study-strategies" className="text-2xl font-bold mt-10 mb-4">Best O-Level Study Strategies</h2>

      <h3 className="text-xl font-semibold mt-6 mb-3">Active Recall & Spaced Repetition</h3>
      <p>Instead of passive reading, test yourself regularly on what you've learned. Space out your revision sessions over days and weeks. This scientifically-proven technique dramatically improves long-term retention for <strong>O-Level revision</strong>.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Topic-Based Practice</h3>
      <p>Break each subject into individual topics and master them one by one. Use <strong>O-Level practice questions</strong> organized by topic to identify and strengthen weak areas. Our platform offers topic-based <strong>O-Level quiz practice</strong> for all major subjects.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Build Strong Conceptual Understanding</h3>
      <p>Memorization alone is not enough for O-Level exams. Focus on understanding core concepts. For example, Mathematics requires logical problem solving, Physics requires understanding formulas and their applications, and Chemistry requires knowledge of reactions and chemical processes.</p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Track Your Progress</h3>
      <p>Monitor your performance across subjects. Effective progress tracking includes monitoring quiz scores, reviewing incorrect answers, tracking topic completion, and analyzing exam readiness. <Link to="/auth" className="text-primary hover:underline">Start tracking your progress →</Link></p>

      <h2 id="past-papers" className="text-2xl font-bold mt-10 mb-4">Importance of O-Level Past Papers</h2>
      <p><strong>O-Level past papers</strong> are one of the most effective ways to prepare for Cambridge O-Level exams. They provide real exam experience and help you understand the examiner's expectations.</p>
      <p>Benefits of solving <strong>O-Level past papers</strong> include:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Understanding exam patterns and question types</li>
        <li>Practicing time management under exam conditions</li>
        <li>Identifying weak topics that need more revision</li>
        <li>Improving answer writing skills and exam technique</li>
        <li>Building confidence for the actual exam</li>
      </ul>
      <p>Students should solve past papers from previous years and review the <strong>marking schemes</strong> to understand how marks are awarded. Aim to complete at least 5–10 past papers per subject before your exam.</p>

      <h2 id="online-learning" className="text-2xl font-bold mt-10 mb-4">Online Learning for O-Levels</h2>
      <p>Modern students increasingly rely on <strong>O-Level online learning</strong> platforms for exam preparation. These platforms offer advantages that traditional methods cannot match.</p>
      <p>Benefits of online O-Level platforms include:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Structured learning paths</strong> aligned with the Cambridge syllabus</li>
        <li><strong>O-Level practice questions</strong> with instant feedback</li>
        <li><strong>AI tutors</strong> that provide personalized help</li>
        <li><strong>Leaderboards and gamification</strong> to keep you motivated</li>
        <li><strong>Progress analytics</strong> to track your improvement</li>
        <li><strong>O-Level mock exams</strong> that simulate real exam conditions</li>
      </ul>
      <p>LevelHubAI combines all these features to create the most effective <strong>O-Level preparation</strong> experience for students in Pakistan. <Link to="/pricing" className="text-primary hover:underline">View our plans →</Link></p>

      <h2 id="tips-a-star" className="text-2xl font-bold mt-10 mb-4">Tips to Score A* in O-Levels</h2>
      <p>Students aiming for top grades in their <strong>O-Level exams</strong> should follow these proven strategies:</p>
      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>Study consistently every day</strong> — even 1-2 hours of focused study daily beats weekend cramming</li>
        <li><strong>Solve past papers regularly</strong> — aim for at least 2-3 papers per week per subject</li>
        <li><strong>Understand concepts instead of memorizing</strong> — focus on the "why" behind every topic</li>
        <li><strong>Revise topics weekly</strong> — use spaced repetition to retain information</li>
        <li><strong>Practice exam-style questions</strong> — get comfortable with Cambridge question formats</li>
        <li><strong>Learn from mistakes</strong> — review every incorrect answer and understand why it was wrong</li>
        <li><strong>Stay organized with a study schedule</strong> — plan your revision well in advance</li>
        <li><strong>Use O-Level quiz practice</strong> — regular quizzes reinforce learning and build speed</li>
      </ol>
      <p>Consistency and practice are the keys to achieving excellent results in Cambridge O-Level examinations.</p>

      <h2 id="common-mistakes" className="text-2xl font-bold mt-10 mb-4">Common Mistakes O-Level Students Make</h2>
      <p>Many students struggle because of common mistakes that can be easily avoided:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Ignoring the syllabus</strong> — studying topics that aren't in the exam</li>
        <li><strong>Not solving enough past papers</strong> — missing out on the most effective preparation tool</li>
        <li><strong>Poor time management</strong> — not practicing under timed conditions</li>
        <li><strong>Last-minute cramming</strong> — trying to learn everything in the final week</li>
        <li><strong>Weak conceptual understanding</strong> — relying on rote memorization</li>
        <li><strong>Neglecting weak subjects</strong> — focusing only on subjects you enjoy</li>
        <li><strong>Not reviewing marking schemes</strong> — missing out on understanding how marks are awarded</li>
      </ul>
      <p>Avoiding these mistakes significantly improves <strong>O-Level exam</strong> performance and can be the difference between a B and an A*.</p>

      <h2 id="future-after" className="text-2xl font-bold mt-10 mb-4">The Future After O-Levels</h2>
      <p>After completing O-Levels, students usually continue their education through:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Cambridge A-Levels</strong> — the most common pathway for O-Level students</li>
        <li><strong>International Baccalaureate (IB)</strong> — an alternative international qualification</li>
        <li><strong>College foundation programs</strong> — bridging programs for university entry</li>
      </ul>
      <p>Strong O-Level grades open doors to top A-Level colleges in Pakistan such as Nixor College, Cedar College, Karachi Grammar School, and Lahore Grammar School. Internationally, good O-Level results are recognized by universities worldwide.</p>

      <h2 id="conclusion" className="text-2xl font-bold mt-10 mb-4">Final Thoughts</h2>
      <p>O-Level exams are a crucial step in every student's academic journey. With the right <strong>O-Level study strategy</strong>, consistent practice, and access to quality learning resources, students can achieve outstanding results in their Cambridge O-Level examinations.</p>
      <p>Whether you are preparing for <strong>O-Level Mathematics, Physics, Chemistry, Biology, English, ICT, Business Studies, Economics, Accounting, Islamiyat, Pakistan Studies, or Urdu</strong>, the key to success is disciplined learning and continuous improvement.</p>
      <p>Start preparing today, practice regularly with <strong>O-Level past papers</strong> and <strong>practice questions</strong>, and take your first step toward academic excellence in Cambridge O-Levels.</p>
    </div>
  );
}

function GenericArticle({ slug }: { slug: string }) {
  const article = getArticleBySlug(slug);
  if (!article) return null;

  const contentMap: Record<string, React.ReactNode> = {
    "olevel-past-papers": (
      <div className={typographyClasses}>
        <h2 id="introduction" className="text-2xl font-bold mt-8 mb-4">Why Past Papers Are Essential</h2>
        <p><strong>O-Level past papers</strong> are the single most effective tool for Cambridge exam preparation. They provide real exam questions from previous years, allowing you to practice under authentic conditions and understand exactly what the examiners expect.</p>
        <p>Studies show that students who regularly practice with past papers score significantly higher than those who only rely on textbook study. This is because past papers train your brain to recognize question patterns, manage time effectively, and apply knowledge under pressure.</p>
        <h2 id="strategy" className="text-2xl font-bold mt-10 mb-4">How to Use Past Papers Strategically</h2>
        <p>Don't just solve past papers randomly. Follow this proven strategy: Start by solving papers topic-by-topic, then move to full papers under timed conditions. Always review the marking scheme after completing each paper to understand how marks are awarded.</p>
        <p>For each subject, aim to complete at least 5-10 years of past papers before your exam. Focus especially on the most recent papers as they best reflect current exam trends.</p>
        <h2 id="marking-schemes" className="text-2xl font-bold mt-10 mb-4">Understanding Marking Schemes</h2>
        <p>Marking schemes reveal exactly how examiners award marks. Pay attention to method marks (M), accuracy marks (A), and communication marks (C). Understanding these helps you structure your answers to maximize your score.</p>
        <p>Ready to practice? <Link to="/subjects" className="text-primary hover:underline">Access past papers for all subjects →</Link></p>
      </div>
    ),
    "how-to-get-a-star-in-olevel": (
      <div className={typographyClasses}>
        <h2 id="mindset" className="text-2xl font-bold mt-8 mb-4">The A* Mindset</h2>
        <p>Scoring an A* in O-Levels isn't about being the smartest student — it's about being the most disciplined and strategic. Top scorers share common habits: they study consistently, practice actively, and learn from every mistake.</p>
        <h2 id="daily-habits" className="text-2xl font-bold mt-10 mb-4">Daily Habits of Top Scorers</h2>
        <p>Successful O-Level students maintain a strict study routine. They dedicate 2-3 hours daily to focused study, alternate between subjects to prevent burnout, and use active recall techniques instead of passive reading.</p>
        <h2 id="exam-technique" className="text-2xl font-bold mt-10 mb-4">Perfecting Your Exam Technique</h2>
        <p>A* students don't just know the content — they know how to present it. Practice writing concise, well-structured answers. Use diagrams where appropriate. Show all working in Mathematics and Science subjects. Time yourself rigorously during practice sessions.</p>
        <p>Start your A* journey today. <Link to="/auth" className="text-primary hover:underline">Join LevelHubAI for free →</Link></p>
      </div>
    ),
    "olevel-mathematics-tips": (
      <div className={typographyClasses}>
        <h2 id="overview" className="text-2xl font-bold mt-8 mb-4">O-Level Mathematics Overview</h2>
        <p><strong>O-Level Mathematics</strong> covers a wide range of topics including Number, Algebra, Geometry, Mensuration, Coordinate Geometry, Trigonometry, Vectors, Probability, and Statistics. The exam consists of two papers: Paper 1 (short-answer) and Paper 2 (structured questions).</p>
        <h2 id="topic-tips" className="text-2xl font-bold mt-10 mb-4">Topic-by-Topic Tips</h2>
        <p><strong>Algebra:</strong> Master factoring, simultaneous equations, and quadratic equations. Practice manipulating algebraic expressions until it becomes second nature.</p>
        <p><strong>Trigonometry:</strong> Memorize the key ratios (sin, cos, tan) and practice with right-angled and non-right-angled triangles. Know when to use the sine rule versus the cosine rule.</p>
        <p><strong>Statistics & Probability:</strong> Practice drawing and interpreting histograms, cumulative frequency curves, and box plots. Understand probability trees and conditional probability.</p>
        <h2 id="common-errors" className="text-2xl font-bold mt-10 mb-4">Common Errors to Avoid</h2>
        <p>The most common mistakes in O-Level Math include: not showing working (losing method marks), rounding too early in calculations, misreading graph scales, and forgetting units in mensuration questions.</p>
        <p>Practice Mathematics questions daily on <Link to="/subjects" className="text-primary hover:underline">LevelHubAI →</Link></p>
      </div>
    ),
    "olevel-exam-preparation-pakistan": (
      <div className={typographyClasses}>
        <h2 id="landscape" className="text-2xl font-bold mt-8 mb-4">O-Level Education in Pakistan</h2>
        <p>Pakistan has a thriving <strong>Cambridge O-Level</strong> education system with hundreds of affiliated schools across Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, and other major cities. O-Levels are considered a premium qualification that opens doors to the best A-Level colleges and universities.</p>
        <h2 id="registration" className="text-2xl font-bold mt-10 mb-4">Exam Registration in Pakistan</h2>
        <p>Students in Pakistan register for O-Level exams through the British Council or their Cambridge-affiliated school. Registration typically opens 6 months before the exam session. The two main sessions are May/June and October/November.</p>
        <h2 id="resources" className="text-2xl font-bold mt-10 mb-4">Best Resources for Pakistani Students</h2>
        <p>Pakistani O-Level students have access to excellent resources including local tuition centers, online platforms like LevelHubAI, past paper books, and Cambridge-approved textbooks. The key is choosing resources that align with the official Cambridge syllabus.</p>
        <p>Start your O-Level preparation with <Link to="/pricing" className="text-primary hover:underline">LevelHubAI's affordable plans →</Link></p>
      </div>
    ),
  };

  return contentMap[slug] || <p className="text-muted-foreground">Article content coming soon.</p>;
}

const tocMap: Record<string, { id: string; label: string }[]> = {
  "olevel-study-guide": [
    { id: "introduction", label: "Introduction to O-Levels" },
    { id: "what-are-olevels", label: "What Are Cambridge O-Levels?" },
    { id: "olevel-subjects", label: "O-Level Subjects" },
    { id: "how-to-prepare", label: "How to Prepare" },
    { id: "study-strategies", label: "Best Study Strategies" },
    { id: "past-papers", label: "Importance of Past Papers" },
    { id: "online-learning", label: "Online Learning" },
    { id: "tips-a-star", label: "Tips to Score A*" },
    { id: "common-mistakes", label: "Common Mistakes" },
    { id: "future-after", label: "Future After O-Levels" },
    { id: "conclusion", label: "Final Thoughts" },
  ],
  "olevel-past-papers": [
    { id: "introduction", label: "Why Past Papers Are Essential" },
    { id: "strategy", label: "How to Use Past Papers" },
    { id: "marking-schemes", label: "Understanding Marking Schemes" },
  ],
  "how-to-get-a-star-in-olevel": [
    { id: "mindset", label: "The A* Mindset" },
    { id: "daily-habits", label: "Daily Habits of Top Scorers" },
    { id: "exam-technique", label: "Perfecting Exam Technique" },
  ],
  "olevel-mathematics-tips": [
    { id: "overview", label: "Mathematics Overview" },
    { id: "topic-tips", label: "Topic-by-Topic Tips" },
    { id: "common-errors", label: "Common Errors to Avoid" },
  ],
  "olevel-exam-preparation-pakistan": [
    { id: "landscape", label: "O-Level Education in Pakistan" },
    { id: "registration", label: "Exam Registration" },
    { id: "resources", label: "Best Resources" },
  ],
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: article, isLoading } = useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) {
        console.error("Error fetching article:", error);
        return null;
      }
      return data;
    },
    enabled: !!slug
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-articles", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("*")
        .neq("slug", slug || "")
        .eq("published", true)
        .limit(3);
      return data || [];
    },
    enabled: !!slug
  });

  if (isLoading) {
    return <div className="min-h-screen pt-32 text-center text-muted-foreground">Loading article...</div>;
  }

  if (!article || !slug) return <Navigate to="/blog" replace />;

  const baseUrl = window.location.origin;
  const toc = tocMap[slug] || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": { "@type": "Organization", "name": "LevelHubAI" },
    "publisher": {
      "@type": "Organization",
      "name": "LevelHubAI",
      "url": baseUrl,
    },
    "mainEntityOfPage": `${baseUrl}/blog/${slug}`,
    "keywords": Array.isArray(article.keywords) ? article.keywords.join(", ") : "",
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `${baseUrl}/blog/${slug}` },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{article.meta_title || article.title}</title>
        <meta name="description" content={article.meta_description || article.excerpt} />
        <meta name="keywords" content={Array.isArray(article.keywords) ? article.keywords.join(", ") : ""} />
        <meta property="og:title" content={article.meta_title || article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${baseUrl}/blog/${slug}`} />
        <meta property="og:image" content={`${baseUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${baseUrl}/blog/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <ReadingProgress />

        {/* Breadcrumb */}
        <div className="pt-20 pb-4 bg-muted/30">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <header className="py-8 md:py-12 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Badge variant="outline" className="mb-4">{article.category}</Badge>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.read_time}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 max-w-6xl mx-auto">
            <article className="min-w-0">
              {article.content ? (
                <div className={typographyClasses} dangerouslySetInnerHTML={{ __html: formatBlogContent(article.content) }} />
              ) : (
                articleContent[slug]
              )}

              {/* CTA */}
              {article.program && article.subject ? (
                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 text-center">
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Continue your {article.program} {article.subject} preparation on LevelHubAI</h3>
                  <p className="text-muted-foreground mb-6">Join thousands of students mastering their curriculum with our interactive lessons and AI tutor.</p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to={article.program === "A Level" ? `/a-level/${formatSubjectSlug(article.subject)}` : `/subjects/${formatSubjectSlug(article.subject)}`}>
                      Explore {article.program} {article.subject} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 text-center">
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Start Practicing O-Level Questions for Free</h3>
                  <p className="text-muted-foreground mb-6">Join thousands of students using LevelHubAI to prepare for their Cambridge O-Level exams.</p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/auth">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              {toc.length > 0 && <TableOfContents items={toc} />}
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="py-12 bg-muted/20">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((a) => (
                  <Link key={a.slug} to={`/blog/${a.slug}`} className="group">
                    <article className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all">
                      <Badge variant="outline" className="mb-3 text-xs">{a.category}</Badge>
                      <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{a.excerpt}</p>
                    </article>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link to="/blog"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogArticle;
