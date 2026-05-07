import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Plus, Calendar, MapPin, Loader2, Trash2, Users, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Event {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  maxParticipants: number;
  maxTeamSize: number;
  organizerName: string;
  organizerPhone: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const onCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      startsAt: formData.get("startsAt"),
      location: formData.get("location"),
      maxParticipants: Number(formData.get("maxParticipants")) || 0,
      maxTeamSize: Number(formData.get("maxTeamSize")) || 1,
      organizerName: formData.get("organizerName"),
      organizerPhone: formData.get("organizerPhone"),
    };

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast.success("Event created successfully!");
      setOpen(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Event deleted");
        fetchEvents();
      }
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Manage <span className="text-gradient-hero">Events.</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Create and edit events with team configurations and organizer details.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="rounded-2xl">
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreateEvent} className="space-y-4 pt-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" placeholder="Annual Hackathon" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Short summary..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startsAt">Date & Time</Label>
                    <Input id="startsAt" name="startsAt" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" placeholder="Auditorium" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Capacity (Total)</Label>
                    <Input id="maxParticipants" name="maxParticipants" type="number" defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTeamSize">Max Team Size</Label>
                    <Input id="maxTeamSize" name="maxTeamSize" type="number" defaultValue="1" min="1" max="10" />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <User className="h-3 w-3" /> Organizer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizerName">Name</Label>
                      <Input id="organizerName" name="organizerName" placeholder="Dr. Smith" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizerPhone">Mobile Number</Label>
                      <Input id="organizerPhone" name="organizerPhone" placeholder="+91..." required />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full mt-4" disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publish Event
                </Button>
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
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No events managed yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{event.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Size: {event.maxTeamSize > 1 ? `Team (${event.maxTeamSize})` : "Solo"}
                        </div>
                        <div className="text-[10px] uppercase">Cap: {event.maxParticipants || "∞"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{event.organizerName}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {event.organizerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEvent(event._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default AdminEvents;
