import type { CarCard } from '../types/car';

const CACHE_KEY = 'tdi_motors_inventory_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché en cliente

interface CacheData {
  timestamp: number;
  data: CarCard[];
}

let inMemoryCache: CacheData | null = null;

/**
 * Obtiene el inventario en caché si no ha expirado.
 */
export function getCachedInventory(): CarCard[] | null {
  const now = Date.now();

  // 1. Probar caché en memoria
  if (inMemoryCache && now - inMemoryCache.timestamp < CACHE_TTL_MS) {
    return inMemoryCache.data;
  }

  // 2. Probar sessionStorage (persiste durante la navegación en la misma pestaña)
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed: CacheData = JSON.parse(raw);
      if (now - parsed.timestamp < CACHE_TTL_MS) {
        inMemoryCache = parsed; // Mantener sincrónico en memoria
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('[Cache] Error al leer sessionStorage:', e);
  }

  return null;
}

/**
 * Guarda el inventario en caché (memoria y sessionStorage).
 */
export function setCachedInventory(data: CarCard[]): void {
  const cacheObj: CacheData = {
    timestamp: Date.now(),
    data,
  };
  inMemoryCache = cacheObj;

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
  } catch (e) {
    console.warn('[Cache] Error al escribir en sessionStorage:', e);
  }
}

/**
 * Invalida el caché cuando el administrador crea, edita o cambia estado de un auto.
 */
export function clearCarCache(): void {
  inMemoryCache = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (e) {
    // ignore
  }
}
