import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export const StatCard = ({
  icon: Icon, label, value, hint, delay = 0,
}: { icon: LucideIcon; label: string; value: number; hint?: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4 }}
    className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all"
  >
    <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-[0.06] transition-opacity" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-4xl font-bold tracking-tight">
          <AnimatedCounter value={value} />
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
    </div>
  </motion.div>
);
