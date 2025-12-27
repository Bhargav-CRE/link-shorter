import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LinksList from "@/pages/LinksList";
import LinkAnalytics from "@/pages/LinkAnalytics";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/links" component={LinksList} />
              <Route path="/links/:alias" component={LinkAnalytics} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
