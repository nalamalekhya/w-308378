
import React, { useState, useRef, useEffect } from "react";
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
  const [duration, setDuration] = useState(0);
  const [reflection, setReflection] = useState("");
  
  // Reference to the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Mock echo data - in a real app, fetch from a database
  const echo = {
    id: parseInt(id || "1"),
    title: "Reflection on my goals",
    createdAt: new Date("2025-05-05"),
    unlockDate: new Date("2025-05-12"),
    duration: "2:45",
    mood: "motivated",
    isLocked: false,
    // Using a sample audio file from a CDN for testing
    audioSrc: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  };
  
  // Create audio element on component mount
  useEffect(() => {
    // Create audio element
    const audio = new Audio(echo.audioSrc);
    audioRef.current = audio;
    
    // Set up event listeners
    const updateProgressHandler = () => updateProgress();
    const loadedMetadataHandler = () => {
      setDuration(audio.duration);
      console.log('Audio duration loaded:', audio.duration);
    };
    const endedHandler = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
    
    audio.addEventListener('timeupdate', updateProgressHandler);
    audio.addEventListener('loadedmetadata', loadedMetadataHandler);
    audio.addEventListener('ended', endedHandler);
    
    // Preload the audio
    audio.load();
    
    return () => {
      // Clean up event listeners
      audio.removeEventListener('timeupdate', updateProgressHandler);
      audio.removeEventListener('loadedmetadata', loadedMetadataHandler);
      audio.removeEventListener('ended', endedHandler);
      audio.pause();
    };
  }, [echo.audioSrc]);
  
  // Update progress function for timeupdate event
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      console.log('Current time updated:', audioRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Play the audio and handle any errors
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            // Handle the error appropriately
          });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    // Update audio element time
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
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
                <div className="relative w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration || 165} // Fallback to 165 seconds (2:45) if duration not loaded yet
                    value={currentTime}
                    onChange={handleTimeUpdate}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    step="0.1"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-echo-present rounded-lg pointer-events-none" 
                    style={{ width: `${(currentTime / (duration || 165)) * 100}%` }}
                  />
                </div>
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
