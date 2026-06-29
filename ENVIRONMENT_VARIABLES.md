# Environment Variables — TDI Motors

TDI Motors utiliza variables de entorno con el prefijo `VITE_` para permitir que el bundler Vite las exponga de manera segura al código del cliente React durante el proceso de compilación (`build`).

---

## 📋 Variables Requeridas

A continuación se detallan las variables obligatorias que deben estar presentes tanto en tu entorno de desarrollo local (archivo `.env`) como en el panel de control de Vercel para producción:

### 1. `VITE_SUPABASE_URL`
* **Descripción:** La URL del endpoint API REST de tu proyecto de Supabase.
* **Formato:** `https://[referencia-de-proyecto].supabase.co`
* **Cómo obtenerla:** Supabase Dashboard → Settings → API → Project URL.

### 2. `VITE_SUPABASE_ANON_KEY`
* **Descripción:** Clave API pública anon de Supabase. Se utiliza para enviar peticiones a la base de datos de manera segura pasando por los filtros de las políticas RLS.
* **Cómo obtenerla:** Supabase Dashboard → Settings → API → Project API keys (anon public).
* > ⚠️ **ADVERTENCIA:** No la confundas con la clave `service_role` (esta última nunca debe subirse al frontend).

### 3. `VITE_STORAGE_BUCKET`
* **Descripción:** Nombre del bucket de almacenamiento configurado para las fotos de los autos.
* **Valor Recomendo:** `vehicle-images`
* **Importante:** Debe coincidir exactamente con el nombre del bucket creado en Supabase Storage.

### 4. `VITE_WHATSAPP_NUMBER`
* **Descripción:** Número telefónico móvil principal a donde se enviarán las consultas de WhatsApp de los clientes.
* **Formato:** Código de país seguido de número, sin espacios ni caracteres especiales (ej: `56940385580` para Chile).
* **Uso:** El sistema construye los enlaces a la API de WhatsApp (`wa.me`) utilizando este valor.

### 5. `VITE_INSTAGRAM_URL`
* **Descripción:** Enlace completo a la cuenta de Instagram de TDI Motors.
* **Ejemplo:** `https://www.instagram.com/tdimotors`
* **Uso:** Se inyecta en los accesos del Navbar y del Footer.
