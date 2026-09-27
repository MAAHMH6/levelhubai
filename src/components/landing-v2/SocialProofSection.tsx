import React from 'react';
import { Users, Sparkles, Star, Quote, Award } from 'lucide-react';

const REVIEWS = [
  {
    quote: "The AI Examiner pointed out why I was only getting 3/5 on Chemistry electrolysis questions. Once I fixed the state symbols and cathode reasoning, I got full marks on my mock paper.",
    author: "Zainab M.",
    school: "Karachi Grammar School",
    badge: "O Level Chemistry 5070 (A*)",
  },
  {
    quote: "The past paper timer and automatic method marks completely transformed my speed. Solving Pure Math 9709 used to stress me out; now it feels like a daily game.",
    author: "Taimoor K.",
    school: "Lahore Grammar School",
    badge: "A Level Math 9709 (A*)",
  },
  {
    quote: "My parents loved being able to see my progress without nagging me every day. The printable weekly report showed them exactly what I solved.",
    author: "Aaliyah S.",
    school: "Dubai British School",
    badge: "IGCSE Extended (Straight A*s)",
  },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase mb-4">
            <Users className="w-3.5 h-3.5" />
            Verified Cambridge Candidate Community
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">500+ Students</span> Worldwide
          </h2>

          <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-3">
            "No More Groaning, Study Season."
          </p>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real Cambridge candidates preparing across Pakistan, the United Kingdom, UAE, and Singapore who turned exam anxiety into top percentile results.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl bg-card border border-border hover:border-teal-500/30 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-foreground leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-xs font-bold text-foreground">{rev.author}</div>
                <div className="text-[11px] text-muted-foreground">{rev.school}</div>
                <div className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 mt-1">
                  {rev.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
