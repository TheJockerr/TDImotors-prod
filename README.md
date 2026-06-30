# TDI Motors — Portal de Vehículos y Panel Administrativo

TDI Motors es una plataforma web responsiva optimizada para la venta online de vehículos usados certificados en Santiago, Chile. Cuenta con un frontend de alta velocidad para clientes, carga dinámica de vehículos, optimización de imágenes (WebP y srcset responsivos), y un panel administrativo seguro para la gestión del catálogo.

---

## 🚀 Características Principales

### Para Compradores (Catálogo Público)
* **Alta Velocidad:** SPA optimizada con carga progresiva de vehículos (paginación en bloques de 9 autos).
* **Filtros en Tiempo Real:** Filtra por marca, precio, año, kilometraje y combustible.
* **Galería Interactiva con Visor:** Carrusel de fotos responsivo (WebP optimizado) y lightbox de pantalla completa.
* **Contacto Directo por WhatsApp:** Cada vehículo genera un link de WhatsApp con mensaje personalizado automático ("Hola, me interesa el vehículo [MARCA MODELO AÑO]").

### Para Administradores (`/admin`)
* **Acceso Protegido:** Autenticación segura mediante Supabase Auth y políticas RLS.
* **CRUD de Vehículos:** Permite crear, editar, eliminar y cambiar estados de vehículos (`disponible`, `reservado`, `vendido`).
* **Gestión de Imágenes:** Subida directa a Supabase Storage (hasta 8 imágenes por auto), marcado de imagen principal y reordenamiento con botones arriba/abajo.
* **Destacados y Promociones:** Toggles para marcar autos como Destacados (home), Recién Llegado, o en Promoción.

---

## 🛠️ Stack Tecnológico
* **Frontend:** React 19, TypeScript, Vite 8, React Router DOM 7
* **Estilos:** Vanilla CSS (CSS Modules + Variables globales)
* **Backend y DB:** Supabase (PostgreSQL, Supabase Storage, Supabase Auth)
* **Hosting:** Listo para despliegue automático en Vercel

---

## 📁 Estructura del Repositorio y Documentación

En la raíz del proyecto se encuentran las siguientes guías de configuración técnica:

1. [SUPABASE_SETUP.md](SUPABASE_SETUP.md): Configuración paso a paso del backend de Supabase.
2. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md): Definición de tablas relacionales de PostgreSQL y RLS.
3. [STORAGE_CONFIGURATION.md](STORAGE_CONFIGURATION.md): Reglas de almacenamiento y API de transformación de imágenes.
4. [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md): Instrucciones de uso del panel administrativo y gestión de accesos.
5. [OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md): Explicación de las optimizaciones de tráfico, carga y bundle.
6. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md): Guía detallada para el despliegue automático en Vercel.
7. [SECURITY.md](SECURITY.md): Arquitectura de seguridad, roles y RLS.
8. [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md): Detalle de todas las variables `.env` requeridas.

---

## ⚙️ Configuración y Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install
# o con pnpm
pnpm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en la plantilla:
```bash
cp .env.example .env
```
Completa las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los datos de tu proyecto de Supabase.

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 4. Compilar para producción
```bash
npm run build
```
La carpeta optimizada se generará en `dist/` lista para subirse a cualquier CDN o hosting.
