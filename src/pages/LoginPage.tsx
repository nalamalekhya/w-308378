import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import Index from "@/components/ui/travel-connect-signin-1";

export default function LoginPage() {
  const navigate = useNavigate();
  
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

      {/* Modern login component */}
      <div className="flex-1">
        <Index />
      </div>
    </div>
  );
}
