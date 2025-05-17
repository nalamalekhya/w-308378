"use client";

import * as React from "react";
import { useState } from "react";
import { LogIn, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm rounded-3xl shadow-xl border border-input p-8 flex flex-col items-center">
        <CardHeader className="mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-6">
            <LogIn className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-semibold mb-2 text-center">
            Sign in with email
          </CardTitle>
          <p className="text-muted-foreground text-sm mb-6 text-center">
            Make a new doc to bring your words, data, and teams together. For free
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </span>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Label htmlFor="password" className="sr-only">Password</Label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </span>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive text-left">{error}</div>
          )}

          <div className="flex justify-between items-center">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <span className="animate-spin">Loading...</span>
              ) : (
                "Get Started"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </Button>
          </div>

          <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-muted/50"></div>
            <span className="mx-2 text-xs text-muted-foreground">Or sign in with</span>
            <div className="flex-grow border-t border-muted/50"></div>
          </div>

          <div className="flex gap-3 w-full justify-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Add Google auth logic here
                toast.info("Google sign-in coming soon!");
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Add Facebook auth logic here
                toast.info("Facebook sign-in coming soon!");
              }}
            >
              <img
                src="https://www.svgrepo.com/show/448224/facebook.svg"
                alt="Facebook"
                className="w-5 h-5 mr-2"
              />
              Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
