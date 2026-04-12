import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import Home from "@/pages/home";
import About from "@/pages/about";
import TutorialsPage from "@/pages/tutorials";
import TutorialDetail from "@/pages/tutorial-detail";
import UploadPage from "@/pages/upload";
import AdvisorPage from "@/pages/advisor";
import KitsPage from "@/pages/kits";
import CreatorDashboard from "@/pages/creator";
import FarmPlanPage from "@/pages/farm-plan";

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/tutorials" component={TutorialsPage} />
          <Route path="/tutorials/:id" component={TutorialDetail} />
          <Route path="/upload" component={UploadPage} />
          <Route path="/advisor" component={AdvisorPage} />
          <Route path="/kits" component={KitsPage} />
          <Route path="/creator" component={CreatorDashboard} />
          <Route path="/farm-plan" component={FarmPlanPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
