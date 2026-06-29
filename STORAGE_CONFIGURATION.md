# Storage Configuration — TDI Motors

TDI Motors delega todo el almacenamiento y procesamiento multimedia a **Supabase Storage** para evitar sobrecargar los servidores y la red de Vercel.

---

## 📦 El Bucket `vehicle-images`
Las imágenes se almacenan de manera organizada en un único bucket de almacenamiento:
* **Nombre:** `vehicle-images`
* **Tipo:** Público (los objetos se pueden leer sin tokens con firma).
* **Límite de tamaño:** 5 MB por archivo.
* **Formatos aceptados:** JPEG, JPG, PNG, WEBP, GIF.

---

## 📁 Distribución de Carpetas
Para mantener el almacenamiento limpio, las imágenes se suben utilizando una ruta jerárquica con el ID único del vehículo:
```
vehicles/
  └── [vehicle-id-uuid]/
      ├── 1682939102-imagen1.webp
      ├── 1682939223-imagen2.jpg
      └── 1682939500-imagen3.png
```
Esta estructura permite que, al eliminar un vehículo, el sistema pueda borrar el directorio completo en el bucket simplemente referenciando `vehicles/[vehicle-id]`.

---

## ⚡ API de Optimización y Transformación de Imágenes
Supabase incluye un servidor CDN de renderizado dinámico de imágenes en tiempo real. TDI Motors aprovecha esta API para descargar versiones comprimidas y formateadas en WebP según el viewport del dispositivo del usuario:

### 1. URL Original vs URL Transformada
* **URL Pública Original:**
  `https://[project-ref].supabase.co/storage/v1/object/public/vehicle-images/vehicles/[id]/imagen.jpg`
* **URL Transformada (CDN + Resizing):**
  `https://[project-ref].supabase.co/storage/v1/render/image/public/vehicle-images/vehicles/[id]/imagen.jpg?[parametros]`

### 2. Perfiles de Carga en TDI Motors
En `src/lib/supabase.ts`, implementamos la función `getImageUrl` que genera dinámicamente estas URLs:

* **Miniatura (Catálogo / Home):**
  `?width=400&height=280&resize=cover&format=webp&quality=75`
  * *Uso:* Carga de manera súper rápida en el catálogo general.
* **Mediana (Detalle / Galería principal):**
  `?width=800&height=560&resize=cover&format=webp&quality=85`
  * *Uso:* Se utiliza al abrir el detalle del vehículo para mostrar buena nitidez.
* **Completa (Visor Lightbox):**
  *(Sin parámetros de redimensionamiento)*
  * *Uso:* Carga la resolución nativa únicamente cuando el usuario hace clic para agrandar la imagen a pantalla completa.

---

## 🛡️ Reglas de Seguridad (Políticas del Bucket)
El acceso al almacenamiento está restringido por políticas RLS en la base de datos de Supabase Storage (`storage.objects`):

1. **Lectura (SELECT):** Permitido para todo el público.
2. **Escritura (INSERT/UPDATE/DELETE):** Restringido a usuarios autenticados que pertenezcan a la lista de administradores (`is_admin(auth.uid()) = TRUE`).
