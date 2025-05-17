import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
    
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Handle theme toggle with animation
  const toggleTheme = () => {
    setIsTransitioning(true);
    const newTheme = theme === "dark" ? "light" : "dark";
    
    // Save preference to localStorage
    localStorage.setItem('theme-preference', newTheme);
    
    // Set the theme after a short delay to allow for animation
    setTheme(newTheme);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`hover:bg-primary/10 transition-transform duration-300 ${isTransitioning ? 'scale-90' : 'scale-100'}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all duration-300" />
      ) : (
        <Moon className="h-5 w-5 transition-all duration-300" />
      )}
    </Button>
  );
}
