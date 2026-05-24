import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import CreateYours from "@/pages/CreateYours";
import Admin from "@/pages/Admin";
import UploadPhotos from "@/pages/UploadPhotos";
import Payment from "@/pages/Payment";
import Contact from "@/pages/Contact";

interface Settings {
  announcementEnabled: boolean;
  announcementText: string;
}

function App() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/orders/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSettings({
            announcementEnabled: Boolean(data.announcementEnabled),
            announcementText: data.announcementText || "",
          });
        }
      })
      .catch((err) => console.error("Error loading settings in App:", err));
  }, []);

  const isExcludedPage = window.location.pathname.includes("/admin") || window.location.pathname.includes("/payment");
  const activeBanner = Boolean(settings?.announcementEnabled && settings?.announcementText && !isExcludedPage);

  useEffect(() => {
    if (activeBanner) {
      document.body.classList.add("has-announcement");
    } else {
      document.body.classList.remove("has-announcement");
    }
    // Clean up class on unmount
    return () => {
      document.body.classList.remove("has-announcement");
    };
  }, [activeBanner]);

  return (
    <TooltipProvider>
      {activeBanner && settings?.announcementText && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-[rgba(43,170,143,0.95)] via-[rgba(232,196,90,0.95)] to-[rgba(240,147,106,0.95)] shadow-[0_2px_10px_rgba(0,0,0,0.4)] overflow-hidden flex items-center select-none"
          style={{ height: "32px", backdropFilter: "blur(8px)" }}
        >
          <div className="overflow-hidden w-full flex">
            <div className="animate-marquee-right-to-left flex gap-16 select-none py-1 text-[11px] font-black uppercase tracking-widest text-slate-950 whitespace-nowrap">
              <span className="whitespace-nowrap">{Array(8).fill(settings.announcementText).join("  ✦  ")}</span>
              <span className="whitespace-nowrap">{Array(8).fill(settings.announcementText).join("  ✦  ")}</span>
            </div>
          </div>
        </div>
      )}
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/create" component={CreateYours} />
          <Route path="/upload" component={UploadPhotos} />
          <Route path="/payment" component={Payment} />
          <Route path="/admin" component={Admin} />
          <Route path="/contact" component={Contact} />
          <Route component={Landing} />
        </Switch>
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
