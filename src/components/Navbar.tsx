
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Bell, Menu, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [notifications, setNotifications] = useState<{id: string, title: string}[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { toast } = useToast();
  
  // Check for notifications (newly unlocked echoes)
  useEffect(() => {
    // Use localStorage to keep track of which notifications have been shown
    const checkUnlockedEchoes = async () => {
      try {
        // Get already shown notification IDs from localStorage
        const shownNotificationIds = JSON.parse(localStorage.getItem('shownNotifications') || '[]');
        
        // Get unlocked echoes from database
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        const { data, error } = await supabase
          .from('echoes')
          .select('id, title')
          .eq('unlocked', true)
          .eq('user_id', userData.user.id)
          .limit(5);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Filter out already shown notifications
          const newNotifications = data.filter(echo => !shownNotificationIds.includes(echo.id));
          
          if (newNotifications.length > 0) {
            // Update localStorage with the new notifications we're about to show
            localStorage.setItem(
              'shownNotifications', 
              JSON.stringify([...shownNotificationIds, ...newNotifications.map(n => n.id)])
            );
            
            // Show a toast notification for the first new one
            toast({
              title: "🎉 One of your entries just unlocked!",
              description: "Listen to your past self.",
              action: (
                <Button 
                  onClick={() => window.location.href = `/echo/${newNotifications[0].id}`}
                  variant="outline"
                  size="sm"
                >
                  Listen Now
                </Button>
              ),
            });
            
            setNotifications(newNotifications);
            setHasUnreadNotifications(true);
          } else {
            // No new notifications, but use existing ones for the notification panel
            setNotifications(data);
          }
        }
      } catch (error) {
        console.error("Error checking for unlocked echoes:", error);
      }
    };
    
    checkUnlockedEchoes();
    
    // Set up real-time subscription to track newly unlocked echoes
    const channel = supabase
      .channel('unlocked-echoes-notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'echoes',
          filter: 'unlocked=eq.true' 
        }, 
        () => checkUnlockedEchoes()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const handleNotificationClick = (id: string) => {
    setHasUnreadNotifications(false);
    window.location.href = `/echo/${id}`;
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  
  return (
    <header className="bg-gradient-to-r from-echo-past via-echo-present to-echo-future dark:text-white text-primary-foreground sticky top-0 z-50 shadow-md py-4 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <WaveformAnimation barCount={3} />
              <span className="ml-1 font-semibold text-lg">EchoVerse</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <NavigationMenuLink 
                      className={`${navigationMenuTriggerStyle()} font-medium ${isActive("/dashboard") ? "bg-primary/25 text-primary-foreground" : "bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 hover:border-white/50"}`}
                    >
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/timeline">
                    <NavigationMenuLink 
                      className={`${navigationMenuTriggerStyle()} font-medium ${isActive("/timeline") ? "bg-primary/25 text-primary-foreground" : "bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 hover:border-white/50"}`}
                    >
                      Timeline
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/record">
                    <NavigationMenuLink 
                      className={`${navigationMenuTriggerStyle()} font-medium ${isActive("/record") ? "bg-primary/25 text-primary-foreground" : "bg-white/20 text-white font-semibold border border-white/30 hover:bg-white/30 hover:border-white/50"}`}
                    >
                      Record
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500"
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-2 font-medium border-b">Notifications</div>
                  {notifications.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <Button 
                          key={notification.id}
                          variant="ghost" 
                          className="w-full justify-start rounded-none border-b text-left p-3 h-auto"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{notification.title} has unlocked!</span>
                            <span className="text-xs text-muted-foreground">Click to listen now</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-white/10 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 relative"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500"
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="p-2 font-medium border-b">Notifications</div>
                {notifications.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <Button 
                        key={notification.id}
                        variant="ghost" 
                        className="w-full justify-start rounded-none border-b text-left p-3 h-auto"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{notification.title} has unlocked!</span>
                          <span className="text-xs text-muted-foreground">Click to listen now</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 relative">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/timeline" className="cursor-pointer">Timeline</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/record" className="cursor-pointer">Record</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
