-- ═══════════════════════════════════════════════════════════════════
-- TDI Motors — Migración: Tipo de Vehículo, Archivado y Búsqueda por Slug Suffix
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- 1. Agregar columna vehicle_type a vehicles si no existe
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT CHECK (vehicle_type IN ('CityCar', 'Sedan', 'Hatchback', 'SUV', 'Camioneta', 'Convertible', 'Coupé', 'Station Wagon', 'Furgón', 'Comercial'));

-- 2. Actualizar la restricción CHECK para la columna status para permitir 'draft' y 'archived'
-- Dropeamos la restricción inline anterior generada por Postgres (usualmente vehicles_status_check)
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Creamos la nueva restricción con los 5 estados permitidos
ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check 
  CHECK (status IN ('draft', 'available', 'reserved', 'sold', 'archived'));

-- 3. Crear función RPC para buscar vehículo a partir de un sufijo del ID (primeros 8 caracteres de su UUID)
CREATE OR REPLACE FUNCTION get_vehicle_by_slug_suffix(suffix TEXT)
RETURNS SETOF vehicles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vehicles v
  WHERE v.id::text LIKE (LOWER(suffix) || '%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
