// src/hooks/useCars.ts
import { useState, useEffect, useCallback } from 'react';
import { getCarSlug, type Car, type CarCard } from '../types/car';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockCars } from '../data/mockCars';

const PAGE_SIZE = 9;

// ─── Campos ligeros para el catálogo (evita traer todo) ──────────
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

// ─── Hook para catálogo con paginación ───────────────────────────
export function useCars() {
  const [cars, setCars] = useState<CarCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const fetchPage = useCallback(async (pageIndex: number, append: boolean) => {
    if (pageIndex === 0) setLoading(true);
    else setLoadingMore(true);

    // Modo mock
    if (!isSupabaseConfigured) {
      await new Promise((r) => setTimeout(r, 200)); // simula latencia
      const start = pageIndex * PAGE_SIZE;
      const slice = mockCars.slice(start, start + PAGE_SIZE);
      setCars((prev) => (append ? [...prev, ...slice] as CarCard[] : slice as CarCard[]));
      setHasMore(start + PAGE_SIZE < mockCars.length);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: err, count } = await supabase!
      .from('vehicles')
      .select(CATALOG_SELECT, { count: 'exact' })
      .in('status', ['available', 'reserved'])
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (err) {
      setError(err.message);
    } else {
      const newCars = (data ?? []) as unknown as CarCard[];
      setCars((prev) => (append ? [...prev, ...newCars] : newCars));
      setHasMore((count ?? 0) > from + PAGE_SIZE);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, fetchPage]);

  return { cars, loading, loadingMore, error, hasMore, loadMore };
}

// ─── Hook para vehículos destacados (Home) ───────────────────────
export function useFeaturedCars() {
  const [cars, setCars] = useState<CarCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      if (!isSupabaseConfigured) {
        const featured = mockCars
          .filter((c) => c.is_new_arrival || c.is_promotion || c.is_featured)
          .slice(0, 3);
        setCars(featured as CarCard[]);
        setLoading(false);
        return;
      }

      const { data } = await supabase!
        .from('vehicles')
        .select(CATALOG_SELECT)
        .in('status', ['available', 'reserved'])
        .or('is_featured.eq.true,is_new_arrival.eq.true,is_promotion.eq.true')
        .order('created_at', { ascending: false })
        .limit(3);

      setCars((data ?? []) as unknown as CarCard[]);
      setLoading(false);
    }

    fetchFeatured();
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

// ─── Hook para admin: todos los vehículos (sin filtro de status) ─
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