import { Switch, Route, useLocation } from "wouter";
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
import CartPage from "@/pages/cart";
import PoliciesPage from "@/pages/policies";
import InfoPage from "@/pages/info-page";
import AuthRolePage from "@/pages/auth-role";
import { CreatorLoginPage, CreatorSignupPage, UserLoginPage, UserSignupPage } from "@/pages/auth-form-page";
import { CartProvider } from "@/lib/cart";
import AdminPage from "@/pages/admin";
import { FirebaseAuthProvider } from "@/lib/firebase-auth";

function Router() {
  const [location] = useLocation();
  const isAuthRoute = location === "/login" || location.startsWith("/login/") || location.startsWith("/signup/");

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      {!isAuthRoute && <Navbar />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/tutorials" component={TutorialsPage} />
          <Route path="/tutorials/:id" component={TutorialDetail} />
          <Route path="/upload" component={UploadPage} />
          <Route path="/advisor" component={AdvisorPage} />
          <Route path="/kits" component={KitsPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/creator" component={CreatorDashboard} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/farm-plan" component={FarmPlanPage} />
          <Route path="/login" component={AuthRolePage} />
          <Route path="/login/user" component={UserLoginPage} />
          <Route path="/login/creator" component={CreatorLoginPage} />
          <Route path="/signup/user" component={UserSignupPage} />
          <Route path="/signup/creator" component={CreatorSignupPage} />
          <Route path="/policies" component={PoliciesPage} />
          <Route path="/community-guidelines">
            <InfoPage
              title="Community Guidelines"
              description="Be respectful and constructive. Share safe, evidence-based organic farming practices and avoid harmful or misleading claims."
            />
          </Route>
          <Route path="/privacy-policy">
            <InfoPage
              title="Privacy Policy"
              description="Farmora uses your activity data to improve recommendations and product experiences. We do not sell your personal data."
            />
          </Route>
          <Route path="/terms-of-service">
            <InfoPage
              title="Terms of Service"
              description="By using Farmora, you agree to use the platform responsibly and understand that educational content is not a substitute for professional agronomy advice."
            />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </FirebaseAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
