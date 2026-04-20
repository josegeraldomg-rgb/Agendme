import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  empresa_id: string | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Flag to prevent getSession from overwriting state already set by onAuthStateChange
  // This fixes a race condition that causes infinite loading in production (Vercel cold starts)
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Usar maybeSingle em vez de single() evita erro 406
      
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
    // Failsafe de timeout para forçar a renderização se o SDK do Supabase travar silenciosamente
    const failsafe = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // onAuthStateChange is the source of truth for session changes.
    // It fires first on page load with the persisted session (INITIAL_SESSION event).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          initializedRef.current = true; // Mark as initialized so getSession below is skipped
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Erro no onAuthStateChange", err);
        } finally {
          setLoading(false);
        }
      }
    );

    // getSession is a fallback for environments where onAuthStateChange
    // may not fire (e.g. Safari private mode). Skip if already initialized.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (initializedRef.current) return; // onAuthStateChange already handled this
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão inicial", err);
      } finally {
        setLoading(false);
      }
    }).catch(err => {
      console.error("Erro fatal no getSession do Supabase", err);
      setLoading(false);
    });

    return () => {
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
    await supabase.auth.signOut();
    setProfile(null);
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
