import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2, UserCheck, Phone, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  location: string;
  max_team_size: number;
  max_participants: number;
  organizer_name: string;
  organizer_phone: string;
}

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;
  const [registering, setRegistering] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{name: string, email: string}[]>([]);

  const fetchEvents = async (currentPage: number) => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .order("starts_at", { ascending: true })
      .range(from, to);

    if (error) {
      toast.error("Failed to fetch events");
    } else {
      setEvents(data ?? []);
      setTotalPages(Math.ceil((count ?? 0) / PAGE_SIZE) || 1);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(page); }, [page]);

  const addMember = () => {
    if (!registering) return;
    if (teamMembers.length >= (registering.max_team_size - 1)) {
      toast.error(`Maximum ${registering.max_team_size} members allowed including you.`);
      return;
    }
    setTeamMembers([...teamMembers, { name: "", email: "" }]);
  };

  const removeMember = (i: number) => {
    if (registering && registering.max_team_size > 1 && teamMembers.length <= 1) {
      toast.error("At least one team member is required for team events.");
      return;
    }
    setTeamMembers(teamMembers.filter((_, idx) => idx !== i));
  };

  const updateMember = (i: number, field: "name" | "email", value: string) => {
    const m = [...teamMembers]; 
    m[i] = { ...m[i], [field]: value };
    setTeamMembers(m);
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registering || !user) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (registering.max_participants > 0) {
        const { count } = await supabase.from("registrations").select("id", { count: "exact", head: true }).eq("event_id", registering.id);
        if ((count ?? 0) >= registering.max_participants) throw new Error("Event is already full");
      }
      const { error } = await supabase.from("registrations").insert({
        user_id: user.id, event_id: registering.id,
        year: fd.get("year"), department: fd.get("department"),
        phone_number: fd.get("phoneNumber"),
        team_name: fd.get("teamName") || null,
        team_members: teamMembers.length > 0 ? teamMembers : [],
      });
      if (error) throw new Error(error.code === "23505" ? "Already registered for this event" : error.message);
      toast.success("Successfully registered!");
      setRegistering(null); setTeamMembers([]);
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl font-bold tracking-tight">Browse <span className="text-gradient-hero">Events.</span></h1>
        <p className="mt-2 text-muted-foreground max-w-xl">Discover workshops, hackathons, and talks happening on campus.</p>
        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <div className="mt-12 p-12 text-center rounded-3xl border border-dashed border-border bg-muted/20"><p className="text-muted-foreground italic">No upcoming events found.</p></div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group relative flex flex-col rounded-3xl border border-border bg-card shadow-soft hover:shadow-glow-sm transition-all">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display text-xl font-bold line-clamp-2 leading-tight">{event.title}</h3>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{event.description || "Join this exciting campus opportunity."}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {event.location}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {new Date(event.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Organizer</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">{event.organizer_name}</div>
                      <a href={`tel:${event.organizer_phone}`} className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"><Phone className="h-4 w-4" /></a>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto"><Button variant="hero" className="w-full rounded-2xl" onClick={() => {
                  setRegistering(event);
                  if (event.max_team_size > 1) {
                    setTeamMembers([{ name: "", email: "" }]);
                  } else {
                    setTeamMembers([]);
                  }
                }}>Register Now</Button></div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <span className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        )}

        <Dialog open={!!registering} onOpenChange={(o) => { if(!o) { setRegistering(null); setTeamMembers([]); } }}>
          <DialogContent className="rounded-[2.5rem] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-2xl flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary" /> Event Registration</DialogTitle></DialogHeader>
            <form onSubmit={onRegister} className="space-y-6 pt-4 pb-6 px-1">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Personal Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select name="year" required>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" name="department" required className="rounded-xl h-11" /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="phoneNumber">Mobile Number</Label><Input id="phoneNumber" name="phoneNumber" placeholder="+91..." required className="rounded-xl h-11" /></div>
              </div>
              {registering && registering.max_team_size > 1 && (
                <div className="space-y-4 pt-4 border-t border-dashed border-border">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-between">Team Information<span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">Max {registering.max_team_size}</span></h4>
                  <div className="space-y-2"><Label htmlFor="teamName">Team Name</Label><Input id="teamName" name="teamName" required className="rounded-xl h-11 border-primary/20" /></div>
                  <div className="space-y-3">
                    <Label className="text-xs">Team Members (Required)</Label>
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="flex gap-2 p-3 rounded-2xl bg-muted/30 border border-border relative">
                        {teamMembers.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white" onClick={() => removeMember(idx)}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input placeholder="Member Name" required value={member.name} onChange={(e) => updateMember(idx, "name", e.target.value)} className="h-9 rounded-lg" />
                          <Input placeholder="Member Email" type="email" required value={member.email} onChange={(e) => updateMember(idx, "email", e.target.value)} className="h-9 rounded-lg" />
                        </div>
                      </div>
                    ))}
                    {teamMembers.length < (registering.max_team_size - 1) && (
                      <Button type="button" variant="outline" className="w-full rounded-xl border-dashed py-6" onClick={addMember}>
                        <Plus className="h-4 w-4 mr-2" /> Add Team Member
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <Button type="submit" variant="hero" className="w-full rounded-2xl py-6 text-lg mt-4 shadow-glow" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppShell>
  );
};

export default Events;
