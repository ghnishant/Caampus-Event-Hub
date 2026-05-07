import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const CTA = () => {
  const { user, role } = useAuth();
  const joinHref = user ? (role === "admin" ? "/admin" : "/dashboard") : "/auth";

  return (
    <section id="stats" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-12 sm:p-20 text-center shadow-premium"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,white,transparent_55%)] opacity-25" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <h2 className="relative font-display text-4xl sm:text-6xl font-bold tracking-tight text-primary-foreground">
            Make your next event<br />unforgettable.
          </h2>
          <p className="relative mt-5 text-lg text-primary-foreground/85 max-w-xl mx-auto">
            Join the student organizers already running smarter, smoother events with Campus Event Hub.
          </p>
          <div className="relative mt-10 flex justify-center gap-3">
            <Button asChild variant="glass" size="lg" className="bg-white text-foreground hover:bg-white/90 group">
              <Link to={joinHref}>
                Start free
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Campus Event Hub · Crafted with care for student communities.
        </p>
      </div>
    </section>
  );
};
