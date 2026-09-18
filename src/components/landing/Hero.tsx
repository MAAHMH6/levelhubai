import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-level/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-level/10 rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 right-20 animate-float">
        <div className="bg-card p-4 rounded-2xl shadow-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Achievement</p>
              <p className="font-display font-semibold text-foreground">Math Master!</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-40 left-20 animate-float" style={{ animationDelay: "2s" }}>
        <div className="bg-card p-4 rounded-2xl shadow-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">XP Earned</p>
              <p className="font-display font-semibold text-xp">+250 XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI-Powered Cambridge O Level, IGCSE & A Level Learning</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Ace Your Cambridge{" "}
          <span className="text-gradient-hero">O Level, IGCSE & A Level Exams</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          The AI-powered Cambridge O-Level & IGCSE learning platform. Practice past papers,
          get AI-generated notes and quizzes, and study every subject with a personal AI tutor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth">
              Start Learning Free
              <Sparkles className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <Link to="/subjects">
              <BookOpen className="w-5 h-5" />
              Explore Subjects
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
          {[
            { value: "50K+", label: "O-Level & IGCSE Students" },
            { value: "15K+", label: "Practice Questions" },
            { value: "95%", label: "Cambridge Pass Rate" },
            { value: "200+", label: "Cambridge Past Papers" },
          ].map((stat, i) => (
            <div key={i} className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
