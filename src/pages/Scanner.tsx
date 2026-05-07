import { useEffect, useState, useRef } from "react";
import { AppShell } from "@/components/app/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Loader2, CheckCircle2, XCircle, Camera, RefreshCw, Keyboard, Upload, Image as ImageIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Scanner = () => {
  const { token } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [manualId, setManualId] = useState("");
  const [hasCamera, setHasCamera] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerId = "reader";

  useEffect(() => {
    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length > 0) {
        setHasCamera(true);
        startScanner();
      }
    }).catch(err => {
      console.error("No cameras found", err);
    });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      if (scannerRef.current) await stopScanner();
      
      const html5QrCode = new Html5Qrcode(readerId);
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 20, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleCheckIn(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      console.error("Unable to start scanner", err);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setChecking(true);
    try {
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      handleCheckIn(decodedText);
    } catch (err) {
      toast.error("Could not find a QR code in this image");
      setChecking(false);
    }
  };

  const handleCheckIn = async (registrationId: string) => {
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/events/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-in failed");
      
      setResult({ success: true, ...data.registration });
      toast.success("Check-in successful!");
    } catch (err: any) {
      setResult({ success: false, message: err.message });
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setResult(null);
    setManualId("");
    if (hasCamera) startScanner();
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Verify <span className="text-gradient-hero">Tickets.</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Scan, upload, or enter ID manually to mark attendance.
          </p>
        </header>

        <div className="relative aspect-square w-full max-w-[400px] mx-auto overflow-hidden rounded-[3rem] border-8 border-card bg-black shadow-elevated">
          <AnimatePresence mode="wait">
            {!result && !checking ? (
              <motion.div key="scanner" className="absolute inset-0">
                <div id={readerId} className="h-full w-full object-cover" />
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                  <Button variant="secondary" className="rounded-full bg-white/10 border-white/20 backdrop-blur-md text-white gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Upload Image
                  </Button>
                </div>
              </motion.div>
            ) : checking ? (
              <motion.div key="checking" className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-bold">Processing...</p>
              </motion.div>
            ) : (
              <motion.div key="result" className="absolute inset-0 flex flex-col items-center justify-center bg-card p-8 text-center">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 ${result.success ? "bg-green-500/10" : "bg-destructive/10"}`}>
                  {result.success ? <CheckCircle2 className="h-12 w-12 text-green-500" /> : <XCircle className="h-12 w-12 text-destructive" />}
                </div>
                <h2 className="text-2xl font-bold mb-2">{result.success ? "Success!" : "Check-in Failed"}</h2>
                <div className="text-sm text-muted-foreground mb-8">
                  {result.success ? (
                    <>
                      <p className="font-bold text-foreground text-lg">{result.userId?.displayName}</p>
                      <p>{result.year} · {result.department}</p>
                      <p className="mt-2 text-primary font-medium">{result.eventId?.title}</p>
                    </>
                  ) : (
                    <p className="bg-destructive/10 text-destructive p-3 rounded-xl border border-destructive/20">
                      {result.message || "An unexpected error occurred during verification."}
                    </p>
                  )}
                </div>
                <Button onClick={reset} variant="hero" className="w-full rounded-2xl py-6 text-lg">Next Ticket</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); stopScanner(); handleCheckIn(manualId); }} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter last 8 chars..." value={manualId} onChange={(e) => setManualId(e.target.value)} className="pl-10 rounded-2xl h-12" />
            </div>
            <Button type="submit" variant="secondary" className="rounded-2xl h-12 px-6">Verify</Button>
          </form>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          <div id="reader-hidden" className="hidden" />
        </div>
      </div>
    </AppShell>
  );
};

export default Scanner;
