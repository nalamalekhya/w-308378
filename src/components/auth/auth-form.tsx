import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Facebook, 
  Github, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { themeConfig } from "@/styles/theme";

type FormMode = "login" | "signup" | "forgot-password";

// Social login provider type
type SocialProvider = "google" | "facebook" | "github";

// Password validation requirements
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[A-Z]/, text: "At least one uppercase letter" },
  { regex: /[0-9]/, text: "At least one number" },
  { regex: /[^A-Za-z0-9]/, text: "At least one special character" },
];


interface AuthFormProps {
  mode: FormMode;
  onChangeMode: (mode: FormMode) => void;
  onSubmit: (data: { email: string; password?: string; confirmPassword?: string }) => void;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function AuthForm({ mode, onChangeMode, onSubmit, email: initialEmail, password: initialPassword, confirmPassword: initialConfirmPassword }: AuthFormProps) {
  // Form state
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState(initialPassword || "");
  const [confirmPassword, setConfirmPassword] = useState(initialConfirmPassword || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  // Animation state
  const [isLoading, setIsLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  // Form validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      case 'firstName':
        if (!value && mode === 'signup') return 'First name is required';
        return '';
      case 'lastName':
        if (!value && mode === 'signup') return 'Last name is required';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  // Password strength calculation with improved algorithm
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    // More comprehensive strength calculation
    let strength = 0;
    
    // Length checks - progressive scoring
    if (password.length >= 8) strength += 15;
    if (password.length >= 10) strength += 10;
    if (password.length >= 12) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15; // Uppercase
    if (/[a-z]/.test(password)) strength += 10; // Lowercase
    if (/[0-9]/.test(password)) strength += 15; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 15; // Special chars
    
    // Pattern checks (reduce score for common patterns)
    if (/^[a-zA-Z]+$/.test(password)) strength -= 10; // Letters only
    if (/^[0-9]+$/.test(password)) strength -= 10; // Numbers only
    if (/^[a-zA-Z0-9]+$/.test(password)) strength -= 5; // No special chars
    
    // Check for common sequences
    if (/123|abc|qwerty|password|admin/i.test(password)) strength -= 10;
    
    return Math.max(0, Math.min(100, strength));
  };
  
  const passwordStrength = calculatePasswordStrength(password);
  
  // Get password strength color with proper contrast
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-destructive";
    if (passwordStrength < 60) return "bg-warning";
    if (passwordStrength < 80) return "bg-info";
    return "bg-success";
  };
  
  // Get password strength label
  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return "Weak password";
    if (passwordStrength < 60) return "Moderate password";
    if (passwordStrength < 80) return "Good password";
    return "Strong password";
  };
  
  // Check which password requirements are met
  const checkPasswordRequirement = (regex: RegExp): boolean => {
    return regex.test(password);
  };
  
  // Handle social login
  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    try {
      let { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Unable to sign in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate email
    const emailError = validateField('email', email);
    if (emailError) errors.email = emailError;
    
    // Validate password for login and signup
    if (mode !== 'forgot-password') {
      const passwordError = validateField('password', password);
      if (passwordError) errors.password = passwordError;
    }
    
    // Validate confirm password for signup
    if (mode === 'signup') {
      const confirmPasswordError = validateField('confirmPassword', confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
      
      const firstNameError = validateField('firstName', firstName);
      if (firstNameError) errors.firstName = firstNameError;
      
      const lastNameError = validateField('lastName', lastName);
      if (lastNameError) errors.lastName = lastNameError;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler with improved validation and feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Set all fields as touched to show errors
      const allFieldsTouched: Record<string, boolean> = {};
      ['email', 'password', 'confirmPassword', 'firstName', 'lastName'].forEach(field => {
        allFieldsTouched[field] = true;
      });
      setTouchedFields(allFieldsTouched);
      
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      // Add subtle animation for form submission
      setFormSuccess(false);
      
      // Handle different form modes
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        if (data.user) {
          setFormSuccess(true);
          toast.success("Logged in successfully!");
          
          // If remember me is checked, store in localStorage
          if (rememberMe) {
            localStorage.setItem('echovoice-remember-email', email);
          } else {
            localStorage.removeItem('echovoice-remember-email');
          }
          
          // Delay slightly for animation
          setTimeout(() => {
            onSubmit({ email, password });
          }, 300);
        }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        
        if (error) {
          throw error;
        }
        
        if (data.user) {
          setFormSuccess(true);
          toast.success("Account created successfully!");
          
          // Delay slightly for animation
          setTimeout(() => {
            onSubmit({ email, password, confirmPassword });
          }, 300);
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        
        if (error) {
          throw error;
        }
        
        setFormSuccess(true);
        toast.success("Password reset instructions sent to your email.");
        
        // Delay slightly for animation
        setTimeout(() => {
          onSubmit({ email });
        }, 300);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "An unexpected error occurred. Please try again.");
      setFormSuccess(false);
      console.error("Auth submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderFormContent = () => {
    // Use type guards to ensure type safety in the switch statement
    const currentMode: FormMode = mode;
    
    switch (currentMode) {
      case "login":
        return (
          <>
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <WaveformAnimation isActive={true} variant="recording" barCount={3} className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
              <CardDescription className="text-foreground-muted">Login to access your audio diaries</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field with icon */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      className={`pl-10 ${touchedFields.email && formErrors.email ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="email"
                      aria-invalid={touchedFields.email && formErrors.email ? 'true' : 'false'}
                    />
                  </div>
                  {touchedFields.email && formErrors.email && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Password field with toggle visibility icon */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-primary" 
                      type="button" 
                      onClick={() => onChangeMode("forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => handleBlur('password', e.target.value)}
                      className={`pl-10 ${touchedFields.password && formErrors.password ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="current-password"
                      aria-invalid={touchedFields.password && formErrors.password ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.password && formErrors.password && (
                    <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                  )}
                </div>
                
                {/* Remember me checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="remember-me" className="text-sm text-foreground-secondary cursor-pointer">Remember me</Label>
                </div>
                
                {/* Submit button with loading state */}
                <Button 
                  type="submit" 
                  className={`w-full transition-all duration-300 ${formSuccess ? 'bg-success hover:bg-success/90' : 'bg-primary hover:bg-primary-hover'}`}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Log in</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
                
                {/* Social login options removed */}
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6 pt-0">
              <div className="text-center text-sm text-foreground-muted">
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary font-medium" 
                  onClick={() => onChangeMode("signup")}
                >
                  Sign up for free
                </Button>
              </div>
            </CardFooter>
          </>
        );
        
      case "signup":
        return (
          <>
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <WaveformAnimation isActive={true} variant="recording" barCount={3} className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
              <CardDescription className="text-foreground-muted">Your future self will thank you</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-sm font-medium">First Name</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onBlur={(e) => handleBlur('firstName', e.target.value)}
                        className={`pl-10 ${touchedFields.firstName && formErrors.firstName ? 'border-destructive focus:ring-destructive/50' : ''}`}
                        required
                        aria-invalid={touchedFields.firstName && formErrors.firstName ? 'true' : 'false'}
                      />
                    </div>
                    {touchedFields.firstName && formErrors.firstName && (
                      <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={(e) => handleBlur('lastName', e.target.value)}
                      className={`${touchedFields.lastName && formErrors.lastName ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      aria-invalid={touchedFields.lastName && formErrors.lastName ? 'true' : 'false'}
                    />
                    {touchedFields.lastName && formErrors.lastName && (
                      <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      className={`pl-10 ${touchedFields.email && formErrors.email ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="email"
                      aria-invalid={touchedFields.email && formErrors.email ? 'true' : 'false'}
                    />
                  </div>
                  {touchedFields.email && formErrors.email && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Password field with visibility toggle */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={(e) => handleBlur('password', e.target.value)}
                      className={`pl-10 ${touchedFields.password && formErrors.password ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="new-password"
                      aria-invalid={touchedFields.password && formErrors.password ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.password && formErrors.password && (
                    <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} 
                          style={{ width: `${passwordStrength}%` }} 
                        />
                      </div>
                      <p className="text-xs text-foreground-muted">
                        {getPasswordStrengthLabel()}
                      </p>
                      
                      {/* Password requirements checklist */}
                      <div className="space-y-1 mt-2">
                        {PASSWORD_REQUIREMENTS.map((requirement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${checkPasswordRequirement(requirement.regex) ? 'bg-success' : 'bg-foreground-muted'}`} />
                            <p className={`text-xs ${checkPasswordRequirement(requirement.regex) ? 'text-foreground' : 'text-foreground-muted'}`}>
                              {requirement.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password field with visibility toggle */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                      className={`pl-10 ${touchedFields.confirmPassword && formErrors.confirmPassword ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="new-password"
                      aria-invalid={touchedFields.confirmPassword && formErrors.confirmPassword ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touchedFields.confirmPassword && formErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
                
                {/* Submit button with loading state */}
                <Button 
                  type="submit" 
                  className={`w-full mt-2 transition-all duration-300 ${formSuccess ? 'bg-success hover:bg-success/90' : 'bg-primary hover:bg-primary-hover'}`}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create account</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => onChangeMode("login")}>
                  Log in
                </Button>
              </div>
            </CardFooter>
          </>
        );
        
      case "forgot-password":
        return (
          <>
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
              <CardDescription className="text-foreground-muted">We'll send you an email with a reset link</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field with icon */}
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      className={`pl-10 ${touchedFields.email && formErrors.email ? 'border-destructive focus:ring-destructive/50' : ''}`}
                      required
                      autoComplete="email"
                      aria-invalid={touchedFields.email && formErrors.email ? 'true' : 'false'}
                    />
                  </div>
                  {touchedFields.email && formErrors.email && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Submit button with loading state */}
                <Button 
                  type="submit" 
                  className={`w-full transition-all duration-300 ${formSuccess ? 'bg-success hover:bg-success/90' : 'bg-primary hover:bg-primary-hover'}`}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Sending instructions...</span>
                    </div>
                  ) : (
                    <span>Send reset instructions</span>
                  )}
                </Button>
                
                <div className="text-center text-sm text-foreground-muted mt-4">
                  <p>We'll send instructions to reset your password to the email address associated with your account.</p>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6 pt-0">
              <div className="text-center text-sm text-foreground-muted">
                Remember your password?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary font-medium" 
                  onClick={() => onChangeMode("login")}
                >
                  Back to login
                </Button>
              </div>
            </CardFooter>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto auth-card border border-border shadow-lg transition-all duration-300 hover:shadow-xl">
      {renderFormContent()}
    </Card>
  );
}
