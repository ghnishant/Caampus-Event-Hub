import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Calendar, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/app/StatCard";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [eventsRes, regsRes, checkedRes] = await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id", { count: "exact", head: true }).eq("attended", true),
        ]);

        setData({
          totalEvents: eventsRes.count ?? 0,
          totalRegistrations: regsRes.count ?? 0,
          checkedIn: checkedRes.count ?? 0,
        });
      } catch (err) {
        toast.error("Failed to load analytics");
      }
    })();
  }, [user]);

  const pieData = [
    { name: 'Attended', value: data?.checkedIn || 0 },
    { name: 'No-show', value: (data?.totalRegistrations - data?.checkedIn) || 0 },
  ];

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Campus <span className="text-gradient-hero">Analytics.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Deep dive into event performance and student engagement.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Reach" value={data?.totalRegistrations || 0} delay={0.1} />
          <StatCard icon={Activity} label="Engagement" value={data?.totalRegistrations ? Math.round((data.checkedIn / data.totalRegistrations) * 100) : 0} hint="%" delay={0.2} />
          <StatCard icon={Calendar} label="Events" value={data?.totalEvents || 0} delay={0.3} />
          <StatCard icon={TrendingUp} label="Growth" value="+12%" hint="vs last month" delay={0.4} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl border border-border p-6 shadow-soft">
            <h3 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Registration Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mon', val: 12 }, { name: 'Tue', val: 18 }, { name: 'Wed', val: 22 }, 
                  { name: 'Thu', val: 15 }, { name: 'Fri', val: 25 }, { name: 'Sat', val: 30 }, { name: 'Sun', val: 20 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-3xl border border-border p-6 shadow-soft">
            <h3 className="font-display text-xl font-semibold mb-6">Attendance Breakdown</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[0]}} /> Attended</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[1]}} /> No-show</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Analytics;
