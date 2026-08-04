import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingOverlay from "@/components/loading-overlay";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status !== 401) {
          throw new Error("Unable to verify active session.");
        }
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load user session.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to log out. Please try again.");
      }

      setUser(null);
      toast.success("Successfully logged out!");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during logout.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {loading && <LoadingOverlay />}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}