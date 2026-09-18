import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  Target, 
  Heart, 
  Award, 
  BookOpen,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "50,000+", label: "Active Students" },
  { value: "15,000+", label: "Practice Questions" },
  { value: "10", label: "Subjects Covered" },
  { value: "95%", label: "Success Rate" },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Making quality O-Level & IGCSE education accessible to every Pakistani student, regardless of their background.",
  },
  {
    icon: Heart,
    title: "Student-First",
    description: "Every feature we build is designed with students in mind, focused on making learning engaging and effective.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in content quality, ensuring alignment with Cambridge curriculum standards.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a supportive learning community where students help each other succeed together.",
  },
];

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Empowering Pakistani Students to{" "}
              <span className="text-gradient-primary">Excel</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              LevelHubAI, a product of Cybertrends SMC PVT LTD, is Pakistan's leading gamified learning platform for O-Level & IGCSE students. 
              We blend AI-powered tools with proven educational methodologies to make exam preparation 
              engaging, effective, and accessible.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className="bg-card rounded-2xl border border-border/50 p-6 text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Our Story */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent-foreground">Our Story</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Born from a Simple Idea
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  LevelHubAI was founded by a team of educators and technologists who saw a gap 
                  in quality O-Level & IGCSE preparation resources for Pakistani students.
                </p>
                <p>
                  Traditional tutoring was expensive and inconsistent. Online resources were scattered 
                  and often not aligned with the Cambridge curriculum. We knew there had to be a better way.
                </p>
                <p>
                  By combining gamification principles with rigorous academic content, we created a 
                  platform where learning doesn't feel like a chore—it feels like an adventure.
                </p>
              </div>
            </div>
            <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="relative z-10">
                <GraduationCap className="w-16 h-16 text-white mx-auto mb-6" />
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                  Join 50,000+ Students
                </h3>
                <p className="text-white/80 mb-6">
                  Start your journey to exam success today
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/auth">
                    Get Started Free
                    <Sparkles className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our <span className="text-gradient-primary">Values</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <div 
                  key={i}
                  className="bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-secondary/50 rounded-3xl p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of students already preparing for their exams with LevelHubAI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Create Free Account
                  <Sparkles className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/subjects">
                  Browse Subjects
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default AboutPage;
