import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Mic, Play, MessageCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

// Using a placeholder image URL instead of local import
const MAIN_HERO_IMAGE = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80";

export default function LandingPage() {
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "future self";
  
  useEffect(() => {
    if (isTyping) {
      const textLength = typedText.length;
      if (textLength < fullText.length) {
        const timeout = setTimeout(() => {
          setTypedText(fullText.substring(0, textLength + 1));
        }, 150); // Adjust typing speed here
        return () => clearTimeout(timeout);
      } else {
        // Start blinking cursor effect when typing is complete
        setIsTyping(false);
        // Restart typing animation after a pause
        const restartTimeout = setTimeout(() => {
          setTypedText("");
          setIsTyping(true);
        }, 3000); // Pause before restarting
        return () => clearTimeout(restartTimeout);
      }
    }
  }, [typedText, isTyping]);
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navbar with improved contrast and accessibility */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <WaveformAnimation isActive={true} variant="recording" barCount={3} className="h-5 w-5 text-primary" />
            </div>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">EchoVoice</span>
              <Badge variant="outline" className="ml-2 text-xs text-foreground-muted border-border">Time Capsule for Your Voice</Badge>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded-md px-2 py-1"
            >
              How It Works
            </a>
            <a 
              href="#testimonials" 
              className="text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded-md px-2 py-1"
            >
              Testimonials
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="hidden md:flex border-border text-foreground hover:bg-background-secondary hover:text-foreground transition-colors"
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button 
              asChild 
              size="sm" 
              className="hidden md:flex bg-primary hover:bg-primary-hover text-primary-foreground transition-colors"
            >
              <Link to="/signup">Sign up for Free</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with improved contrast and accessibility */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Left content */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <span className="mr-1">✨ New Feature:</span>
                <a 
                  href="/features" 
                  className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded-sm"
                >
                  Voice Memos
                  <ArrowRight className="ml-1 h-3 w-3" />
                </a>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Send messages to your{" "}
                <span className="inline-flex items-center text-primary">
                  <span className="relative">
                    {typedText}
                    <span 
                      className={`absolute right-[-4px] top-0 h-full w-[2px] bg-primary ${isTyping ? "animate-none" : "animate-blink"}`}
                      style={{ animationDuration: "0.8s" }}
                    ></span>
                  </span>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-foreground-muted max-w-xl">
                Record voice messages today that will be delivered to you in the future. Create time capsules of your thoughts, goals, and memories.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground transition-colors font-medium"
                >
                  <Link to="/signup" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Link to="/login">
                    Log In
                  </Link>
                </Button>
              </div>
              
              <div className="pt-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-rose-500"].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-medium border-2 border-background`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-foreground-muted">
                  <span className="font-medium text-foreground">5,000+</span> people already using EchoVoice
                </p>
              </div>
            </div>
            
            {/* Right content - Image with decorative elements */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-70 z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-70 z-0"></div>
              
              <div className="relative z-10 rounded-xl overflow-hidden border border-border shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80" 
                  alt="Beautiful mountain landscape" 
                  className="w-full h-[400px] object-cover rounded-xl" 
                  loading="eager"
                />
                
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-lg border border-border shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <WaveformAnimation isActive={true} variant="recording" barCount={3} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Recording in progress...</p>
                      <p className="text-xs text-foreground-muted">Unlock date: May 17, 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with improved contrast and accessibility */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 lg:px-12 bg-background-secondary border-y border-border">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground mb-4">
                How It Works
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Your voice, preserved in time
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                EchoVoice lets you send voice messages to your future self. It's like a time capsule for your thoughts, goals, and memories.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-16">
            {/* Feature 1 */}
            <ScrollReveal delay={100} direction="up">
              <div className="bg-background border border-border rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Record Your Voice</h3>
                <p className="text-foreground-muted">
                  Capture your thoughts, goals, or reflections in your own voice. Add context with mood tags and titles.
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-800 dark:text-blue-200">1</span>
                    </div>
                    <span className="text-sm text-foreground-muted">High-quality audio recording</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Feature 2 */}
            <ScrollReveal delay={200} direction="up">
              <div className="bg-background border border-border rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Set Future Unlock Date</h3>
                <p className="text-foreground-muted">
                  Choose when your message will become available. It could be next month, next year, or on a special date.
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">2</span>
                    </div>
                    <span className="text-sm text-foreground-muted">Flexible date selection</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Feature 3 */}
            <ScrollReveal delay={300} direction="up">
              <div className="bg-background border border-border rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
                  <Play className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Rediscover Later</h3>
                <p className="text-foreground-muted">
                  When the unlock date arrives, listen to messages from your past self and reflect on your journey.
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-800 dark:text-purple-200">3</span>
                    </div>
                    <span className="text-sm text-foreground-muted">Notification when unlocked</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary/20 bg-background text-primary hover:bg-primary/5 transition-colors"
              onClick={() => {
                const howItWorksSection = document.getElementById('how-it-works');
                if (howItWorksSection) {
                  howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span className="flex items-center gap-2">
                Learn more about our features
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-28 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center rounded-md border border-border bg-background-secondary px-3 py-1 text-sm font-medium text-foreground mb-4">
                Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                What our users are saying
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                Join thousands of people who use EchoVoice to create meaningful time capsules.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonial 1 */}
            <ScrollReveal delay={100} direction="up">
              <Card className="border-border bg-background h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold text-lg">
                      JD
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">John Doe</h4>
                      <p className="text-foreground-muted text-sm">Using EchoVoice since 2023</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-primary/20 pl-4 italic text-foreground-muted">
                    "I recorded a message for myself before a major career change. Listening to it a year later was incredibly powerful and reminded me why I made that decision."
                  </blockquote>
                </CardContent>
              </Card>
            </ScrollReveal>
            
            {/* Testimonial 2 */}
            <ScrollReveal delay={200} direction="up">
              <Card className="border-border bg-background h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-800 dark:text-green-200 font-bold text-lg">
                      AJ
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Alex Johnson</h4>
                      <p className="text-foreground-muted text-sm">Records weekly reflections</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-primary/20 pl-4 italic text-foreground-muted">
                    "The weekly reflections I've recorded have become a personal growth journal. Hearing my own voice describe challenges and victories is much more impactful than reading old notes."
                  </blockquote>
                </CardContent>
              </Card>
            </ScrollReveal>
            
            {/* Testimonial 3 */}
            <ScrollReveal delay={300} direction="up">
              <Card className="border-border bg-background h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-800 dark:text-purple-200 font-bold text-lg">
                      SL
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Sarah Lin</h4>
                      <p className="text-foreground-muted text-sm">Uses EchoVoice for monthly reflections</p>
                    </div>
                  </div>
                  <blockquote className="mt-4 border-l-4 border-primary/20 pl-4 italic text-foreground-muted">
                    "I've been recording monthly reflections for the past year, and listening to them has become a powerful ritual. It's like having a conversation with my past self."
                  </blockquote>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-12 bg-background-secondary border-y border-border">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <span className="text-5xl font-bold text-primary block mb-2">10,000+</span>
                <span className="text-foreground-muted">Messages Recorded</span>
              </div>
              <div>
                <span className="text-5xl font-bold text-primary/90 block mb-2">98%</span>
                <span className="text-foreground-muted">User Satisfaction</span>
              </div>
              <div>
                <span className="text-5xl font-bold text-primary/80 block mb-2">5,000+</span>
                <span className="text-foreground-muted">Messages Delivered</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-12 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your journey?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
              Create your first echo today and begin sending messages to your future self.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-background text-primary hover:bg-background/90 font-medium"
            >
              <Link to="/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-12 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-foreground">EchoVoice</h3>
              <p className="text-foreground-muted">Send messages to your future self</p>
            </div>
            <div className="flex gap-8">
              <button 
                onClick={() => alert('About EchoVoice: A voice time capsule app that allows you to send messages to your future self.')}
                className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-inherit"
              >
                About
              </button>
              <button 
                onClick={() => alert('Privacy Policy: EchoVoice respects your privacy and protects your personal data. We only collect information necessary to provide our services.')}
                className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-inherit"
              >
                Privacy
              </button>
              <button 
                onClick={() => alert('Terms of Service: By using EchoVoice, you agree to our terms of service. Please use the platform responsibly.')}
                className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-inherit"
              >
                Terms
              </button>
              <button 
                onClick={() => alert('Contact Us: For support or inquiries, please email us at support@echovoice.com')}
                className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-inherit"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-foreground-muted">
            <p>© 2025 EchoVoice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
