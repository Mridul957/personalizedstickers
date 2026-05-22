import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CinematicConversion } from "@/components/CinematicConversion";
import { HowItWorks } from "@/components/HowItWorks";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";

export default function Landing() {
  useEffect(() => {
    // Only smooth-scroll to hash if user navigated here from another page on this site.
    // This prevents the page from auto-scrolling when directly loading the home page.
    const hash = window.location.hash;
    const fromSameSite = document.referrer && new URL(document.referrer).origin === window.location.origin;

    if (hash && fromSameSite) {
      const id = hash.substring(1);
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Clear the hash so refreshing doesn't re-trigger the scroll
        history.replaceState(null, "", window.location.pathname);
      }, 180);
      return () => clearTimeout(timer);
    } else if (hash) {
      // Remove stale hash from URL without scrolling
      history.replaceState(null, "", window.location.pathname);
    }
    return;
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Ambient background blobs using the palette */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Teal blob — top left */}
        <div className="blob-1 absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-35"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.7) 0%, transparent 70%)" }} />
        {/* Golden yellow blob — top right */}
        <div className="blob-2 absolute top-[5%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(232,196,90,0.6) 0%, transparent 70%)" }} />
        {/* Orange blob — mid left */}
        <div className="blob-3 absolute top-[45%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(240,147,106,0.6) 0%, transparent 70%)" }} />
        {/* Coral blob — bottom right */}
        <div className="blob-4 absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full opacity-22"
          style={{ background: "radial-gradient(circle, rgba(232,87,58,0.5) 0%, transparent 70%)" }} />
        {/* Dark teal blob — bottom left */}
        <div className="blob-2 absolute bottom-[15%] left-[30%] w-[400px] h-[400px] rounded-full opacity-18"
          style={{ background: "radial-gradient(circle, rgba(29,58,74,0.9) 0%, transparent 70%)" }} />
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
