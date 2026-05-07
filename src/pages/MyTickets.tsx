import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import { Ticket, Calendar, MapPin, Loader2, QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface Registration {
  _id: string;
  eventId: { title: string; startsAt: string; location: string };
  attended: boolean;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MyTickets = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/events/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const downloadQR = (regId: string, title: string) => {
    const canvas = document.getElementById(`qr-${regId}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ticket downloaded!");
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl font-bold tracking-tight">
          My <span className="text-gradient-hero">Tickets.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Download your tickets or present the QR codes at the entrance.
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold">No tickets yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">Register for some events to see your digital tickets here.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((reg, i) => (
              <motion.div
                key={reg._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:shadow-glow-sm transition-all"
              >
                <div className="bg-gradient-hero h-2 px-6" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-display text-lg font-bold leading-tight line-clamp-2">{reg.eventId.title}</h3>
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-border">
                      <QRCodeCanvas 
                        id={`qr-${reg._id}`}
                        value={reg._id} 
                        size={80}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {reg.eventId.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(reg.eventId.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full rounded-xl gap-2"
                      onClick={() => downloadQR(reg._id, reg.eventId.title)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download PNG
                    </Button>
                    
                    <div className="pt-4 border-t border-dashed border-border flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</div>
                        <div className={`text-xs font-bold ${reg.attended ? "text-green-500" : "text-primary"}`}>
                          {reg.attended ? "CHECKED IN" : "VALID TICKET"}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        ID: {reg._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
};

export default MyTickets;
