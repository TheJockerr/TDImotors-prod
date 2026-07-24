// src/types/car.ts

// ─── Imagen de vehículo ──────────────────────────────────────────
export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

// ─── Vehículo completo (desde Supabase) ─────────────────────────
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;          // en CLP
  mileage: number;        // en km
  fuel: string;
  transmission: string;
  plate: string;
  vehicle_type?: string;  // tipo de vehículo (SUV, Sedan, etc.)
  description: string | null;
  owner_count: number;
  features: string[];

  // Flags de estado visual
  is_featured: boolean;      // destacado en home
  is_new_arrival: boolean;   // badge "RECIÉN LLEGADO"
  is_promotion: boolean;     // badge "OFERTA"

  // Estado del vehículo
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived';

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relación con imágenes (join opcional)
  vehicle_images?: VehicleImage[];
}

// ─── Versión ligera para el catálogo (select parcial) ───────────
export interface CarCard {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  vehicle_type?: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_promotion: boolean;
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
  // Solo la imagen primaria (thumbnail)
  vehicle_images?: Pick<VehicleImage, 'public_url' | 'is_primary'>[];
}

// ─── Payload para crear/editar vehículos ────────────────────────
export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  plate: string;
  vehicle_type: string;
  description: string;
  owner_count: number;
  features: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_promotion: boolean;
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
}

// ─── Helper: obtener badge de compatibilidad hacia atrás ─────────
export function getCarBadge(car: Car | CarCard): 'CRÉDITO DIRECTO' | 'RECIÉN LLEGADO' | 'OFERTA' | null {
  if (car.is_featured) return 'CRÉDITO DIRECTO';
  if (car.is_new_arrival) return 'RECIÉN LLEGADO';
  if (car.is_promotion) return 'OFERTA';
  return null;
}

// ─── Helper: obtener URL de imagen principal ─────────────────────
export function getPrimaryImage(images?: Pick<VehicleImage, 'public_url' | 'is_primary'>[]): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  return primary?.public_url ?? images[0]?.public_url ?? null;
}

// ─── Helper: obtener slug amigable del auto ──────────────────────
export function getCarSlug(car: { brand: string; model: string; year: number; id: string }): string {
  const cleanBrand = car.brand.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const cleanModel = car.model.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const suffix = car.id.split('-')[0] || car.id.substring(0, 8);
  return `${cleanBrand}-${cleanModel}-${car.year}-${suffix}`;
}

// ─── Tipos de filtro ─────────────────────────────────────────────
export type FuelType = 'Todos' | 'Bencina' | 'Diesel' | 'Eléctrico' | 'Híbrido';
export type CarStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';