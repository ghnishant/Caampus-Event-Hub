import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Ticket, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app/AppShell";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats { registered: number; upcoming: number; attended: number; }

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/events/student-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Hey {user?.displayName || user?.email?.split("@")[0] || "there"} <span className="text-gradient-hero">👋</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Here's a quick look at your campus activity. Discover new events and bring your tickets to check-in.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {stats ? (
          <>
            <StatCard icon={Ticket} label="Registered events" value={stats.registered} delay={0.05} />
            <StatCard icon={CalendarCheck} label="Upcoming" value={stats.upcoming} delay={0.12} />
            <StatCard icon={Sparkles} label="Attended" value={stats.attended} delay={0.19} />
          </>
        ) : (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-hero p-8 sm:p-10 shadow-premium"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,white,transparent_55%)] opacity-25" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">
              Discover what's happening on campus.
            </h2>
            <p className="mt-2 text-primary-foreground/80 max-w-md">
              Browse hackathons, talks, and workshops — register in one tap.
            </p>
          </div>
          <Button asChild variant="glass" size="lg" className="bg-white text-foreground hover:bg-white/90 group shrink-0">
            <Link to="/dashboard/events">
              Browse events <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default StudentDashboard;
