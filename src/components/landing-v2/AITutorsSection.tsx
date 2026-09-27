import React from 'react';
import { Bot, Sparkles, Star, BookOpen, CheckCircle2, ArrowRight, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const AI_TUTOR_PROFILES = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Lead Pure Mathematics & Mechanics Tutor',
    programmes: ['IGCSE 0580', 'O Level 4024', 'A Level 9709'],
    rating: '4.98 / 5.0',
    studentsCount: '12,400+ students assisted',
    specialty: 'Calculus, Trigonometry & Coordinate Geometry',
    quote: 'I break down multi-step integration and differentiation into guaranteed method marks according to Cambridge rubrics.',
    color: '#0D9488',
    avatar: '👩‍🏫',
  },
  {
    name: 'Prof. David Chen',
    role: 'Physical Sciences & Chemistry Specialist',
    programmes: ['IGCSE 0625/0620', 'O Level 5054/5070', 'A Level 9702/9701'],
    rating: '4.95 / 5.0',
    studentsCount: '9,850+ students assisted',
    specialty: 'Thermodynamics, Organic Mechanisms & Circuit Physics',
    quote: 'Never lose marks to ambiguous units or missing key terms. I ensure your reasoning is 100% compliant with examiner reports.',
    color: '#0284C7',
    avatar: '👨‍🔬',
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'Economics, Business & Humanities Specialist',
    programmes: ['IGCSE 0455', 'O Level 2281', 'A Level 9708', 'IB DP'],
    rating: '4.99 / 5.0',
    studentsCount: '8,200+ students assisted',
    specialty: 'Essay Evaluation, Micro/Macro Diagrams & Evaluative Conclusions',
    quote: 'Scoring Band 1 in Economics essays requires critical balance (AO3). I guide your evaluation point-by-point.',
    color: '#8B5CF6',
    avatar: '👩‍💼',
  },
  {
    name: 'Marcus Vance',
    role: 'Computer Science & Algorithm Coach',
    programmes: ['IGCSE 0478', 'O Level 2210', 'A Level 9618'],
    rating: '4.97 / 5.0',
    studentsCount: '7,150+ students assisted',
    specialty: 'Pseudocode, Data Structures, Logic Gates & Trace Tables',
    quote: 'From paper 1 theory to paper 2 pseudocode trace tables, I debug your logic against Cambridge test cases.',
    color: '#6366F1',
    avatar: '👨‍💻',
  },
];

export const AITutorsSection: React.FC = () => {
  return (
    <section id="ai-tutors" className="py-24 relative bg-card border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Bot className="w-3.5 h-3.5" />
            Specialist Cambridge Faculty
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-foreground">
            IGCSE, IB & A-Level Tutors, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Ready to Help You Excel
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Meet your dedicated AI subject study guides. Trained strictly on official Cambridge mark schemes, syllabus rubrics, and learning outcomes to give you immediate, personalized assistance.
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {AI_TUTOR_PROFILES.map((tutor, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl bg-background border border-border hover:border-teal-500/40 transition-all duration-300 shadow-lg hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2.5 rounded-2xl bg-muted/60 border border-border shadow-xs">
                      {tutor.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-foreground group-hover:text-teal-600 transition-colors">
                        {tutor.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{tutor.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{tutor.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tutor.programmes.map((prog, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border"
                    >
                      {prog}
                    </span>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic border-l-2 border-teal-500/40 pl-3 mb-4">
                  "{tutor.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{tutor.studentsCount}</span>
                <Link
                  to="/ai-tutor"
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>Chat With Tutor</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section Primary CTA as required */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-sm px-8 shadow-md shadow-teal-600/20">
            <Link to="/ai-tutor" className="flex items-center gap-2">
              <span>Browse IGCSE, IB & A-Level Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
