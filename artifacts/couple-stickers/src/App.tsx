import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import CreateYours from "@/pages/CreateYours";
import Admin from "@/pages/Admin";

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/create" component={CreateYours} />
          <Route path="/admin" component={Admin} />
          <Route component={Landing} />
        </Switch>
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
