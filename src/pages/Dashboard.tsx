import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { ArrowRight, Calendar, Clock, Plus, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get mood styles with improved contrast
const getMoodStyles = (mood: string) => {
  switch (mood) {
    case 'hopeful':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800';
    case 'motivated':
      return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200 border border-green-200 dark:border-green-800';
    case 'grateful':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-200 border border-purple-200 dark:border-purple-800';
    case 'ambitious':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800';
    case 'joyful':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-200 border border-rose-200 dark:border-rose-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-200 border border-gray-200 dark:border-gray-700';
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

type Echo = {
  id: string;
  title: string;
  created_at: string;
  unlock_date: string;
  duration: number;
  unlocked: boolean;
  mood: string;
  audio_url: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [featuredEcho, setFeaturedEcho] = useState<string | null>(null);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Stats for dashboard
  const [stats, setStats] = useState([
    { label: "Total Echoes", value: 0, filter: 'all' as const },
    { label: "Unlocked", value: 0, filter: 'unlocked' as const },
    { label: "Locked", value: 0, filter: 'locked' as const },
    { label: "Avg Duration", value: "0:00", filter: null },
  ]);
  
  useEffect(() => {
    // Fetch echoes from Supabase
    const fetchEchoes = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          navigate('/login');
          return;
        }
        
        // First check if any locked echoes should be unlocked now
        const now = new Date().toISOString();
        const { data: lockedEchoes, error: lockedError } = await supabase
          .from('echoes')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('unlocked', false)
          .lt('unlock_date', now);
          
        if (!lockedError && lockedEchoes && lockedEchoes.length > 0) {
          // Update these echoes to unlocked
          const echoIds = lockedEchoes.map(echo => echo.id);
          await supabase
            .from('echoes')
            .update({ unlocked: true })
            .in('id', echoIds);
          
          // If we unlocked any echoes, show the most recent one as featured
          if (lockedEchoes.length > 0) {
            setHasUnlocked(true);
            // Sort by unlock date to get most recently unlocked
            const sortedNewlyUnlocked = [...lockedEchoes].sort((a, b) => 
              new Date(b.unlock_date).getTime() - new Date(a.unlock_date).getTime()
            );
            setFeaturedEcho(sortedNewlyUnlocked[0].id);
          }
        }
        
        // Get all echoes (now with potentially updated unlocked status)
        const { data, error } = await supabase
          .from('echoes')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setEchoes(data as Echo[]);
          
          // If we didn't already set a featured echo from newly unlocked echoes,
          // check for any unlocked echoes to feature
          if (!featuredEcho) {
            const unlockedEchoes = data.filter(echo => echo.unlocked);
            if (unlockedEchoes.length > 0) {
              setHasUnlocked(true);
              setFeaturedEcho(unlockedEchoes[0].id);
            }
          }
          
          // Update stats
          const totalEchoes = data.length;
          const unlocked = data.filter(echo => echo.unlocked).length;
          const locked = data.length - unlocked;
          
          // Calculate average duration
          const totalDuration = data.reduce((sum, echo) => sum + echo.duration, 0);
          const avgSeconds = data.length > 0 ? Math.round(totalDuration / data.length) : 0;
          const avgMinutes = Math.floor(avgSeconds / 60);
          const avgRemainingSeconds = avgSeconds % 60;
          const avgDuration = `${avgMinutes}:${avgRemainingSeconds.toString().padStart(2, '0')}`;
          
          setStats([
            { label: "Total Echoes", value: data.length, filter: 'all' as const },
            { label: "Unlocked", value: unlocked, filter: 'unlocked' as const },
            { label: "Locked", value: locked, filter: 'locked' as const },
            { label: "Avg Duration", value: avgDuration, filter: null },
          ]);
        }
      } catch (error) {
        console.error("Error fetching echoes:", error);
        toast.error("Failed to load your echoes.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEchoes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('echoes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'echoes' }, 
        fetchEchoes
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
  
  const handleCreateEcho = () => {
    navigate("/record");
  };
  
  // Handle playing or stopping an echo's audio
  const handleEchoClick = (echoId: string, isLocked: boolean) => {
    // Don't do anything for locked echoes
    if (isLocked) return;
    
    // Find the echo by ID
    const echo = echoes.find(e => e.id === echoId);
    if (!echo) return;
    
    // If this echo is already playing, stop it
    if (currentlyPlaying === echoId) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setCurrentlyPlaying(null);
      return;
    }
    
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    // Create a new audio element and play the echo
    try {
      const audio = new Audio(echo.audio_url);
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Error playing audio:', e);
        toast.error('Could not play this echo. The audio file might be unavailable.');
        setCurrentlyPlaying(null);
      });
      
      // Play the audio
      audio.play().then(() => {
        setCurrentlyPlaying(echoId);
        setAudioElement(audio);
      }).catch(error => {
        console.error('Error playing audio:', error);
        toast.error('Could not play this echo. The audio file might be unavailable.');
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      toast.error('Could not play this echo. The audio file might be unavailable.');
    }
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 md:px-12 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Your Echoes</h1>
          <Button onClick={handleCreateEcho} className="bg-echo-present hover:bg-echo-past text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Echo
          </Button>
        </div>
        
        {/* Stats Overview with improved contrast */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`border border-border bg-card p-5 rounded-lg shadow-sm transition-all ${stat.filter ? 'cursor-pointer hover:bg-background-secondary hover:border-primary/30' : ''}`}
              onClick={() => stat.filter ? setActiveFilter(stat.filter) : null}
              role={stat.filter ? "button" : "region"}
              tabIndex={stat.filter ? 0 : -1}
              aria-label={`${stat.label}: ${stat.value}`}
              onKeyDown={(e) => e.key === 'Enter' && stat.filter ? setActiveFilter(stat.filter) : null}
            >
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-foreground-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Featured Echo - shows if there's a newly unlocked echo */}
        {hasUnlocked && featuredEcho && echoes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 flex items-center text-black dark:text-white">
              <Sparkles className="mr-2 h-5 w-5 text-echo-future" />
              Newly Unlocked
            </h2>
            <Card 
              className="border-2 border-echo-future hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/echo/${featuredEcho}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg mb-1 text-black dark:text-white">
                      {echoes.find(echo => echo.id === featuredEcho)?.title}
                    </h3>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span className="text-gray-700 dark:text-gray-300">Created on {formatDate(echoes.find(echo => echo.id === featuredEcho)?.created_at || "")}</span>
                    </div>
                  </div>
                  <Badge className={getMoodStyles(echoes.find(echo => echo.id === featuredEcho)?.mood || "")}>
                    {echoes.find(echo => echo.id === featuredEcho)?.mood.charAt(0).toUpperCase() + echoes.find(echo => echo.id === featuredEcho)?.mood.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Listen to this message you sent to yourself in the past.
                </p>
                <div className="py-2">
                  <WaveformAnimation isActive={true} variant="playback" className="h-12" barCount={12} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDuration(echoes.find(echo => echo.id === featuredEcho)?.duration || 0)}
                  </div>
                  <Button 
                    className="bg-echo-future hover:bg-echo-future/80 text-white"
                    onClick={() => {
                      if (featuredEcho) {
                        handleEchoClick(featuredEcho, false);
                      }
                    }}
                  >
                    {currentlyPlaying === featuredEcho ? (
                      <>
                        <span className="mr-1 h-4 w-4 flex items-center justify-center">■</span> Stop
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-4 w-4" /> Play Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <WaveformAnimation isActive />
          </div>
        ) : echoes.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-black dark:text-white">
                {activeFilter === 'all' ? 'All Echoes' : 
                 activeFilter === 'unlocked' ? 'Unlocked Echoes' : 'Locked Echoes'}
              </h2>
              {activeFilter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveFilter('all')}
                  className="text-black dark:text-white"
                >
                  Show All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {echoes
                .filter(echo => {
                  if (activeFilter === 'all') return true;
                  if (activeFilter === 'unlocked') return echo.unlocked;
                  if (activeFilter === 'locked') return !echo.unlocked;
                  return true;
                })
                .map((echo) => (
                <div 
                  key={echo.id} 
                  className={`border border-border bg-card p-6 rounded-xl transition-all hover:shadow-md ${echo.unlocked ? 'hover:border-primary/30 cursor-pointer' : 'hover:border-border'}`}
                  onClick={() => handleEchoClick(echo.id, !echo.unlocked)}
                  aria-label={`${echo.title} - ${echo.unlocked ? 'Unlocked' : 'Locked'} echo`}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && handleEchoClick(echo.id, !echo.unlocked)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg text-foreground">{echo.title}</h3>
                      <div className="flex gap-2 items-center text-xs text-foreground-muted mt-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Created on {formatDate(echo.created_at)}</span>
                      </div>
                    </div>
                    <Badge className={`${getMoodStyles(echo.mood)} text-xs font-medium`}>
                      {echo.mood.charAt(0).toUpperCase() + echo.mood.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="py-4 bg-background/50 rounded-md px-3">
                    <WaveformAnimation 
                      isActive={echo.unlocked} 
                      variant={echo.unlocked ? "playback" : "default"}
                      barCount={8}
                      className={echo.unlocked ? "text-primary" : "text-foreground-muted"}
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      {formatDuration(echo.duration)}
                    </span>
                    
                    {!echo.unlocked ? (
                      <div className="flex items-center text-foreground-muted text-sm bg-background/50 py-1 px-2 rounded-full">
                        <Clock className="h-4 w-4 mr-1.5 text-foreground-muted" />
                        <span>Unlocks on {formatDate(echo.unlock_date)}</span>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${currentlyPlaying === echo.id ? 'bg-primary/10 text-primary border-primary' : 'text-primary border-primary/20 hover:bg-primary/10 hover:text-primary-hover'}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleEchoClick(echo.id, false);
                        }}
                      >
                        {currentlyPlaying === echo.id ? (
                          <>
                            <span className="mr-1.5 h-4 w-4 flex items-center justify-center">■</span> Stop
                          </>
                        ) : (
                          <>
                            <Play className="mr-1.5 h-4 w-4" /> Play
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4 max-w-md mx-auto">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <WaveformAnimation isActive={false} variant="default" barCount={5} className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">No Echoes Yet</h3>
            <p className="text-foreground-muted mb-8 text-base">
              Create your first Echo to send a message to your future self. Record your thoughts, set an unlock date, and rediscover them later.
            </p>
            <Button 
              onClick={handleCreateEcho} 
              className="bg-primary hover:bg-primary-hover text-primary-foreground transition-colors px-6 py-2 h-auto"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create your first Echo
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
