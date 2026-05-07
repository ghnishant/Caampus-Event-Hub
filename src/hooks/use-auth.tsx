import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AppRole = "admin" | "student";

export interface AppUser {
  id: string;
  email: string;
  displayName?: string;
  role: AppRole;
}

interface AuthContextValue {
  token: string | null;
  user: AppUser | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuth: (token: string, user: AppUser) => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  setAuth: () => {},
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const setAuth = (newToken: string, newUser: AppUser) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ token, user, role: user?.role ?? null, loading, signOut, refreshUser, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
