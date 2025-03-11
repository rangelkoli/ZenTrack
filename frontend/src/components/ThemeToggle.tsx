import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label='Toggle theme'
    >
      <Sun
        className={`h-5 w-5 transition-all ${
          theme === "dark" ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${
          theme === "light" ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
