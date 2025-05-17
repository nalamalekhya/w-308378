import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { SignupForm } from "@/components/ui/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with back button */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <WaveformAnimation isActive={true} variant="recording" barCount={3} className="h-5 w-5 text-primary" />
            </div>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">EchoVoice</span>
            </Link>
          </div>
          
          <Button asChild variant="outline" size="sm" className="transition-colors hover:bg-primary/10">
            <Link to="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Form */}
            <div className="flex items-center justify-center">
              <SignupForm />
            </div>
            
            {/* Right side - Features */}
            <div className="hidden md:flex flex-col justify-center p-6 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">Create time capsules for your future self</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Record Voice Messages</h3>
                    <p className="text-foreground-muted">Capture your thoughts, goals, and reflections in your own voice.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Set Future Unlock Dates</h3>
                    <p className="text-foreground-muted">Choose when your message will become available to listen to.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Get Notifications</h3>
                    <p className="text-foreground-muted">Receive alerts when your time capsules unlock.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
