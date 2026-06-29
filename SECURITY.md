# Security Policy — TDI Motors

TDI Motors sigue las mejores prácticas de seguridad recomendadas para aplicaciones basadas en Supabase y Vercel, aislando los permisos de escritura del público y previniendo la fuga de claves privadas o secretos de infraestructura.

---

## 🔒 1. Row Level Security (RLS) en la Base de Datos
Todas las consultas realizadas desde el frontend utilizan el cliente público de Supabase (`VITE_SUPABASE_ANON_KEY`). Para evitar que un usuario manipule registros a través de la consola del navegador, se habilitó **RLS (Row Level Security)** en PostgreSQL:

* **Tabla `vehicles`:**
  * *Lectura Pública (SELECT):* Permitida solo si el estado del vehículo es `available` (disponible) o `reserved` (reservado). Los vehículos con estado `sold` (vendidos) están excluidos para proteger la privacidad de las ventas cerradas.
  * *Modificación (INSERT/UPDATE/DELETE):* Requiere que el usuario esté autenticado y que su UUID exista en la tabla de administradores (`is_admin(auth.uid()) = TRUE`).
* **Tabla `vehicle_images`:**
  * *Lectura Pública (SELECT):* Solo se devuelven imágenes vinculadas a autos que estén marcados como disponibles o reservados.
  * *Modificación (INSERT/UPDATE/DELETE):* Permitido únicamente a administradores verificados.
* **Tabla `admin_users`:**
  * *Lectura:* Restringida. Solo el usuario con sesión activa puede leer su propio registro en la tabla para validar su rol.
  * *Escritura:* Solo administradores existentes pueden agregar nuevos UIDs a esta tabla para invitar a otros administradores.

---

## 🔑 2. Control de Acceso al Panel de Administración
* El panel administrativo no cuenta con contraseñas compartidas o hardcodeadas en base de datos.
* Se integra directamente con **Supabase Auth** (utilizando encriptación bcrypt por debajo para las contraseñas).
* **Restricción de registro:** Las opciones de registro público (`Sign Up`) están deshabilitadas en el cliente. La creación de usuarios se realiza exclusivamente por invitación interna o directamente desde el panel de control de Supabase por el dueño del proyecto.

---

## 📦 3. Gestión Segura de Imágenes en Storage
* El bucket `vehicle-images` está configurado para permitir que todo internet descargue y visualice las fotos.
* Las políticas RLS del almacenamiento impiden que cualquier agente externo suba archivos, modifique nombres o elimine recursos físicos del bucket. Solo se procesan subidas si el token JWT contiene privilegios de administrador.

---

## 📁 4. Prevención de Fugas de Secretos (Git Secrets)
* El archivo `.env` local contiene las credenciales de desarrollo. Este archivo se encuentra explícitamente en `.gitignore` para evitar que las claves privadas del proyecto sean subidas de forma accidental a repositorios públicos de GitHub.
* La clave `service_role` de Supabase (que posee bypass de RLS) **nunca** debe ser usada en el frontend. Su uso está bloqueado para evitar robo de identidad administrativa.
