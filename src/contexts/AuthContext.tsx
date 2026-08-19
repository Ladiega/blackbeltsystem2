"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/libs/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  isLoggedIn: boolean;
  cargando: boolean;
  user: User | null;
  nombreUsuario: string;
  login: (email: string, password: string) => Promise<{ exito: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarNombreUsuario(session.user.id);
      }
      setCargando(false);
    }).catch(() => {
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarNombreUsuario(session.user.id);
      } else {
        setNombreUsuario("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cargarNombreUsuario(userId: string) {
    const { data } = await supabase
      .from("usuarios")
      .select("nombre")
      .eq("id", userId)
      .single();

    if (data) {
      setNombreUsuario(data.nombre);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { exito: false, error: error.message };
    }

    if (data.user) {
      await cargarNombreUsuario(data.user.id);
    }

    return { exito: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNombreUsuario("");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, cargando, user, nombreUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
