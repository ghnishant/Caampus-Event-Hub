import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "student";

export interface AppUser {
  id: string;
  email: string;
  displayName?: string;
  role: AppRole;
}

interface AuthContextValue {
  session: Session | null;
  user: AppUser | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.error("Failed to fetch profile:", error);
        setUser({ id: userId, email, role: "student" });
        return;
      }

      setUser({
        id: userId,
        email,
        displayName: data.display_name,
        role: data.role as AppRole,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setUser({ id: userId, email, role: "student" });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email ?? "").then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          await fetchProfile(s.user.id, s.user.email ?? "");
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id, session.user.email ?? "");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role: user?.role ?? null,
        loading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
