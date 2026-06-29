// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Tipos de base de datos ──────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          mileage: number;
          fuel: string;
          transmission: string;
          plate: string;
          description: string | null;
          owner_count: number;
          features: string[];
          is_featured: boolean;
          is_new_arrival: boolean;
          is_promotion: boolean;
          status: 'available' | 'reserved' | 'sold';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
      };
      vehicle_images: {
        Row: {
          id: string;
          vehicle_id: string;
          storage_path: string;
          public_url: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vehicle_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vehicle_images']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean };
    };
  };
}

// ─── Cliente tipado ──────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn('[TDI Motors] Variables de entorno Supabase no configuradas. Usando datos mock.');
}

export { supabase };

// ─── Helpers de imágenes ─────────────────────────────────────────

/**
 * Construye la URL de imagen transformada por Supabase Storage.
 * Supabase convierte automáticamente a WebP cuando el cliente lo soporta.
 *
 * @param publicUrl  URL pública original de Supabase Storage
 * @param size       'thumbnail' | 'medium' | 'full'
 */
export function getImageUrl(publicUrl: string | null | undefined, size: 'thumbnail' | 'medium' | 'full' = 'medium'): string {
  if (!publicUrl) return '';
  if (size === 'full') return publicUrl;

  // Supabase Storage Image Transformation
  // Reemplaza /storage/v1/object/public/ por /storage/v1/render/image/public/
  const transformBase = publicUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params =
    size === 'thumbnail'
      ? 'width=400&height=280&resize=cover&format=webp&quality=75'
      : 'width=800&height=560&resize=cover&format=webp&quality=85';

  return `${transformBase}?${params}`;
}

/**
 * Construye la URL base pública del bucket de Storage.
 */
export function getStorageUrl(path: string): string {
  if (!supabaseUrl) return '';
  const bucket = import.meta.env.VITE_STORAGE_BUCKET ?? 'vehicle-images';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/** Indica si Supabase está configurado (o estamos en modo mock) */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);