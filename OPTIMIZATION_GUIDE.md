# Optimization Guide — TDI Motors

TDI Motors está diseñado como una aplicación web de alta eficiencia, buscando reducir el consumo de transferencia de red (ancho de banda) y maximizar la velocidad de despliegue en dispositivos móviles.

---

## ⚡ 1. Optimización Extrema de Imágenes

Las imágenes de los vehículos representan el 90% del tráfico de red. Para optimizar esto, implementamos:

### Peticiones Responsivas (`srcset` y `sizes`)
En `src/components/cars/CarCard.tsx`, las tarjetas del catálogo no descargan la imagen original de alta resolución. En su lugar, utilizan el atributo `srcSet`:
```html
<img 
  src={thumbnailUrl} 
  srcSet={`${thumbnailUrl} 400w, ${mediumUrl} 800w`}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  ...
/>
```
* **Pantallas pequeñas/móviles:** El navegador descarga la versión de 400px de ancho.
* **Pantallas grandes/Retina:** Descarga la versión de 800px.
* **Formato Automático WebP:** Supabase Storage comprime las imágenes a formato WebP, disminuyendo el peso del archivo hasta en un 70% en comparación con JPEG o PNG tradicional.

### Niveles de Detalle
* **Vista Catálogo:** Carga exclusivamente thumbnails (miniaturas de 400px con calidad de compresión al 75%).
* **Vista Detalle (Galería principal):** Carga imágenes medianas (800px de ancho con calidad al 85%).
* **Visor Pantalla Completa:** Carga la imagen original sin redimensionar solo cuando el usuario hace zoom en el lightbox.

---

## 📦 2. Paginación y Carga Progresiva (Catalog Feed)
Para evitar saturar el cliente y la base de datos descargando decenas de vehículos al mismo tiempo:
* La base de datos limita la descarga inicial a **9 vehículos** (`PAGE_SIZE = 9`).
* Se utiliza un modelo de rango PostgreSQL (`.range(from, to)`) en Supabase para obtener las siguientes páginas bajo demanda al hacer clic en **"Cargar más vehículos"**.
* Si no quedan más vehículos disponibles para cargar, el botón se oculta de forma automática.

---

## 🔍 3. Consultas Livianas a la Base de Datos
* **Catálogo:** La petición del catálogo *no* ejecuta un `select('*')`. En su lugar, solicita únicamente los campos esenciales para renderizar las tarjetas (`id`, `brand`, `model`, `year`, `price`, `mileage`, `fuel`, `is_featured`, `is_new_arrival`, `is_promotion`, `status`, `vehicle_images(public_url)`). Esto reduce significativamente la carga de transferencia JSON desde Supabase.
* **Detalles:** La descripción extendida, equipamientos y la galería de imágenes completa se solicitan única y exclusivamente cuando el usuario hace clic e ingresa a la vista individual del auto.

---

## 🛠️ 4. Code Splitting & Bundler Tuning (Vite & Rollup)

### Dynamic Imports (Lazy Loading de Páginas)
En `src/App.tsx`, las páginas no se importan de forma directa en el arranque. En su lugar, se cargan de manera perezosa con `React.lazy` y `Suspense`:
```typescript
const Home = lazy(() => import('./pages/Home/Home'));
const Catalogo = lazy(() => import('./pages/Catalogo/Catalogo'));
// El panel de administración se carga en un bloque separado
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
```
Esto reduce considerablemente el archivo JS inicial (Main Bundle), logrando que la landing page cargue casi instantáneamente. El código de administración (`AdminDashboard`, `VehicleForm`, etc.) solo se descargará si alguien navega a `/admin`.

### Optimización de Chunks (Rollup Output)
Configuramos `vite.config.ts` para separar las dependencias de terceros (node_modules) en archivos independientes (chunks), lo que optimiza el almacenamiento en caché del navegador:
1. `vendor-react`: React y React DOM.
2. `vendor-router`: Rutas del navegador.
3. `vendor-supabase`: Biblioteca del backend.

---

## 🌐 5. Configuración de Caché en Vercel
En `vercel.json`, se definen reglas de caché para indicar a los navegadores y a la red Edge de Vercel que no soliciten recursos estáticos que no han cambiado:
* **Assets compilados (JS/CSS con hash único):** Tienen un tiempo de vida permanente (`max-age=31536000, immutable`).
* **Vectores e íconos (`TDI.svg`, `favicon.svg`):** Tienen caché por 24 horas (`max-age=86400`).
