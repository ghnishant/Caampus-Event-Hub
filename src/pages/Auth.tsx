import { useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

const signupSchema = z.object({
  displayName: z.string().trim().min(2, "At least 2 characters").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  role: z.enum(["student", "admin"]),
  inviteCode: z.string().max(120).optional(),
});
const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Required").max(72),
});

type Mode = "login" | "signup";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);

  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: "", email: "", password: "", role: "student" as const, inviteCode: "" },
  });

  const watchRole = signupForm.watch("role");

  const redirectAfter = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from ?? "/dashboard", { replace: true });
  };

  const onLogin = async (v: z.infer<typeof loginSchema>) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    redirectAfter();
  };

  const onSignup = async (v: z.infer<typeof signupSchema>) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          display_name: v.displayName,
          requested_role: v.role,
          admin_invite_code: v.inviteCode ?? "",
        },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome!");
    redirectAfter();
  };

  const onGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (result.error) {
      setSubmitting(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    redirectAfter();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-blob [animation-delay:-6s]" />
      </div>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back." : "Join CampusHub."}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login" ? "Sign in to continue to your events." : "Create your account in seconds."}
              </p>
            </div>

            <div className="glass rounded-3xl border border-border p-7 shadow-elevated">
              <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={submitting}>
                <GoogleIcon /> Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <Field label="Email" error={loginForm.formState.errors.email?.message}>
                      <Input type="email" autoComplete="email" {...loginForm.register("email")} />
                    </Field>
                    <Field label="Password" error={loginForm.formState.errors.password?.message}>
                      <Input type="password" autoComplete="current-password" {...loginForm.register("password")} />
                    </Field>
                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={signupForm.handleSubmit(onSignup)}
                    className="space-y-4"
                  >
                    <Field label="Name" error={signupForm.formState.errors.displayName?.message}>
                      <Input autoComplete="name" {...signupForm.register("displayName")} />
                    </Field>
                    <Field label="Email" error={signupForm.formState.errors.email?.message}>
                      <Input type="email" autoComplete="email" {...signupForm.register("email")} />
                    </Field>
                    <Field label="Password" error={signupForm.formState.errors.password?.message}>
                      <Input type="password" autoComplete="new-password" {...signupForm.register("password")} />
                    </Field>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">I am a</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
                        {(["student", "admin"] as const).map((r) => {
                          const active = watchRole === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => signupForm.setValue("role", r)}
                              className={`relative h-9 rounded-full text-xs font-medium capitalize transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="role-pill"
                                  className="absolute inset-0 rounded-full bg-gradient-hero shadow-glow"
                                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                              )}
                              <span className="relative">{r}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <AnimatePresence>
                      {watchRole === "admin" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <Field label="Admin invite code" error={signupForm.formState.errors.inviteCode?.message}>
                            <Input placeholder="Required for admin access" {...signupForm.register("inviteCode")} />
                          </Field>
                          <p className="text-xs text-muted-foreground -mt-2">
                            Without a valid code, your account is created as a student.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default Auth;
