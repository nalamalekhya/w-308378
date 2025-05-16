
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import RecordPage from "./pages/RecordPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TimelinePage from "./pages/TimelinePage";
import AudioPlayerPage from "./pages/AudioPlayerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/echo/:id" element={<AudioPlayerPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
