import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { ArrowRight, Calendar, Clock, Plus, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get mood styles
const getMoodStyles = (mood: string) => {
  switch (mood) {
    case 'hopeful':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'motivated':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'grateful':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    case 'ambitious':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'joyful':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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
        toast({
          title: "Error",
          description: "Failed to load your echoes.",
          variant: "destructive",
        });
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
  
  const handleEchoClick = (echoId: string, isLocked: boolean) => {
    if (!isLocked) {
      navigate(`/echo/${echoId}`);
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
          <h1 className="text-3xl font-bold">Your Echoes</h1>
          <Button onClick={handleCreateEcho} className="bg-echo-present hover:bg-echo-past text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Echo
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`text-center transition-all ${stat.filter ? 'cursor-pointer hover:shadow-md' : ''} ${stat.filter === activeFilter ? 'ring-2 ring-echo-present' : ''}`}
              onClick={() => stat.filter && setActiveFilter(stat.filter)}
            >
              <CardHeader className="pb-2">
                <div className={`text-2xl font-bold ${index === 0 ? 'text-echo-future' : index === 1 ? 'text-echo-present' : index === 2 ? 'text-echo-past' : 'text-muted-foreground'}`}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Featured Echo - shows if there's a newly unlocked echo */}
        {hasUnlocked && featuredEcho && echoes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 flex items-center">
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
                    <h3 className="font-medium text-lg mb-1">
                      {echoes.find(echo => echo.id === featuredEcho)?.title}
                    </h3>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>Created on {formatDate(echoes.find(echo => echo.id === featuredEcho)?.created_at || "")}</span>
                    </div>
                  </div>
                  <Badge className={getMoodStyles(echoes.find(echo => echo.id === featuredEcho)?.mood || "")}>
                    {echoes.find(echo => echo.id === featuredEcho)?.mood.charAt(0).toUpperCase() + echoes.find(echo => echo.id === featuredEcho)?.mood.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Listen to this message you sent to yourself in the past.
                </p>
                <div className="py-2">
                  <WaveformAnimation isActive={true} variant="playback" className="h-12" barCount={12} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(echoes.find(echo => echo.id === featuredEcho)?.duration || 0)}
                  </div>
                  <Button className="bg-echo-future hover:bg-echo-future/80 text-white">
                    <Play className="mr-1 h-4 w-4" /> Play Now
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
              <h2 className="text-xl font-medium">
                {activeFilter === 'all' ? 'All Echoes' : 
                 activeFilter === 'unlocked' ? 'Unlocked Echoes' : 'Locked Echoes'}
              </h2>
              {activeFilter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveFilter('all')}
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
                  className={`glass-card p-6 rounded-xl transition-all ${echo.unlocked ? 'hover:shadow-md hover:border-echo-present/30 cursor-pointer' : 'opacity-80'}`}
                  onClick={() => handleEchoClick(echo.id, !echo.unlocked)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{echo.title}</h3>
                      <div className="flex gap-2 items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created on {formatDate(echo.created_at)}</span>
                      </div>
                    </div>
                    <Badge className={getMoodStyles(echo.mood)}>
                      {echo.mood.charAt(0).toUpperCase() + echo.mood.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="py-3">
                    <WaveformAnimation 
                      isActive={echo.unlocked} 
                      variant={echo.unlocked ? "playback" : "default"}
                      barCount={8}
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(echo.duration)}
                    </span>
                    
                    {!echo.unlocked ? (
                      <div className="flex items-center text-echo-past text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Unlocks on {formatDate(echo.unlock_date)}</span>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-echo-present">
                        <Play className="mr-1 h-4 w-4" /> Play
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-echo-light dark:bg-echo-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <WaveformAnimation />
            </div>
            <h3 className="text-xl font-medium mb-4">No Echoes Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first Echo to send a message to your future self.
            </p>
            <Button onClick={handleCreateEcho} className="bg-echo-present hover:bg-echo-past text-white">
              Create your first Echo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
