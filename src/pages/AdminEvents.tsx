import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Plus, MapPin, Loader2, Trash2, Users, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  location: string;
  max_participants: number;
  max_team_size: number;
  organizer_name: string;
  organizer_phone: string;
}

const AdminEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchEvents = async (currentPage: number) => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
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

  const onCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    const fd = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.from("events").insert({
        title: fd.get("title"),
        description: fd.get("description"),
        starts_at: fd.get("startsAt"),
        location: fd.get("location"),
        max_participants: Number(fd.get("maxParticipants")) || 0,
        max_team_size: Number(fd.get("maxTeamSize")) || 1,
        organizer_name: fd.get("organizerName"),
        organizer_phone: fd.get("organizerPhone"),
        created_by: user.id,
      });
      if (error) throw new Error(error.message);
      toast.success("Event created successfully!");
      setOpen(false);
      setPage(1);
      if (page === 1) fetchEvents(1);
    } catch (err: any) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error("Failed to delete event");
    else { toast.success("Event deleted"); fetchEvents(page); }
  };

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Manage <span className="text-gradient-hero">Events.</span></h1>
            <p className="mt-2 text-muted-foreground max-w-xl">Create and edit events with team configurations and organizer details.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="hero" className="rounded-2xl"><Plus className="h-4 w-4 mr-2" /> Create Event</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-2xl">New Event</DialogTitle></DialogHeader>
              <form onSubmit={onCreateEvent} className="space-y-4 pt-4 pb-4">
                <div className="space-y-2"><Label htmlFor="title">Event Title</Label><Input id="title" name="title" placeholder="Annual Hackathon" required /></div>
                <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" name="description" placeholder="Short summary..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="startsAt">Date & Time</Label><Input id="startsAt" name="startsAt" type="datetime-local" required /></div>
                  <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" name="location" placeholder="Auditorium" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="space-y-2"><Label htmlFor="maxParticipants">Capacity (Total)</Label><Input id="maxParticipants" name="maxParticipants" type="number" defaultValue="0" /></div>
                  <div className="space-y-2"><Label htmlFor="maxTeamSize">Max Team Size</Label><Input id="maxTeamSize" name="maxTeamSize" type="number" defaultValue="1" min="1" max="10" /></div>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><User className="h-3 w-3" /> Organizer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="organizerName">Name</Label><Input id="organizerName" name="organizerName" placeholder="Dr. Smith" required /></div>
                    <div className="space-y-2"><Label htmlFor="organizerPhone">Mobile Number</Label><Input id="organizerPhone" name="organizerPhone" placeholder="+91..." required /></div>
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full mt-4" disabled={creating}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Publish Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Event</th>
                <th className="px-6 py-4 text-sm font-semibold">Details</th>
                <th className="px-6 py-4 text-sm font-semibold">Organizer</th>
                <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No events managed yet.</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{event.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1"><MapPin className="h-3 w-3" /> {event.location}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Size: {event.max_team_size > 1 ? `Team (${event.max_team_size})` : "Solo"}</div>
                        <div className="text-[10px] uppercase">Cap: {event.max_participants || "∞"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{event.organizer_name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" /> {event.organizer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AdminEvents;
