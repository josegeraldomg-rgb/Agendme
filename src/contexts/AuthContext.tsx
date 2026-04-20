import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  empresa_id: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, meta?: { nome?: string; telefone?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data as Profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn("Erro ao buscar profile", err);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await fetchProfile(currentUser.id);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // 1) Bootstrap: get the persisted session synchronously-ish
    // This is the ONLY place we set the initial auth state.
    async function bootstrap() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão inicial", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    // 2) Listen for SUBSEQUENT auth changes (sign-in, sign-out, token refresh)
    // IMPORTANT: Do NOT do heavy async work inside this callback.
    // Supabase docs warn that making Supabase calls inside this listener
    // can cause deadlocks. We use setTimeout(0) to move fetchProfile
    // out of the listener's synchronous call stack.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        // Skip INITIAL_SESSION — already handled by bootstrap above
        if (event === "INITIAL_SESSION") return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer the profile fetch to avoid Supabase listener deadlock
          setTimeout(() => {
            if (mounted) fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        // On sign out, clear all cached queries
        if (event === "SIGNED_OUT") {
          queryClient.clear();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, queryClient]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, meta?: { nome?: string; telefone?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear state BEFORE calling Supabase to avoid stale renders
    setUser(null);
    setSession(null);
    setProfile(null);
    queryClient.clear();
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
