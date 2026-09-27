import React from "react";
import { Star, Quote, HeartHandshake, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Hassan",
    role: "O-Level Student, Karachi",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    rating: 5,
    text: "LevelHubAI made O-Level Math actually fun! I went from dreading Cambridge exams to looking forward to daily practice. My O-Level grades improved from C to A* in 3 months.",
  },
  {
    name: "Fatima Khan",
    role: "O-Level Student, Lahore",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    rating: 5,
    text: "The gamified O-Level prep kept me motivated throughout. Competing with friends on past papers made O-Level revision feel like a game, not a chore.",
  },
  {
    name: "Ayesha Tariq",
    role: "IGCSE Student, Islamabad",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha",
    rating: 5,
    text: "LevelHubAI's IGCSE resources are exactly what I needed. The AI tutor explains tough IGCSE Physics topics in a way my school teacher never could. Scored an A* in my mocks!",
  },
  {
    name: "Hamza Sheikh",
    role: "IGCSE Student, Karachi",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hamza",
    rating: 5,
    text: "As an IGCSE student, having past papers, AI-generated quizzes, and structured notes in one place is a game-changer. My IGCSE Chemistry jumped from a B to A* in two months.",
  },
  {
    name: "Sarah Ahmed",
    role: "O-Level Parent, Islamabad",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    text: "As an O-Level parent, I love the progress dashboard. I can track my child's Cambridge CIE prep and the weekly reports show exactly where they need help.",
  },
  {
    name: "Zain Malik",
    role: "O-Level Student, Rawalpindi",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zain",
    rating: 5,
    text: "The O-Level past papers with explanations are incredible. I finally understand Cambridge exam patterns. The AI tutor explains O-Level concepts better than any textbook.",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 relative bg-background text-foreground overflow-hidden" id="testimonials">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide uppercase">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>O-Level & IGCSE Success Stories</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Loved by O-Level & IGCSE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
              Students Across Pakistan
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Join thousands of Pakistani O-Level & IGCSE students who transformed their Cambridge exam prep with LevelHubAI.
          </p>
        </div>

        {/* Testimonials Grid (6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl p-7 border border-border hover:border-teal-500/40 transition-all duration-300 shadow-md relative overflow-hidden group flex flex-col justify-between hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 w-9 h-9 text-muted/20 pointer-events-none" />

              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                <p className="text-sm text-foreground mb-6 leading-relaxed relative z-10">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-border/80">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-2xl bg-muted/60 border border-border shadow-xs shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar (3 Stats Only, Skipping Schools Trust Us) */}
        <div className="mt-16 bg-card rounded-3xl p-8 border border-border shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[
              { value: "4.9/5", label: "Average Student Rating" },
              { value: "50K+", label: "Happy Cambridge Students" },
              { value: "95%", label: "Recommend LevelHubAI" },
            ].map((stat, i) => (
              <div key={i} className={i > 0 ? "pt-6 sm:pt-0 sm:pl-8" : ""}>
                <p className="font-display text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
