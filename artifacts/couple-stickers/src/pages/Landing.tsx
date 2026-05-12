import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CinematicConversion } from "@/components/CinematicConversion";
import { HowItWorks } from "@/components/HowItWorks";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <CinematicConversion />
        <HowItWorks />
        <Gallery />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
