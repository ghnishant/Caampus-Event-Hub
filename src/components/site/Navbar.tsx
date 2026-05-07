import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [0, 18]);
  const bg = useTransform(scrollY, [0, 120], ["hsl(var(--background) / 0)", "hsl(var(--background) / 0.7)"]);
  const backdropFilter = useTransform(blur, (b) => `saturate(180%) blur(${b}px)`);
  const { user, role } = useAuth();
  const dashHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <motion.header
      style={{ backdropFilter, backgroundColor: bg }}
      className="fixed top-0 inset-x-0 z-50 border-b border-transparent transition-colors"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          Campus<span className="text-gradient-hero">Event Hub </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#events" className="hover:text-foreground transition-colors">Events</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Why us</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="hero" size="sm">
              <Link to={dashHref}>Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};
