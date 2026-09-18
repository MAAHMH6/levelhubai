import { 
  Gamepad2, 
  Brain, 
  Trophy, 
  Users, 
  BarChart3,
  Target,
  Flame
} from "lucide-react";

const features = [
  {
    icon: Gamepad2,
    title: "Gamified O-Level & IGCSE Learning",
    description: "Earn XP, unlock badges, level up on leaderboards. O-Level & IGCSE exam prep that feels like playing a game.",
    color: "bg-gradient-primary",
  },
  {
    icon: Brain,
    title: "AI O-Level & IGCSE Tutor",
    description: "Personalized O-Level & IGCSE learning paths with instant explanations for Cambridge CIE curriculum.",
    color: "bg-level",
  },
  {
    icon: Trophy,
    title: "O-Level & IGCSE Past Papers",
    description: "Complete Cambridge O-Level & IGCSE past papers from 2015-2024 with detailed solutions and timed mocks.",
    color: "bg-gradient-accent",
  },
  {
    icon: Users,
    title: "O-Level & IGCSE Study Groups",
    description: "Challenge O-Level & IGCSE friends, join study groups, and prepare together with peer competitions.",
    color: "bg-primary",
  },
  {
    icon: BarChart3,
    title: "O-Level & IGCSE Progress Tracking",
    description: "Track your O-Level & IGCSE performance with detailed insights, weak area alerts, and predicted grades.",
    color: "bg-streak",
  },
  {
    icon: Target,
    title: "Cambridge CIE Aligned",
    description: "100% aligned with Cambridge O-Level & IGCSE syllabus. Every question matches the exam format.",
    color: "bg-success",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Pakistan's Best O-Level & IGCSE Exam Prep</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything for O-Level & IGCSE{" "}
            <span className="text-gradient-primary">Success</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete O-Level & IGCSE exam preparation platform. Cambridge CIE curriculum aligned with gamified learning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Streak Banner */}
        <div className="mt-16 bg-gradient-hero rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}/>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Flame className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Daily Streak Challenge</span>
            </div>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Consistent, Win Big
            </h3>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Maintain your daily streak to unlock exclusive rewards, bonus XP, and special badges. 
              The longer your streak, the bigger your rewards!
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    day <= 5 ? "bg-white text-primary" : "bg-white/20 text-white"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
