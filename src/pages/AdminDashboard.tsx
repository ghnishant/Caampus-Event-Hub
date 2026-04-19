import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { StatCard } from "@/components/app/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats { totalEvents: number; totalRegistrations: number; checkedIn: number; }

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<{ day: string; regs: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: e }, { count: r }, { count: a }, { data: recent }] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("attended", true),
        supabase.from("registrations").select("created_at").gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()),
      ]);

      setStats({ totalEvents: e ?? 0, totalRegistrations: r ?? 0, checkedIn: a ?? 0 });

      // Build last-7-days bucket
      const buckets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return { day: d.toLocaleDateString(undefined, { weekday: "short" }), key: d.toISOString().slice(0, 10), regs: 0 };
      });
      (recent ?? []).forEach((row: { created_at: string }) => {
        const k = row.created_at.slice(0, 10);
        const b = buckets.find((b) => b.key === k);
        if (b) b.regs += 1;
      });
      setChart(buckets.map(({ day, regs }) => ({ day, regs })));
    })();
  }, []);

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="mt-1 font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Operations <span className="text-gradient-hero">overview.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Real-time numbers across every event you're running.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats ? (
          <>
            <StatCard icon={Calendar} label="Total events" value={stats.totalEvents} delay={0.05} />
            <StatCard icon={Users} label="Registrations" value={stats.totalRegistrations} delay={0.10} />
            <StatCard icon={Activity} label="Checked in" value={stats.checkedIn} delay={0.15} />
            <StatCard
              icon={TrendingUp}
              label="Attendance rate"
              value={stats.totalRegistrations ? Math.round((stats.checkedIn / stats.totalRegistrations) * 100) : 0}
              hint="Percent of registrants present"
              delay={0.20}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold">Registrations · last 7 days</h3>
            <p className="text-sm text-muted-foreground">Daily new sign-ups across all events.</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="regs" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#regs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Placeholder title="Events module" desc="Create / edit / delete events with QR ticketing — coming next." />
        <Placeholder title="Live attendance" desc="Real-time check-ins via QR scan — coming next." />
      </div>
    </AppShell>
  );
};

const Placeholder = ({ title, desc }: { title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className="rounded-3xl border border-dashed border-border p-8 text-center"
  >
    <h4 className="font-display text-lg font-semibold">{title}</h4>
    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
  </motion.div>
);

export default AdminDashboard;
