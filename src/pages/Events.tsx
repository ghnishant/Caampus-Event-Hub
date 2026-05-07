import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Calendar, MapPin, Loader2, Sparkles, UserCheck, Phone, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Event {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  maxTeamSize: number;
  organizerName: string;
  organizerPhone: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Events = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<{name: string, email: string}[]>([]);

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

  const addMember = () => {
    if (!registering) return;
    if (teamMembers.length >= (registering.maxTeamSize - 1)) {
      toast.error(`Maximum ${registering.maxTeamSize} members allowed including you.`);
      return;
    }
    setTeamMembers([...teamMembers, { name: "", email: "" }]);
  };

  const removeMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: "name" | "email", value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index][field] = value;
    setTeamMembers(newMembers);
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registering) return;
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      year: formData.get("year"),
      department: formData.get("department"),
      phoneNumber: formData.get("phoneNumber"),
      teamName: formData.get("teamName"),
      teamMembers: teamMembers,
    };

    try {
      const res = await fetch(`${API_URL}/events/${registering._id}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      toast.success("Successfully registered!");
      setRegistering(null);
      setTeamMembers([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Browse <span className="text-gradient-hero">Events.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Discover workshops, hackathons, and talks happening on campus.
        </p>
        
        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="mt-12 p-12 text-center rounded-3xl border border-dashed border-border bg-muted/20">
            <p className="text-muted-foreground italic">No upcoming events found.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col rounded-3xl border border-border bg-card shadow-soft hover:shadow-glow-sm transition-all"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display text-xl font-bold line-clamp-2 leading-tight">{event.title}</h3>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                    {event.description || "Join this exciting campus opportunity."}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(event.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Organizer</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">{event.organizerName}</div>
                      <a href={`tel:${event.organizerPhone}`} className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <Button variant="hero" className="w-full rounded-2xl" onClick={() => setRegistering(event)}>
                    Register Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={!!registering} onOpenChange={(o) => { if(!o) { setRegistering(null); setTeamMembers([]); } }}>
          <DialogContent className="rounded-[2.5rem] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" /> Event Registration
              </DialogTitle>
            </DialogHeader>
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
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" required className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Mobile Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" placeholder="+91..." required className="rounded-xl h-11" />
                </div>
              </div>

              {registering && registering.maxTeamSize > 1 && (
                <div className="space-y-4 pt-4 border-t border-dashed border-border">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-between">
                    Team Information
                    <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">Max {registering.maxTeamSize}</span>
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input id="teamName" name="teamName" required className="rounded-xl h-11 border-primary/20" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs">Team Members (Optional)</Label>
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="flex gap-2 p-3 rounded-2xl bg-muted/30 border border-border relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white"
                          onClick={() => removeMember(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 space-y-2">
                          <Input 
                            placeholder="Member Name" 
                            value={member.name} 
                            onChange={(e) => updateMember(idx, "name", e.target.value)} 
                            className="h-9 rounded-lg"
                          />
                          <Input 
                            placeholder="Member Email" 
                            type="email"
                            value={member.email} 
                            onChange={(e) => updateMember(idx, "email", e.target.value)} 
                            className="h-9 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                    {teamMembers.length < (registering.maxTeamSize - 1) && (
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
