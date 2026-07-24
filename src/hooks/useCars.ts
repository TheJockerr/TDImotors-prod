// src/hooks/useCars.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCarSlug, type Car, type CarCard } from '../types/car';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockCars } from '../data/mockCars';
import { getCachedInventory, setCachedInventory } from '../lib/carCache';

const PAGE_SIZE = 9;

// ─── Campos ligeros para el catálogo (evita traer campos pesados) ──
const CATALOG_SELECT = `
  id,
  brand,
  model,
  year,
  price,
  mileage,
  fuel,
  vehicle_type,
  is_featured,
  is_new_arrival,
  is_promotion,
  status,
  vehicle_images (public_url, is_primary, sort_order)
`.trim();

/**
 * Helper interno para obtener todo el inventario público con caché.
 */
async function fetchFullInventory(): Promise<CarCard[]> {
  const cached = getCachedInventory();
  if (cached) {
    return cached;
  }

  if (!isSupabaseConfigured) {
    setCachedInventory(mockCars as CarCard[]);
    return mockCars as CarCard[];
  }

  const { data, error } = await supabase!
    .from('vehicles')
    .select(CATALOG_SELECT)
    .in('status', ['available', 'reserved'])
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[useCars] Error al cargar inventario:', error);
    return [];
  }

  const result = (data ?? []) as unknown as CarCard[];
  setCachedInventory(result);
  return result;
}

// ─── Hook para catálogo con caché y filtrado integral ────────────
export function useCars() {
  const [allInventory, setAllInventory] = useState<CarCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const fetchInventory = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (forceRefresh) {
        // Ignorar caché si se solicita refresco forzado
        if (isSupabaseConfigured) {
          const { data, error: err } = await supabase!
            .from('vehicles')
            .select(CATALOG_SELECT)
            .in('status', ['available', 'reserved'])
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });

          if (err) throw err;
          const result = (data ?? []) as unknown as CarCard[];
          setCachedInventory(result);
          setAllInventory(result);
        } else {
          setAllInventory(mockCars as CarCard[]);
        }
      } else {
        const inventory = await fetchFullInventory();
        setAllInventory(inventory);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los vehículos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Lista única de marcas dinámicas basadas en TODO el inventario disponible
  const allBrands = useMemo(() => {
    const set = new Set(allInventory.map((c) => c.brand));
    return Array.from(set).sort();
  }, [allInventory]);

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }, []);

  return {
    allInventory,
    allBrands,
    loading,
    error,
    displayCount,
    hasMore: displayCount < allInventory.length,
    loadMore,
    refetch: () => fetchInventory(true),
  };
}

// ─── Hook para vehículos destacados (Home) con caché ─────────────
export function useFeaturedCars() {
  const [cars, setCars] = useState<CarCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      const inventory = await fetchFullInventory();
      const featured = inventory
        .filter((c) => c.is_featured || c.is_new_arrival || c.is_promotion)
        .slice(0, 3);

      setCars(featured);
      setLoading(false);
    }

    loadFeatured();
  }, []);

  return { cars, loading };
}

// ─── Hook para detalle completo de un vehículo ───────────────────
export function useCarById(id: string) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchCar() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        const found = mockCars.find((c) => {
          const slug = getCarSlug(c);
          return c.id === id || slug === id;
        }) ?? null;
        setCar(found as Car | null);
        setLoading(false);
        return;
      }

      // Determinar si id es un UUID o un slug amigable
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let realId = id;

      try {
        if (!isUuid) {
          // Extraer sufijo (última parte después del guion)
          const parts = id.split('-');
          const suffix = parts[parts.length - 1];
          
          if (suffix && suffix.length === 8) {
            const { data: rpcData, error: rpcErr } = await supabase!
              .rpc('get_vehicle_by_slug_suffix', { suffix });
            
            if (rpcErr) throw rpcErr;
            
            const matchedVehicle = rpcData && rpcData.length > 0 ? rpcData[0] : null;
            if (matchedVehicle) {
              realId = matchedVehicle.id;
            } else {
              setCar(null);
              setLoading(false);
              return;
            }
          } else {
            setCar(null);
            setLoading(false);
            return;
          }
        }

        const { data, error: err } = await supabase!
          .from('vehicles')
          .select(`*, vehicle_images (*)`)
          .eq('id', realId)
          .single();

        if (err) {
          setError(err.message);
          setCar(null);
        } else {
          setCar(data as unknown as Car);
        }
      } catch (err: any) {
        setError(err.message || 'Error al buscar el vehículo.');
        setCar(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCar();
  }, [id]);

  return { car, loading, error };
}

// ─── Hook para admin: todos los vehículos ─────────────────────────
export function useAdminCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setCars(mockCars as Car[]);
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase!
      .from('vehicles')
      .select(`*, vehicle_images (*)`)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setCars((data ?? []) as unknown as Car[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cars, loading, error, refetch };
}