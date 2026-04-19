import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  { tag: "Hackathon", title: "BuildFest '25", date: "Apr 28", location: "Main Auditorium", attendees: 412, hue: "from-violet-500 to-fuchsia-500" },
  { tag: "Workshop", title: "Design Systems Lab", date: "May 04", location: "Block C · 204", attendees: 86, hue: "from-orange-400 to-pink-500" },
  { tag: "Talk", title: "AI in Education", date: "May 12", location: "Open Theatre", attendees: 230, hue: "from-blue-500 to-cyan-400" },
];

export const EventsPreview = () => (
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
        <Button variant="outline">Browse all events</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {events.map((e, i) => (
          <motion.article
            key={e.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:shadow-premium transition-all"
          >
            <div className={`relative h-44 bg-gradient-to-br ${e.hue} overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-30" />
              <span className="absolute top-4 left-4 inline-flex rounded-full glass border border-white/30 px-3 py-1 text-xs font-medium text-white">
                {e.tag}
              </span>
              <div className="absolute bottom-4 right-4 font-display text-3xl font-bold text-white drop-shadow">
                {e.date}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">{e.title}</h3>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{e.location}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{e.attendees}</span>
              </div>
              <Button variant="default" size="sm" className="mt-5 w-full">Register</Button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);
