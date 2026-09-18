import { Star, Quote } from "lucide-react";

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

export const Testimonials = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-xp/10 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-xp fill-xp" />
            <span className="text-sm font-medium text-foreground">O-Level & IGCSE Success Stories</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Loved by O-Level & IGCSE{" "}
            <span className="text-gradient-primary">Students</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of Pakistani O-Level & IGCSE students who transformed their Cambridge exam prep with LevelHubAI.
          </p>
        </div>


        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-8 border border-border/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-xp fill-xp" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full bg-secondary"
                />
                <div>
                  <p className="font-display font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-card rounded-2xl p-8 border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4.9/5", label: "Average Rating" },
              { value: "50K+", label: "Happy Students" },
              { value: "95%", label: "Recommend Us" },
              { value: "500+", label: "Schools Trust Us" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
