import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "../utils/supabase";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: { accessToken?: string; user: AuthUser }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as AuthUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = useCallback((data: { accessToken?: string; user: AuthUser }) => {
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    const uid = session?.user?.id;
    if (!uid) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, first_name, last_name, phone, email")
      .eq("id", uid)
      .single();

    if (error || !data) return;

    const next: AuthUser = {
      id: uid,
      email: (data.email as string) ?? session?.user.email ?? "",
      role: String(data.role),
      full_name: (data.full_name as string | null) ?? undefined,
      first_name: data.first_name as string | null,
      last_name: data.last_name as string | null,
      phone: data.phone as string | null,
    };
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
