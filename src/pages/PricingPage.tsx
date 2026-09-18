import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Pricing } from "@/components/landing/Pricing";

const PricingPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
};

export default PricingPage;
