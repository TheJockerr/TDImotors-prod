-- ═══════════════════════════════════════════════════════════════════
-- TDI Motors — Configuración de Supabase Storage
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- O bien configurar manualmente en Storage → New Bucket
-- ═══════════════════════════════════════════════════════════════════

-- Crear bucket público para imágenes de vehículos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  TRUE,               -- bucket público (URLs sin autenticación)
  5242880,            -- límite 5MB por archivo
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- ─── Políticas de Storage ─────────────────────────────────────────

-- Lectura pública de todas las imágenes del bucket
CREATE POLICY "storage_vehicle_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- Solo admins autenticados pueden subir imágenes
CREATE POLICY "storage_vehicle_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND auth.role() = 'authenticated'
    AND is_admin(auth.uid())
  );

-- Solo admins pueden actualizar imágenes
CREATE POLICY "storage_vehicle_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-images'
    AND auth.role() = 'authenticated'
    AND is_admin(auth.uid())
  );

-- Solo admins pueden eliminar imágenes
CREATE POLICY "storage_vehicle_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images'
    AND auth.role() = 'authenticated'
    AND is_admin(auth.uid())
  );

-- ─── NOTA SOBRE TRANSFORMACIONES ─────────────────────────────────
-- Supabase Storage incluye Image Transformation API.
-- La URL base para transformaciones es:
--   https://<project-ref>.supabase.co/storage/v1/render/image/public/vehicle-images/<path>
--
-- Tamaños utilizados en TDI Motors:
--   thumbnail: ?width=400&height=300&resize=cover&format=webp&quality=75
--   medium:    ?width=800&height=600&resize=cover&format=webp&quality=85
--   full:      (URL original sin transformar)
