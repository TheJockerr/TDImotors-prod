# Deployment Guide — TDI Motors

Esta guía detalla los pasos para desplegar TDI Motors en la plataforma de Vercel de manera continua y optimizada para producción.

---

## 🛠️ Despliegue en Vercel

### Paso 1: Subir el Proyecto a GitHub
Asegúrate de que tu repositorio local esté sincronizado con un repositorio remoto en tu cuenta de GitHub, GitLab o Bitbucket.
> ⚠️ **IMPORTANTE:** Verifica que tu archivo `.env` NO esté subido al repositorio Git. Tu archivo `.gitignore` debe contener la regla `.env*`.

---

### Paso 2: Crear el Proyecto en Vercel
1. Ve al panel de [Vercel](https://vercel.com/) e inicia sesión.
2. Haz clic en **Add New** → **Project**.
3. Importa tu repositorio de GitHub `TDImotors-prod`.

---

### Paso 3: Configurar los Ajustes del Proyecto
Vercel detectará automáticamente que el proyecto utiliza **Vite** y configurará los comandos por defecto:
* **Framework Preset:** `Vite`
* **Build Command:** `pnpm build` o `npm run build`
* **Output Directory:** `dist`

---

### Paso 4: Agregar Variables de Entorno (Environment Variables)
Antes de hacer clic en "Deploy", despliega la sección **Environment Variables** en el formulario de Vercel y agrega los siguientes valores:

1. **`VITE_SUPABASE_URL`**: La URL de tu proyecto de Supabase (ej: `https://xxxx.supabase.co`).
2. **`VITE_SUPABASE_ANON_KEY`**: La key anon pública de tu proyecto de Supabase.
3. **`VITE_WHATSAPP_NUMBER`**: Número telefónico principal de contacto sin el signo `+` (ej: `56940385580`).
4. **`VITE_STORAGE_BUCKET`**: El nombre del bucket de imágenes (debe ser `vehicle-images`).
5. **`VITE_INSTAGRAM_URL`**: URL de tu perfil de Instagram comercial.

---

### Paso 5: Desplegar
1. Haz clic en **Deploy**.
2. Vercel compilará la aplicación aplicando la división de chunks y el lazy loading, y generará un enlace de producción HTTPS listo para su uso.

---

## 🔗 Pruebas de Despliegue

Una vez completado el build, verifica que todo funcione de la siguiente manera:
1. **Rutas e Historial de Navegación (SPA Rewrites):** Navega al catálogo `/catalogo` o al detalle `/catalogo/1` y recarga el navegador con la tecla F5. El archivo `vercel.json` debe asegurar que la ruta sea capturada por el frontend de React en lugar de dar un error 404 en el servidor de Vercel.
2. **Seguridad SSL:** El sitio debe cargar únicamente con protocolo seguro HTTPS.
3. **Optimización WebP:** Inspecciona la pestaña Network en las Herramientas de Desarrollo de tu navegador y confirma que las imágenes del catálogo se carguen como tipo `image/webp`.
