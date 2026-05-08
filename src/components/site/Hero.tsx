import { motion, type Variants } from "framer-motion";
import { ArrowRight, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import heroMesh from "@/assets/hero-mesh.jpg";

const fade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export const Hero = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, checkedIn: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [eventsRes, regsRes, checkedRes] = await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id", { count: "exact", head: true }).eq("attended", true),
        ]);
        setStats({
          totalEvents: eventsRes.count ?? 0,
          totalRegistrations: regsRes.count ?? 0,
          checkedIn: checkedRes.count ?? 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    })();
  }, []);

  const launchHref = user ? (role === "admin" ? "/admin/events" : "/dashboard/events") : "/auth";

  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={heroMesh}
          alt=""
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-40"
        />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
        <div className="absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-blob [animation-delay:-5s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          New · QR-powered attendance for every event
        </motion.div>

        <motion.h1
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05]"
        >
          Campus events,
          <br />
          <span className="text-gradient-hero">reimagined.</span>
        </motion.h1>

        <motion.p
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          A premium platform for student organizers to host events, issue QR tickets,
          and track real-time attendance — all in one beautifully crafted dashboard.
        </motion.p>

        <motion.div
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild variant="hero" size="lg" className="group">
            <Link to={launchHref}>
              Launch your first event
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="glass" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            <QrCode />
            See it in action
          </Button>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="glass rounded-3xl border border-border shadow-elevated p-2 animate-float">
            <div className="rounded-2xl bg-gradient-subtle p-8 sm:p-12">
              <div className="grid grid-cols-3 gap-6 text-left">
                {[
                  { label: "Live events", value: stats.totalEvents.toLocaleString() },
                  { label: "Registrations", value: stats.totalRegistrations.toLocaleString() },
                  { label: "Check-ins today", value: stats.checkedIn.toLocaleString() },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-3xl sm:text-4xl font-bold text-gradient-hero">{s.value}</div>
                    <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
