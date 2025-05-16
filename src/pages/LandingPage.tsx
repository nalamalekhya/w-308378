import React from "react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 md:px-12 py-16 md:py-24 bg-gradient-echo-light dark:bg-gradient-echo overflow-hidden">
        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
            Send messages to your future self
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-md mx-auto md:mx-0">
            EchoVerse helps you capture thoughts, hopes, and reflections that your future self will cherish.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="bg-echo-present hover:bg-echo-past text-white">
              <Link to="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/login">
                Log In
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="md:w-1/2 flex justify-center px-8">
          <div className="relative w-full max-w-md">
            {/* Time capsule visualization */}
            <div className="glass-card p-8 rounded-2xl shadow-xl rotate-3 transform hover:rotate-0 transition-all duration-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-echo-past flex items-center justify-center">
                    <WaveformAnimation />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">Message from the Past</h3>
                    <p className="text-xs text-muted-foreground">March 12, 2025</p>
                  </div>
                </div>
              </div>
              
              <div className="py-4">
                <WaveformAnimation />
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">1:42</span>
                <Button variant="ghost" size="sm" className="text-echo-present">Play</Button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-4 h-24 w-24 bg-echo-accent/20 rounded-full blur-2xl animate-pulse-soft"></div>
            <div className="absolute -bottom-8 -left-4 h-32 w-32 bg-echo-past/30 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 gradient-text">How EchoVerse Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-echo-light dark:bg-echo-dark flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-echo-present">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Record</h3>
              <p className="text-muted-foreground">
                Capture an audio message as if speaking to your future self.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-echo-light dark:bg-echo-dark flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-echo-present">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Set a Date</h3>
              <p className="text-muted-foreground">
                Choose when in the future you want your message to be unlocked.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 rounded-full bg-echo-light dark:bg-echo-dark flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-echo-present">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Rediscover</h3>
              <p className="text-muted-foreground">
                When the time comes, receive your message from the past.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 md:px-12 bg-gradient-echo text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Begin Your Journey Through Time</h2>
          <p className="text-lg mb-8 opacity-90">
            Create your first audio time capsule today and start a conversation with your future self.
          </p>
          <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-echo-present">
            <Link to="/signup">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 md:px-12 bg-background border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <WaveformAnimation />
            <span className="ml-2 font-semibold text-lg">EchoVerse</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 EchoVerse - Audio Diaries for the Future You
          </div>
        </div>
      </footer>
    </div>
  );
}
