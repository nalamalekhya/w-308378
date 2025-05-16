
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { toast } from "sonner";
import { ArrowLeft, Pause, Play, Volume2 } from "lucide-react";
import { getMoodStyles, capitalize } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function AudioPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [reflection, setReflection] = useState("");
  
  // Mock echo data - in a real app, fetch from a database
  const echo = {
    id: parseInt(id || "1"),
    title: "Reflection on my goals",
    createdAt: new Date("2025-05-05"),
    unlockDate: new Date("2025-05-12"),
    duration: "2:45",
    mood: "motivated",
    isLocked: false,
    audioSrc: "/mock-audio.mp3", // This would be a real audio file path in production
  };
  
  const totalDuration = 165; // 2:45 in seconds
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, would control audio playback here
  };
  
  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
    // In a real implementation, would seek audio to the time
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSaveReflection = () => {
    if (reflection.trim()) {
      toast.success("Reflection saved");
      // In a real implementation, would save the reflection to a database
    } else {
      toast.error("Please enter a reflection");
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 md:px-12 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 hover:bg-transparent hover:text-echo-past"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{echo.title}</h1>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs ${getMoodStyles(echo.mood)}`}>
                  {capitalize(echo.mood)}
                </div>
                <span className="text-sm text-muted-foreground">
                  Created on {echo.createdAt.toLocaleDateString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Unlocked on {echo.unlockDate.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <Button 
                  onClick={handlePlayPause}
                  size="icon"
                  className="w-14 h-14 rounded-full bg-echo-present hover:bg-echo-past text-white mr-4"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>
              
              <div className="py-4">
                <WaveformAnimation 
                  isActive={isPlaying} 
                  variant="playback" 
                  barCount={24} 
                  className="h-16"
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  value={currentTime}
                  onChange={handleTimeUpdate}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm">{echo.duration}</span>
                <Button size="icon" variant="ghost" className="text-echo-present">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-lg font-medium mb-3">Your Reflection</h2>
            <p className="text-sm text-muted-foreground mb-3">
              How do you feel now that you've listened to your past self? Write down your thoughts.
            </p>
            <Textarea
              placeholder="Write your reflection here..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <Button onClick={handleSaveReflection} className="bg-echo-present hover:bg-echo-past text-white">
              Save Reflection
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
