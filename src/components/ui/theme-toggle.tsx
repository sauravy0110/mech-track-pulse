
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "light");
  const [mounted, setMounted] = useState(false);

  // When mounted on client, set theme based on stored preference
  useEffect(() => {
    setMounted(true);
    
    const setThemeClass = (newTheme: Theme) => {
      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      } else {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
    };
    
    setThemeClass(theme);
    
    // Add listener for system theme changes when using "system" theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Handle theme change
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
