
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, Lock, Settings, User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // User data state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings states
  const [timeCapsuledEnabled, setTimeCapsuleEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [unlockNotifications, setUnlockNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState("immediate");
  const [darkMode, setDarkMode] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          throw new Error(authError?.message || "Not authenticated");
        }
        
        setUser(authUser);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile(profileData);
          
          // Get user settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', authUser.id)
            .single();
            
          if (!settingsError && settingsData) {
            // Update state with user settings
            setTimeCapsuleEnabled(settingsData.time_capsule_enabled || false);
            setEmailNotifications(settingsData.email_notifications || true);
            setUnlockNotifications(settingsData.unlock_notifications || true);
            setNotificationFrequency(settingsData.notification_frequency || "immediate");
            setDarkMode(settingsData.dark_mode || false);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading settings",
          description: "Please try again or contact support.",
          variant: "destructive"
        });
        // Redirect to login if not authenticated
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [toast, navigate]);
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Save settings to database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          time_capsule_enabled: timeCapsuledEnabled,
          email_notifications: emailNotifications,
          unlock_notifications: unlockNotifications,
          notification_frequency: notificationFrequency,
          dark_mode: darkMode,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleTimeCapsuleToggle = (checked: boolean) => {
    if (checked) {
      // Show confirmation dialog
      if (window.confirm("Enabling Time Capsule Mode will hide all entries until 1 year from now. Are you sure you want to continue?")) {
        setTimeCapsuleEnabled(true);
        toast({
          title: "Time Capsule Mode Enabled",
          description: "All entries will be hidden until 1 year from now."
        });
      }
    } else {
      setTimeCapsuleEnabled(false);
      toast({
        title: "Time Capsule Mode Disabled",
        description: "You can now access all unlocked entries."
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Customize your EchoVerse experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-8">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-32 w-32 mb-6">
                      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Avatar className="h-32 w-32 mb-6 border-4 border-background shadow-lg">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.first_name || "User"} />
                      <AvatarFallback className="text-3xl font-bold">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <h3 className="text-2xl font-bold mb-2">
                    {loading ? (
                      <div className="h-8 w-40 bg-muted animate-pulse rounded"></div>
                    ) : (
                      `${profile?.first_name || ''} ${profile?.last_name || ''}`
                    )}
                  </h3>
                  <p className="text-md text-muted-foreground">
                    {loading ? (
                      <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                    ) : (
                      user?.email
                    )}
                  </p>
                </div>
                
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="grid grid-cols-1 mb-4">
                    <TabsTrigger value="account" className="flex items-center gap-2 justify-start py-2">
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex items-center gap-2 justify-start py-2">
                      <Lock className="h-4 w-4" />
                      <span>Privacy</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2 justify-start py-2">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2 justify-start py-2">
                      <Settings className="h-4 w-4" />
                      <span>Appearance</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="account" className="w-full">
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account & Privacy</CardTitle>
                    <CardDescription>
                      Manage your account information and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="px-3 py-1 text-xs bg-muted rounded-md text-muted-foreground">Cannot be changed</div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">Last updated 3 months ago</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Data Management</h3>
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <p className="font-medium">Download Your Data</p>
                          <p className="text-sm text-muted-foreground">
                            Get a copy of your echoes and account information
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-muted-foreground text-destructive">
                            This will permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Time Capsule Mode</CardTitle>
                    <CardDescription>
                      Control how your entries are locked and accessed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base" htmlFor="time-capsule-mode">
                            Hide all entries until 1 year from now
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            When enabled, you won't be able to access any entries until the time period has passed
                          </p>
                        </div>
                        <Switch
                          id="time-capsule-mode"
                          checked={timeCapsuledEnabled}
                          onCheckedChange={handleTimeCapsuleToggle}
                        />
                      </div>
                      
                      {timeCapsuledEnabled && (
                        <div className="bg-muted p-4 rounded-lg mt-4">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-echo-past" />
                            Time Capsule Mode is active until May 11, 2026
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control your privacy and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Two-factor authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Setup</Button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                          <Label className="text-base">Automatic logout</Label>
                          <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                        </div>
                        <Select defaultValue="30min">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="15min">15 minutes</SelectItem>
                            <SelectItem value="30min">30 minutes</SelectItem>
                            <SelectItem value="1hour">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email confirmation for all actions</Label>
                          <p className="text-sm text-muted-foreground">Receive email confirmations for important account changes</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Control how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base" htmlFor="unlock-notifications">Entry unlock notifications</Label>
                          <p className="text-sm text-muted-foreground">Get notified when your entries become unlocked</p>
                        </div>
                        <Switch 
                          id="unlock-notifications" 
                          checked={unlockNotifications}
                          onCheckedChange={setUnlockNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                          <Label className="text-base" htmlFor="email-notifications">Email notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch 
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}  
                        />
                      </div>
                      
                      {emailNotifications && (
                        <div className="flex items-center justify-between pt-4 ml-6">
                          <div className="space-y-0.5">
                            <Label className="text-base">Notification frequency</Label>
                            <p className="text-sm text-muted-foreground">How often you want to receive emails</p>
                          </div>
                          <Select 
                            value={notificationFrequency}
                            onValueChange={setNotificationFrequency}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="daily">Daily digest</SelectItem>
                              <SelectItem value="weekly">Weekly digest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how EchoVerse looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base" htmlFor="dark-mode">Dark mode</Label>
                          <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                        </div>
                        <Switch 
                          id="dark-mode" 
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="space-y-0.5">
                          <Label className="text-base">Color theme</Label>
                          <p className="text-sm text-muted-foreground">Choose your accent color</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="h-8 w-8 rounded-full bg-indigo-500" aria-label="Indigo theme"></button>
                          <button className="h-8 w-8 rounded-full bg-teal-500" aria-label="Teal theme"></button>
                          <button className="h-8 w-8 rounded-full bg-amber-500" aria-label="Amber theme"></button>
                          <button className="h-8 w-8 rounded-full bg-rose-500" aria-label="Rose theme"></button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                className="bg-echo-present text-white hover:bg-echo-past"
                disabled={saving || loading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save All Settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
