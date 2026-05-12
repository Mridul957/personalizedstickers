import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CinematicConversion } from "@/components/CinematicConversion";
import { HowItWorks } from "@/components/HowItWorks";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "hsl(252,30%,6%)" }}>
      {/* Global ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(147,51,234,0.6) 0%, transparent 70%)" }} />
        <div className="blob-2 absolute top-[30%] right-[-15%] w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute bottom-[-10%] left-[20%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
        <div className="blob-4 absolute top-[60%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(163,230,53,0.25) 0%, transparent 70%)" }} />
        <div className="blob-1 absolute top-[10%] right-[30%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
      </div>

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
