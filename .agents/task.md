# Task List — TDI Motors Producción

## FASE 1 — Seguridad y Configuración Base
- [x] Corregir `.gitignore` (agregar .env*)
- [x] Crear `.env.example`
- [x] Crear `vercel.json`

## FASE 2 — Schema Supabase
- [x] Crear `database/schema.sql`
- [x] Crear `database/rls_policies.sql` (incluido en `schema.sql`)
- [x] Crear `database/storage_setup.sql`

## FASE 3 — Tipos y Data Layer
- [x] Extender `src/types/car.ts`
- [x] Refactorizar `src/lib/supabase.ts` (tipos + helpers)
- [x] Crear `src/lib/auth.ts`
- [x] Refactorizar `src/hooks/useCars.ts` (paginación + select parcial)
- [x] Crear `src/hooks/useAuth.ts`

## FASE 4 — Optimizaciones Frontend
- [x] Modificar `App.tsx` (lazy loading + rutas admin)
- [x] Modificar `vite.config.ts` (chunks + alias)
- [x] Modificar `index.html` (SEO + preconnect)
- [x] Modificar `Catalogo.tsx` (paginación + "Cargar más")
- [x] Modificar `CarCard.tsx` (srcset + WebP + env vars)
- [x] Crear `CarDetail.tsx` (imágenes mejoradas + lightbox)

## FASE 5 — Dashboard Administrativo
- [x] Crear `src/components/admin/PrivateRoute.tsx`
- [x] Crear `src/pages/Admin/AdminLogin.tsx` + CSS
- [x] Crear `src/pages/Admin/AdminDashboard.tsx` + CSS
- [x] Crear `src/pages/Admin/VehicleForm.tsx` + CSS
- [x] Crear `src/components/admin/VehicleImages.tsx` + CSS

## FASE 6 — Documentación
- [x] Actualizar `README.md`
- [x] Crear `SUPABASE_SETUP.md`
- [x] Crear `DATABASE_SCHEMA.md`
- [x] Crear `STORAGE_CONFIGURATION.md`
- [x] Crear `ADMIN_DASHBOARD.md`
- [x] Crear `OPTIMIZATION_GUIDE.md`
- [x] Crear `DEPLOYMENT_GUIDE.md`
- [x] Crear `SECURITY.md`
- [x] Crear `ENVIRONMENT_VARIABLES.md`

## FASE 7 — Verificación
- [x] Verificado a nivel de código y diseño estático.
