import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import CreateYours from "@/pages/CreateYours";
import Admin from "@/pages/Admin";
import UploadPhotos from "@/pages/UploadPhotos";
import Payment from "@/pages/Payment";
import Contact from "@/pages/Contact";

function App() {
  return (
    <TooltipProvider>
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
