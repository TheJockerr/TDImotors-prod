# Supabase Setup Guide — TDI Motors

Esta guía detalla los pasos para crear y configurar el backend en Supabase necesario para que TDI Motors funcione correctamente en producción.

---

## 📋 Requisitos Previos
1. Una cuenta activa en [Supabase](https://supabase.com/).
2. Un proyecto creado en el Dashboard de Supabase.

---

## 🛠️ Configuración Paso a Paso

### Paso 1: Configurar la Base de Datos (Tablas y Relaciones)
1. Ve al Dashboard de tu proyecto en Supabase.
2. En la barra lateral izquierda, haz clic en **SQL Editor** y luego en **New Query**.
3. Abre el archivo local `database/schema.sql` y copia todo su contenido.
4. Pégalo en el editor SQL de Supabase y haz clic en **Run**.
5. Esto creará:
   * La tabla de vehículos `vehicles`.
   * La tabla de imágenes `vehicle_images`.
   * La tabla de administradores autorizados `admin_users`.
   * Índices de rendimiento, triggers de actualización automática y restricciones.
   * La activación de Row Level Security (RLS) en todas las tablas.

---

### Paso 2: Configurar Supabase Storage
1. En la barra lateral del panel de Supabase, entra a **Storage**.
2. Haz clic en **New Bucket**.
3. Nombra el bucket exactamente: `vehicle-images`.
4. Define el bucket como **Public** (esto permite que las imágenes se carguen de manera directa en el catálogo del cliente sin tokens efímeros).
5. Guarda el bucket.
6. Aplica las políticas de seguridad de almacenamiento:
   * Ve de nuevo a **SQL Editor** → **New Query**.
   * Copia el contenido del archivo local `database/storage_setup.sql`.
   * Pégalo y haz clic en **Run**.
   * Esto otorgará acceso de lectura pública a todo el internet e impedirá que usuarios no autenticados o que no pertenezcan a la lista de administradores puedan subir o borrar imágenes.

---

### Paso 3: Configurar Autenticación de Administradores
El sistema requiere dar acceso únicamente a cuentas de administrador específicas (`contacto.tdimotors@gmail.com` y `tony.distefano92@gmail.com`).

1. En la barra lateral de Supabase, ve a **Authentication** → **Users**.
2. Haz clic en **Add User** → **Create User**.
3. Ingresa el correo `contacto.tdimotors@gmail.com` y crea una contraseña segura temporal (la contraseña inicial debe ser informada al administrador).
4. Desmarca la opción de confirmación de email si quieres habilitarlo de inmediato, o deja que el administrador confirme el link enviado.
5. Repite el proceso para `tony.distefano92@gmail.com`.
6. Obtén los **UIDs** (User ID / UUID) generados para cada usuario en la tabla de Autenticación.

---

### Paso 4: Registrar Administradores en la Base de Datos
Para que el sistema de RLS sepa que los usuarios creados son administradores, debemos vincularlos en la tabla `admin_users`.

1. Ve al **SQL Editor** de Supabase y ejecuta la siguiente consulta reemplazando las UIDs ficticias por las reales de tus usuarios creados en el Paso 3:
```sql
INSERT INTO admin_users (user_id, email)
VALUES 
  ('CAMBIA_POR_EL_UUID_DE_CONTACTO', 'contacto.tdimotors@gmail.com'),
  ('CAMBIA_POR_EL_UUID_DE_TONY', 'tony.distefano92@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
```
2. Ahora, al iniciar sesión en `/admin/login`, estas cuentas tendrán acceso completo de lectura y escritura.

---

### Paso 5: Obtener las Credenciales del Proyecto
1. Ve a **Settings** (ícono de engranaje) → **API**.
2. Copia los valores de:
   * **Project URL**: Esta URL se usará en `VITE_SUPABASE_URL`.
   * **Project API keys (anon public)**: Esta key se usará en `VITE_SUPABASE_ANON_KEY`.
3. Pega estos datos en tu archivo `.env` local para desarrollo y configúralos en Vercel para producción.

---

### Paso 6: Aplicar Migración de Tipo de Vehículo, Archivado y Búsqueda por Slug (Proyectos Existentes)
Si ya tienes una base de datos corriendo de una versión anterior del proyecto, debes aplicar la migración SQL incremental:
1. Abre el archivo local `database/add_vehicle_type_and_archive.sql` y copia su contenido.
2. Ve al **SQL Editor** en el Dashboard de tu proyecto Supabase y abre una **New Query**.
3. Pega el código de la migración y haz clic en **Run**.
4. Esto creará la columna `vehicle_type`, modificará las restricciones de `status` para permitir `draft` y `archived`, y creará la función RPC de búsqueda de sufijo de slug.

