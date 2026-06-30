-- ═══════════════════════════════════════════════════════════════════
-- TDI Motors — Supabase Schema Completo
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- ─── Extensiones necesarias ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. TABLA PRINCIPAL DE VEHÍCULOS ─────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand           TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            INTEGER NOT NULL CHECK (year >= 1990 AND year <= 2030),
  price           BIGINT NOT NULL CHECK (price > 0),           -- en CLP
  mileage         INTEGER NOT NULL CHECK (mileage >= 0),       -- en km
  fuel            TEXT NOT NULL DEFAULT 'Bencina',
  transmission    TEXT NOT NULL DEFAULT 'Manual',
  plate           TEXT UNIQUE NOT NULL,
  vehicle_type    TEXT CHECK (vehicle_type IN ('CityCar', 'Sedan', 'Hatchback', 'SUV', 'Camioneta', 'Convertible', 'Coupé', 'Station Wagon', 'Furgón', 'Comercial')),
  description     TEXT,
  owner_count     INTEGER DEFAULT 1 CHECK (owner_count >= 1),
  features        TEXT[] DEFAULT '{}',
  
  -- Flags de estado visual
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,   -- destacado en home
  is_new_arrival  BOOLEAN NOT NULL DEFAULT FALSE,   -- badge "RECIÉN LLEGADO"
  is_promotion    BOOLEAN NOT NULL DEFAULT FALSE,   -- badge "OFERTA"
  
  -- Estado del vehículo
  status          TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('draft', 'available', 'reserved', 'sold', 'archived')),
  
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes del catálogo
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand  ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_price  ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year   ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_created ON vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON vehicles(is_featured) WHERE is_featured = TRUE;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. TABLA DE IMÁGENES POR VEHÍCULO ───────────────────────────
-- Separada de vehicles para permitir hasta 8 imágenes por vehículo
-- y facilitar reordenamiento y eliminación individual
CREATE TABLE IF NOT EXISTS vehicle_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,   -- path dentro del bucket de Storage
  public_url    TEXT NOT NULL,   -- URL pública completa
  sort_order    INTEGER NOT NULL DEFAULT 0,   -- 0 = imagen principal
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_sort ON vehicle_images(vehicle_id, sort_order);

-- Constraint: máximo 8 imágenes por vehículo
-- (se valida también en la aplicación)
CREATE OR REPLACE FUNCTION check_max_images()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM vehicle_images WHERE vehicle_id = NEW.vehicle_id) >= 8 THEN
    RAISE EXCEPTION 'Un vehículo no puede tener más de 8 imágenes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_images
  BEFORE INSERT ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION check_max_images();

-- Solo una imagen puede ser primaria por vehículo
CREATE OR REPLACE FUNCTION ensure_single_primary()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE vehicle_images
    SET is_primary = FALSE, sort_order = sort_order
    WHERE vehicle_id = NEW.vehicle_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_primary_image
  BEFORE INSERT OR UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary();

-- ─── 3. TABLA DE ADMINISTRADORES ─────────────────────────────────
-- Vincula usuarios de Supabase Auth con el rol admin.
-- Para agregar admins: insertar en esta tabla desde el Dashboard.
-- NUNCA hardcodear credenciales.
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. FUNCIÓN HELPER: verificar si usuario es admin ────────────
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = uid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── 5. ROW LEVEL SECURITY (RLS) ─────────────────────────────────

-- Habilitar RLS en todas las tablas
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ── Políticas para VEHICLES ──
-- Lectura pública: solo vehículos disponibles o reservados
CREATE POLICY "vehicles_select_public"
  ON vehicles FOR SELECT
  USING (status IN ('available', 'reserved'));

-- Admins pueden leer todos los vehículos (incluyendo vendidos)
CREATE POLICY "vehicles_select_admin"
  ON vehicles FOR SELECT
  USING (is_admin(auth.uid()));

-- Solo admins pueden insertar
CREATE POLICY "vehicles_insert_admin"
  ON vehicles FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Solo admins pueden actualizar
CREATE POLICY "vehicles_update_admin"
  ON vehicles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Solo admins pueden eliminar
CREATE POLICY "vehicles_delete_admin"
  ON vehicles FOR DELETE
  USING (is_admin(auth.uid()));

-- ── Políticas para VEHICLE_IMAGES ──
-- Lectura pública de imágenes de vehículos públicos
CREATE POLICY "vehicle_images_select_public"
  ON vehicle_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id AND v.status IN ('available', 'reserved')
    )
  );

-- Admins pueden leer todas las imágenes
CREATE POLICY "vehicle_images_select_admin"
  ON vehicle_images FOR SELECT
  USING (is_admin(auth.uid()));

-- Solo admins pueden gestionar imágenes
CREATE POLICY "vehicle_images_insert_admin"
  ON vehicle_images FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "vehicle_images_update_admin"
  ON vehicle_images FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "vehicle_images_delete_admin"
  ON vehicle_images FOR DELETE
  USING (is_admin(auth.uid()));

-- ── Políticas para ADMIN_USERS ──
-- Solo el propio admin puede ver su registro
CREATE POLICY "admin_users_select_self"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- Solo admins existentes pueden insertar nuevos admins
CREATE POLICY "admin_users_insert_admin"
  ON admin_users FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ─── 6. BÚSQUEDA POR SLUG SUFFIX (RPC) ────────────────────────────
CREATE OR REPLACE FUNCTION get_vehicle_by_slug_suffix(suffix TEXT)
RETURNS SETOF vehicles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vehicles v
  WHERE v.id::text LIKE (LOWER(suffix) || '%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── FIN DEL SCHEMA ──────────────────────────────────────────────
-- PRÓXIMO PASO: Ejecutar storage_setup.sql
