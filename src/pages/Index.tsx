import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Features } from "@/components/site/Features";
import { EventsPreview } from "@/components/site/EventsPreview";
import { CTA } from "@/components/site/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <EventsPreview />
      <CTA />
    </main>
  );
};

export default Index;
