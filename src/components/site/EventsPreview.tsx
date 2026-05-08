import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

const hues = [
  "from-violet-500 to-fuchsia-500",
  "from-orange-400 to-pink-500",
  "from-blue-500 to-cyan-400",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-red-500",
  "from-amber-400 to-orange-500"
];


export const EventsPreview = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true })
      .limit(3)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  const browseHref = user ? "/dashboard/events" : "/auth";

  return (
    <section id="events" className="py-24 sm:py-32 bg-gradient-subtle">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest">This week on campus</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">Happening soon.</h2>
          </motion.div>
          <Button asChild variant="outline">
            <Link to={browseHref}>Browse all events</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-border bg-muted/20">
            <p className="text-muted-foreground italic">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((e, i) => {
              const date = new Date(e.starts_at);
              const month = date.toLocaleString('default', { month: 'short' });
              const day = date.getDate();
              const hue = hues[i % hues.length];

              return (
                <motion.article
                  key={e.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8 }}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:shadow-premium transition-all"
                >
                  <div className={`relative h-44 bg-gradient-to-br ${hue} overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-30" />
                    <span className="absolute top-4 left-4 inline-flex rounded-full glass border border-white/30 px-3 py-1 text-xs font-medium text-white">
                      {e.max_team_size > 1 ? "Team Event" : "Individual"}
                    </span>
                    <div className="absolute bottom-4 right-4 font-display text-3xl font-bold text-white drop-shadow">
                      {month} {day}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">{e.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{e.location}</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{e.max_participants || "∞"} spots</span>
                    </div>
                    <Button asChild variant="default" size="sm" className="mt-5 w-full">
                      <Link to={browseHref}>Register</Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
