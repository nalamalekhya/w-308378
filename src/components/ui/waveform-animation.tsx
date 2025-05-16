
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type WaveformProps = {
  isActive?: boolean;
  barCount?: number;
  className?: string;
  variant?: "default" | "recording" | "playback";
};

export function WaveformAnimation({ 
  isActive = false, 
  barCount = 5,
  className,
  variant = "default"
}: WaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  // Generate random heights on initial render with more variation for aesthetics
  useEffect(() => {
    setHeights(Array.from({ length: barCount }, () => Math.random() * 18 + 14));
  }, [barCount]);

  // Regenerate heights when active state changes if in recording or playback mode
  // using smoother transitions and more natural wave patterns
  useEffect(() => {
    if (!isActive || variant === "default") return;
    
    const interval = setInterval(() => {
      setHeights(prev => prev.map((height, i) => {
        // More natural wave-like pattern with smoother transitions
        const baseHeight = variant === "recording" ? 16 : 18;
        const variance = variant === "recording" ? 10 : 8;
        const nextHeight = baseHeight + Math.sin(Date.now() * 0.001 + i * 0.5) * variance;
        
        // Smoother transition by limiting how much the height can change at once
        const maxChange = 4;
        const diff = nextHeight - height;
        const change = Math.max(-maxChange, Math.min(maxChange, diff));
        
        return height + change;
      }));
    }, 50); // More frequent but smaller updates for smoother animation
    
    return () => clearInterval(interval);
  }, [isActive, variant]);

  return (
    <div 
      className={cn(
        "waveform flex items-end justify-center gap-[2px]", 
        isActive && "waveform-active",
        variant === "recording" && "waveform-recording",
        variant === "playback" && "waveform-playback",
        className
      )}
    >
      {heights.map((height, i) => (
        <div 
          key={i} 
          className={cn(
            "waveform-bar w-1 rounded-sm transition-all duration-300",
            variant === "recording" && "bg-echo-accent", 
            variant === "playback" && "bg-echo-future",
            variant === "default" && "bg-current",
            isActive && "opacity-100",
            !isActive && "opacity-60"
          )} 
          style={{ 
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
            transform: isActive ? `scaleY(${0.9 + Math.sin(i * 0.8) * 0.2})` : 'scaleY(1)',
            transition: 'height 0.3s ease-in-out, transform 0.5s ease, opacity 0.3s ease'
          }}
        />
      ))}
    </div>
  );
}
