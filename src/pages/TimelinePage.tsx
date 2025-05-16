import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { Calendar, Clock, Filter, Lock, Play, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Echo = {
  id: string;
  title: string;
  created_at: string;
  unlock_date: string;
  duration: number;
  unlocked: boolean;
  mood: string;
};

type CalendarDay = {
  day: number;
  isCurrentMonth: boolean;
  date: Date | null;
  hasEntry: boolean;
  isUnlocked: boolean;
};

export default function TimelinePage() {
  const [view, setView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEchoes, setSelectedDateEchoes] = useState<Echo[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  // Track unique moods that exist in the data
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Fetch echoes from Supabase
  useEffect(() => {
    const fetchEchoes = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('echoes')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setEchoes(data as Echo[]);
          
          // Extract unique moods from echoes that actually exist
          const uniqueMoods = Array.from(new Set(data.map(echo => echo.mood).filter(Boolean)));
          setAvailableMoods(uniqueMoods);
        }
      } catch (error) {
        console.error("Error fetching echoes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEchoes();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('echoes-timeline')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'echoes' }, 
        fetchEchoes
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
  
  // Handle date click to show echoes for that day
  const handleDateClick = (date: Date) => {
    // Find echoes that unlock on the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Filter echoes that unlock on this date
    const echoesForDate = echoes.filter(echo => {
      const unlockDate = new Date(echo.unlock_date);
      return unlockDate >= startOfDay && unlockDate <= endOfDay;
    });
    
    setSelectedDate(date);
    setSelectedDateEchoes(echoesForDate);
    setShowDateModal(true);
  };
  
  // Filter echoes based on search query and mood filter
  const filteredEchoes = echoes.filter((echo) => {
    const matchesSearch = searchQuery 
      ? echo.title.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;
    const matchesMood = moodFilter === "all" 
      ? true 
      : echo.mood === moodFilter;
    return matchesSearch && matchesMood;
  });
  
  // Group echoes by month
  const groupedEchoes = filteredEchoes.reduce((groups, echo) => {
    const month = new Date(echo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(echo);
    return groups;
  }, {} as Record<string, typeof filteredEchoes>);

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  // Generate calendar days for the current month
  const generateCalendarDays = (month: Date, echoes: Echo[]): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Create a date for the first day of the month
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    
    // Get the first day of the week for the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Add empty days for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: 0,
        isCurrentMonth: false,
        date: null,
        hasEntry: false,
        isUnlocked: false
      });
    }
    
    // Create an array of dates for the current month
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, monthIndex, day);
      
      // Check if there are any echoes scheduled to unlock on this date
      const entriesForDay = echoes.filter(echo => {
        const unlockDate = new Date(echo.unlock_date);
        return unlockDate.getDate() === day && 
              unlockDate.getMonth() === monthIndex && 
              unlockDate.getFullYear() === year;
      });
      
      const hasEntry = entriesForDay.length > 0;
      
      // Check if all entries for this day are unlocked
      const isUnlocked = hasEntry && entriesForDay.every(echo => echo.unlocked);
      
      days.push({
        day,
        isCurrentMonth: true,
        date,
        hasEntry,
        isUnlocked
      });
    }
    
    // Fill in any remaining days to get to 42 total (6 rows of 7 days)
    const daysNeeded = 42 - days.length;
    for (let i = 0; i < daysNeeded; i++) {
      days.push({
        day: 0,
        isCurrentMonth: false,
        date: null,
        hasEntry: false,
        isUnlocked: false
      });
    }
    
    return days;
  };
  
  // Helper functions for styling and formatting
  const getMoodStyles = (mood: string) => {
    switch (mood) {
      case 'hopeful':
        return 'bg-blue-100 text-blue-800';
      case 'motivated':
        return 'bg-green-100 text-green-800';
      case 'grateful':
        return 'bg-purple-100 text-purple-800';
      case 'ambitious':
        return 'bg-amber-100 text-amber-800';
      case 'joyful':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  const getTimeUntilUnlock = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-12 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Timeline</h1>
          
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={setView} className="w-auto">
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your echoes..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All moods</SelectItem>
                {availableMoods.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground">Available moods:</div>
                    {availableMoods.map(mood => {
                      let color = "bg-gray-500";
                      if (mood === 'hopeful') color = "bg-blue-500";
                      if (mood === 'motivated') color = "bg-green-500";
                      if (mood === 'grateful') color = "bg-purple-500";
                      if (mood === 'ambitious') color = "bg-amber-500";
                      if (mood === 'joyful') color = "bg-rose-500";
                      
                      return (
                        <SelectItem key={mood} value={mood}>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${color} mr-2`}></div>
                            <span>{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={view} className="w-full">
          <TabsContent value="list" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <WaveformAnimation isActive />
              </div>
            ) : Object.entries(groupedEchoes).length > 0 ? (
              Object.entries(groupedEchoes).map(([month, monthEchoes]) => (
                <div key={month} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-echo-past">{month}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {monthEchoes.map((echo) => (
                      <div 
                        key={echo.id} 
                        className={`glass-card p-5 rounded-xl transition-all ${echo.unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-80'}`}
                        onClick={() => echo.unlocked ? navigate(`/echo/${echo.id}`) : null}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-lg mb-1">{echo.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Recorded on {new Date(echo.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDuration(echo.duration)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className={`px-3 py-1 rounded-full text-xs ${getMoodStyles(echo.mood)}`}>
                              {capitalize(echo.mood)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-4">
                          <WaveformAnimation 
                            isActive={echo.unlocked} 
                            variant={echo.unlocked ? "playback" : "default"} 
                            barCount={8} 
                          />
                        </div>
                        
                        {!echo.unlocked ? (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-echo-past text-sm">
                              <Lock className="h-4 w-4 mr-1" />
                              <span>Unlocks on {new Date(echo.unlock_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getTimeUntilUnlock(new Date(echo.unlock_date))} remaining
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-muted-foreground">
                              Unlocked on {new Date(echo.unlock_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                            </div>
                            <Button variant="ghost" size="sm" className="text-echo-present">
                              <Play className="mr-1 h-4 w-4" /> Play
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="h-24 w-24 bg-echo-light dark:bg-echo-dark rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-medium mb-4">No Results Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any echoes matching your search. Try adjusting your filters or search query.
                </p>
                <Button onClick={() => { setSearchQuery(''); setMoodFilter('all'); }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <div className="border rounded-lg p-6">
              <div className="flex justify-center items-center mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentMonth(prevMonth);
                  }}
                >
                  Previous
                </Button>
                <h2 className="text-xl font-semibold px-4">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                >
                  Next
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium py-2">
                    {day}
                  </div>
                ))}
                
                {/* Dynamically generated calendar */}
                {generateCalendarDays(currentMonth, echoes).map((calendarDay, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square border rounded-md flex flex-col items-center justify-center p-1 
                    ${calendarDay.isCurrentMonth ? 'bg-background' : 'bg-muted text-muted-foreground'} 
                    ${calendarDay.hasEntry ? 'ring-1 ring-echo-present' : ''}
                    ${calendarDay.isCurrentMonth ? 'hover:bg-accent cursor-pointer' : ''}`}
                    onClick={() => {
                      if (calendarDay.isCurrentMonth && calendarDay.date) {
                        handleDateClick(calendarDay.date);
                      }
                    }}
                  >
                    <span className="text-sm">{calendarDay.isCurrentMonth ? calendarDay.day : ''}</span>
                    {calendarDay.hasEntry && (
                      <div className="mt-1">
                        {calendarDay.isUnlocked ? (
                          <WaveformAnimation barCount={3} className="h-3" />
                        ) : (
                          <Lock className="h-3 w-3 text-echo-past" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-echo-present mr-2"></div>
                  <span>Unlocked Entry</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-echo-past mr-2"></div>
                  <span>Locked Entry</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Date details modal */}
      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDateModal(false)}
              >
                <span className="sr-only">Close</span>
                <span className="text-xl">&times;</span>
              </Button>
            </div>
            
            {selectedDateEchoes.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedDateEchoes.length} echo{selectedDateEchoes.length !== 1 ? 's' : ''} will unlock on this date:
                </p>
                
                {selectedDateEchoes.map(echo => (
                  <div 
                    key={echo.id} 
                    className="border rounded-md p-4 hover:border-echo-present transition-all"
                  >
                    <h4 className="font-medium mb-1">{echo.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Created: {new Date(echo.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDuration(echo.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No echoes scheduled to unlock on this date.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
