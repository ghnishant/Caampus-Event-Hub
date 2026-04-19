import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [0, 18]);
  const bg = useTransform(scrollY, [0, 120], ["hsl(var(--background) / 0)", "hsl(var(--background) / 0.7)"]);

  return (
    <motion.header
      style={{ backdropFilter: useTransform(blur, b => `saturate(180%) blur(${b}px)`), backgroundColor: bg }}
      className="fixed top-0 inset-x-0 z-50 border-b border-transparent transition-colors"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          Campus<span className="text-gradient-hero">Hub</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#events" className="hover:text-foreground transition-colors">Events</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Why us</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button variant="hero" size="sm">Get started</Button>
        </div>
      </nav>
    </motion.header>
  );
};
