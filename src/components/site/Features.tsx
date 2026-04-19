import { motion } from "framer-motion";
import { CalendarDays, QrCode, BarChart3, Award, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  { icon: CalendarDays, title: "Effortless event creation", desc: "Spin up an event in under a minute with rich media, capacity, and schedules." },
  { icon: QrCode, title: "QR-based tickets", desc: "Each registration gets a unique, signed QR pass — verifiable in a single scan." },
  { icon: BarChart3, title: "Real-time analytics", desc: "Watch registrations and check-ins update live with beautiful charts." },
  { icon: Award, title: "Auto-certificates", desc: "Issue branded certificates to attendees the moment an event ends." },
  { icon: ShieldCheck, title: "Secure by default", desc: "Role-based access, encrypted secrets, and audited routes — out of the box." },
  { icon: Sparkles, title: "Designed to delight", desc: "An interface so polished, your students will actually want to RSVP." },
];

export const Features = () => (
  <section id="features" className="relative py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-sm font-medium text-primary uppercase tracking-widest">Everything you need</p>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Built for the way <span className="text-gradient-hero">students gather.</span>
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Six thoughtful modules. One seamless experience. Zero learning curve.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="group relative rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-elevated transition-all"
          >
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-hero opacity-0 group-hover:opacity-[0.06] transition-opacity" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
              <f.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
