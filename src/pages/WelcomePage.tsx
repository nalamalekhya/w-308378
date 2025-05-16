
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TutorialOverlay } from "@/components/onboarding/tutorial-overlay";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Get user profile on load
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("User authenticated:", user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }
          
          if (data?.first_name) {
            console.log("Profile data:", data);
            setUsername(data.first_name);
          } else {
            console.log("No profile data found for user");
          }
        } else {
          console.log("No authenticated user found, redirecting to login");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  // Show tutorial after a slight delay
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  const handleTutorialClose = () => {
    setShowTutorial(false);
  };
  
  const handleCreateFirstEcho = () => {
    navigate("/dashboard");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WaveformAnimation isActive />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-echo-light dark:bg-gradient-to-br dark:from-echo-past dark:to-echo-present/40 flex flex-col justify-center items-center p-6">
      <Navbar />
      <div className="max-w-md w-full text-center mt-16">
        <div className="h-24 w-24 bg-echo-light dark:bg-echo-dark rounded-full flex items-center justify-center mx-auto mb-8">
          <WaveformAnimation />
        </div>
        
        <h1 className="text-3xl font-bold mb-6 gradient-text">
          {username ? `Welcome to EchoVerse, ${username}` : "Welcome to EchoVerse"}
        </h1>
        
        <p className="mb-8 text-lg">
          You're all set up! Ready to create your first audio diary entry?
        </p>
        
        <Button onClick={handleCreateFirstEcho} className="mb-4 w-full bg-echo-present hover:bg-echo-past text-white">
          Create your first Echo
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowTutorial(true)} 
          className="w-full"
        >
          Show tutorial again
        </Button>
      </div>
      
      <TutorialOverlay isOpen={showTutorial} onClose={handleTutorialClose} />
    </div>
  );
}
