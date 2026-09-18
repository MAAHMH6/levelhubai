import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Features } from "@/components/landing/Features";

const FeaturesPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Features />
      </div>
      <Footer />
    </main>
  );
};

export default FeaturesPage;
