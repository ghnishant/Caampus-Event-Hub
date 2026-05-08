import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Users, Loader2, Mail, Phone, GraduationCap, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Registration {
  id: string;
  profiles: { email: string; display_name?: string };
  events: { title: string };
  year: string;
  department: string;
  phone_number?: string;
  team_name?: string;
  team_members?: { name: string; email: string }[];
  attended: boolean;
  created_at: string;
}

const Registrations = () => {
  const { user } = useAuth();
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await supabase
          .from("registrations")
          .select("*, profiles(email, display_name), events(title)", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        setRegs((data as any) ?? []);
        setTotalPages(Math.ceil((count ?? 0) / PAGE_SIZE) || 1);
      } catch (err) {
        toast.error("Failed to load registrations");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, page]);

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl font-bold tracking-tight">Event <span className="text-gradient-hero">Registrations.</span></h1>
        <p className="mt-2 text-muted-foreground max-w-xl">Full database of participants, team configurations, and contact information.</p>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Student & Contact</th>
                <th className="px-6 py-4 text-sm font-semibold">Academic Info</th>
                <th className="px-6 py-4 text-sm font-semibold">Registration Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : regs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No registrations found.</td></tr>
              ) : (
                regs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-bold text-white">
                          {(reg.profiles.display_name || reg.profiles.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{reg.profiles.display_name || "Student"}</div>
                          <div className="flex flex-col text-[10px] text-muted-foreground gap-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {reg.profiles.email}</span>
                            <span className="flex items-center gap-1 font-medium text-primary"><Phone className="h-2.5 w-2.5" /> {reg.phone_number || "No Phone"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary" /> {reg.year}</div>
                      <div className="text-[11px] text-muted-foreground">{reg.department}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {reg.team_name ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="font-bold text-accent flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {reg.team_name}</div>
                          <div className="text-[10px] text-muted-foreground">Team Registration</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground italic"> Solo Entry </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl gap-2 hover:bg-primary/10 hover:text-primary"><Info className="h-4 w-4" /> View Full</Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl max-w-md">
                          <DialogHeader><DialogTitle className="font-display text-xl">Registration Details</DialogTitle></DialogHeader>
                          <div className="space-y-6 pt-4">
                            <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
                              <div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Event Name</div>
                                <div className="font-bold text-primary">{reg.events.title}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</div>
                                  <div className={`text-xs font-bold ${reg.attended ? "text-green-500" : "text-blue-500"}`}>{reg.attended ? "CHECKED IN" : "PENDING"}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</div>
                                  <div className="text-xs">{new Date(reg.created_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                            {reg.team_name && (
                              <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2"><Users className="h-4 w-4" /> Team: {reg.team_name}</h4>
                                <div className="space-y-2">
                                  {reg.team_members?.map((member, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-card border border-border shadow-sm">
                                      <div className="text-sm font-bold">{member.name}</div>
                                      <div className="text-xs text-muted-foreground">{member.email}</div>
                                    </div>
                                  ))}
                                  {(!reg.team_members || reg.team_members.length === 0) && (
                                    <p className="text-xs text-muted-foreground italic">No additional members listed.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
};

export default Registrations;
