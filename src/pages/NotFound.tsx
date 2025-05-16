
import React from "react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-echo-light dark:bg-gradient-echo p-6">
      <div className="glass-card p-8 md:p-12 max-w-md w-full text-center">
        <div className="h-20 w-20 mx-auto mb-6 bg-echo-light dark:bg-echo-past/30 rounded-full flex items-center justify-center">
          <WaveformAnimation />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl mb-6">This echo has been lost in time</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        
        <Button asChild className="bg-echo-present hover:bg-echo-past text-white">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
