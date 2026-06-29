// src/lib/auth.ts
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

// ─── Login ───────────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) {
    return { user: null, error: 'Supabase no configurado. Revisa las variables de entorno.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, error: error.message };
  }

  // Verificar que el usuario tiene rol admin
  const adminCheck = await isAdmin(data.user?.id ?? '');
  if (!adminCheck) {
    await supabase.auth.signOut();
    return { user: null, error: 'No tienes permisos de administrador.' };
  }

  return { user: data.user, error: null };
}

// ─── Logout ──────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ─── Sesión actual ───────────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Verificar si es admin ───────────────────────────────────────
export async function isAdmin(userId: string): Promise<boolean> {
  if (!supabase || !userId) return false;

  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !error && Boolean(data);
}

// ─── Suscribirse a cambios de autenticación ──────────────────────
export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
