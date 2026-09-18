import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Subjects } from "@/components/landing/Subjects";
import { StudentDashboard } from "@/components/landing/StudentDashboard";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Subjects />
      <StudentDashboard />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
};

export default Index;
