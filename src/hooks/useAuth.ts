// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '../lib/auth';

interface AuthState {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga la sesión inicial
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Suscribirse a cambios de autenticación
    const { data } = onAuthStateChange((s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    loading,
    isAdmin: Boolean(session?.user),
  };
}
