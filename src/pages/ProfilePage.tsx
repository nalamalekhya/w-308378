
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  
  // Check for signed in user and fetch profile data
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // Get the current signed in user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        setEmail(currentUser.email || "");
        
        // Fetch the user's profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
        } else if (profileData) {
          setProfile(profileData);
          setFirstName(profileData.first_name || "");
          setLastName(profileData.last_name || "");
          setBio(profileData.bio || "");
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [navigate, toast]);
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          bio: bio
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement password update logic using Supabase Auth
    toast({
      title: "Not implemented",
      description: "Password update functionality will be implemented soon"
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl font-bold mb-4">My Profile</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Manage your personal information and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback className="text-2xl">
                        {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      aria-label="Edit profile picture"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-xl font-medium mb-1">
                    {loading ? "Loading..." : `${firstName || ''} ${lastName || ''}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-accent rounded-md">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      disabled={true}
                      title="Email cannot be changed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us a little about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={loading}
                    ></textarea>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-echo-present text-white hover:bg-echo-past"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="button" 
                      className="bg-echo-present text-white hover:bg-echo-past"
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
