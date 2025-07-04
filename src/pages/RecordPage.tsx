
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, addMonths, addYears } from "date-fns";
import { CalendarIcon, Mic, MicOff, Play, Pause, ArrowLeft, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const moods = [
  { value: "happy", label: "😊 Happy" },
  { value: "reflective", label: "🤔 Reflective" },
  { value: "excited", label: "🎉 Excited" },
  { value: "grateful", label: "🙏 Grateful" },
  { value: "calm", label: "😌 Calm" },
  { value: "anxious", label: "😰 Anxious" },
  { value: "inspired", label: "💡 Inspired" },
  { value: "nostalgic", label: "🕰️ Nostalgic" },
];

type FormValues = {
  title: string;
  mood: string;
  unlockDate: Date;
};

export default function RecordPage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      mood: "",
      unlockDate: addMonths(new Date(), 1),
    },
  });

  // Reset recording state when component mounts
  useEffect(() => {
    // Reset all recording-related state
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPlaying(false);
    setIsSubmitting(false);
    
    // Reset audio element if it exists
    if (audioRef.current) {
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    // Reset form with default values
    form.reset({
      title: "",
      mood: "",
      unlockDate: addMonths(new Date(), 1),
    });
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear any existing media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    
    // Check if browser supports audio recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser doesn't support audio recording");
      return;
    }
  }, [form]);

  // Check for microphone permission
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // First check if permission is already granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        if (hasMicrophone) {
          // Try to get access to the microphone
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // If successful, set permission to true
          setRecordingPermission(true);
          // Release the stream immediately since we're just checking permission
          stream.getTracks().forEach(track => track.stop());
        } else {
          setRecordingPermission(false);
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setRecordingPermission(false);
      }
    };
    
    checkMicrophonePermission();
  }, []);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Request microphone permission when the user clicks the record button
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setRecordingPermission(true);
      
      // Create a new MediaRecorder with better audio quality
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up data collection
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording completion
      mediaRecorder.onstop = () => {
        // Create audio blob from collected chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create audio element for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        } else {
          const audio = new Audio(audioUrl);
          audio.addEventListener('ended', () => setIsPlaying(false));
          audioRef.current = audio;
        }
        
        // Suggest a title based on the current date
        const now = new Date();
        const suggestedTitle = `Echo from ${format(now, 'MMMM d')}`;
        form.setValue('title', suggestedTitle);
        
        // Show a toast to guide the user
        toast.success("Recording complete! Now tell us how you're feeling.");
      };
      
      // Start recording with 10ms timeslice for more frequent ondataavailable events
      mediaRecorder.start(10);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Show a toast to indicate recording has started
      toast.info("Recording started! Click the stop button when you're finished.");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
      setRecordingPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        
        // Stop all audio tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
      } catch (error) {
        console.error("Error stopping recording:", error);
        toast.error("There was a problem stopping the recording.");
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Listen for audio ended event
  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioBlob]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data: FormValues) => {
    if (!audioBlob) {
      toast.error("Please record an audio message first");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("You must be logged in to save an echo");
      }
      
      // First upload the audio file to Supabase storage
      const fileExt = "wav";
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('echoes')
        .upload(filePath, audioBlob, {
          contentType: 'audio/wav'
        });
      
      if (uploadError) {
        throw new Error(`Error uploading audio: ${uploadError.message}`);
      }
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('echoes')
        .getPublicUrl(filePath);
      
      const audioUrl = publicUrlData.publicUrl;
      
      // Insert record into echoes table
      const { error: insertError } = await supabase
        .from('echoes')
        .insert({
          user_id: user.id,
          title: data.title,
          audio_url: audioUrl,
          duration: recordingTime,
          mood: data.mood,
          unlock_date: data.unlockDate.toISOString(),
          unlocked: false
        });
      
      if (insertError) {
        throw new Error(`Error saving echo: ${insertError.message}`);
      }
      
      toast.success("Echo sent to your future self!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving echo:", error);
      toast.error(error.message || "Failed to save your echo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-steel-primary to-steel-secondary text-white py-6 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard")}
                className="text-white hover:bg-white/10 mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <span className="ml-2 font-semibold text-lg">New Echo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
            <>
              {/* Recording Interface */}
              <div className="w-full max-w-md mb-8">
                <div className="relative">
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div 
                      className={cn(
                        "mb-8 h-32 w-full flex items-center justify-center",
                        audioBlob && !isRecording ? "opacity-100" : "opacity-80"
                      )}
                    >
                      <WaveformAnimation 
                        isActive={isRecording || isPlaying}
                        barCount={12}
                        variant={isRecording ? "recording" : (isPlaying ? "playback" : "default")}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="text-2xl font-medium mb-6">
                      {formatTime(recordingTime)}
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {audioBlob && !isRecording ? (
                        <>
                          <Button 
                            onClick={togglePlayback} 
                            size="lg"
                            variant="outline"
                            className={cn(
                              "h-16 w-16 rounded-full",
                              isPlaying ? "bg-muted text-foreground" : "bg-steel-primary text-white hover:bg-steel-secondary"
                            )}
                          >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                          </Button>
                          
                          {/* Re-record button */}
                          <Button
                            onClick={() => {
                              setAudioBlob(null);
                              setRecordingTime(0);
                              if (audioRef.current) {
                                audioRef.current.src = '';
                              }
                            }}
                            variant="ghost"
                          >
                            Record Again
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center",
                            isRecording 
                              ? "bg-destructive hover:bg-destructive/90" 
                              : "bg-dusty-rose hover:bg-dusty-rose/90"
                          )}
                        >
                          {isRecording ? (
                            <Circle className="h-5 w-5 fill-white" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      {!audioBlob && !isRecording && "Speak to your future self..."}
                      {isRecording && "Recording in progress..."}
                      {audioBlob && !isRecording && "Preview your echo before sending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Entry Details Form - Show with animation when recording is complete */}
              {audioBlob && !isRecording && (
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-fadeIn">
                  <h3 className="text-lg font-medium mb-4">Echo Details</h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What would you call this moment?" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How are you feeling?</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a mood" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {moods.map((mood) => (
                                  <SelectItem key={mood.value} value={mood.value}>
                                    {mood.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unlockDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>When should this unlock?</FormLabel>
                            <div className="flex flex-col gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                  <div className="flex border-t p-3 gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => field.onChange(addMonths(new Date(), 1))}
                                      className="flex-1"
                                    >
                                      1 Month
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => field.onChange(addMonths(new Date(), 6))}
                                      className="flex-1"
                                    >
                                      6 Months
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => field.onChange(addYears(new Date(), 1))}
                                      className="flex-1"
                                    >
                                      1 Year
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <div className="text-sm text-muted-foreground">
                                This entry will be locked until {field.value ? format(field.value, 'MMMM d, yyyy') : '...'}
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-echo-present hover:bg-echo-past"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving your echo...
                          </>
                        ) : (
                          'Send to future you'
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </>
        </div>
      </main>
    </div>
  );
}
