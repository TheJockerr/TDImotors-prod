# Admin Dashboard Guide — TDI Motors

El portal administrativo de TDI Motors permite al equipo gestionar el inventario de vehículos, cambiar estados de venta, ajustar badges y administrar galerías de imágenes de forma ágil y segura.

---

## 🔐 Acceso al Panel

* **Ruta de Ingreso:** `/admin/login`
* **Credenciales:** Se autentica mediante las cuentas autorizadas en Supabase Auth (`contacto.tdimotors@gmail.com` y `tony.distefano92@gmail.com`).
* **Protección de Rutas:** Si un usuario intenta ingresar a `/admin` o cualquier subruta sin haber iniciado sesión, el componente `PrivateRoute` lo redirigirá automáticamente a la pantalla de login.

---

## 📊 Módulos del Dashboard

### 1. Resumen de Estadísticas
En la parte superior, se muestra un panel con contadores rápidos de inventario:
* **Total Autos:** Cantidad global en la base de datos.
* **Disponibles (available):** Vehículos listos para la venta (visibles en el catálogo público).
* **Reservados (reserved):** Vehículos en proceso de compra (visibles con la etiqueta "RESERVADO").
* **Vendidos (sold):** Vehículos ya entregados (excluidos automáticamente del catálogo público).

### 2. Tabla de Vehículos
Presenta el listado completo ordenado por fecha de creación (los más recientes primero):
* **Filtros rápidos (Toggles):** Permite cambiar las banderas visuales de un vehículo directamente desde la tabla con un solo clic:
  * **Destacado:** Muestra el auto en la página de inicio.
  * **Recién Llegado:** Le aplica el badge oscuro al carro.
  * **Promoción:** Le aplica el badge rojo de "OFERTA".
* **Acciones:** Botón para **Editar** (abre el formulario cargado) y **Eliminar**.

---

## 📝 Formulario de Vehículos (Creación y Edición)

El formulario valida e integra todos los campos obligatorios del negocio:
1. **Información Comercial:** Marca, Modelo, Año, Patente, Tipo de vehículo, Precio de venta, Kilometraje, dueños anteriores y estado (incluyendo Borrador y Archivado).
2. **Equipamientos (Features):** Puedes escribir un accesorio (ej. *Cámara de retroceso*) y presionar **Agregar** o la tecla **Enter** para registrarlo en el listado de tags del auto.
3. **Descripción:** Información adicional en texto libre para detallar el estado del vehículo.

---

## 📦 Archivado y Eliminación de Vehículos

Para una administración más segura del inventario, se implementa una confirmación en dos pasos para ocultar o eliminar vehículos:

### 1. Archivar Publicación (Opción Recomendada)
* En el listado principal (Filtros: Activos, Reservados, Vendidos, Todos), los vehículos tienen la opción de ser **Archivados** en vez de eliminados directamente.
* **Flujo de Confirmación:**
  - **Paso 1:** Al presionar "Archivar publicación", se advierte que el vehículo dejará de ser visible al público pero podrá ser restaurado.
  - **Paso 2:** Se solicita escribir exactamente la palabra **ARCHIVAR** en mayúsculas para activar el botón final de confirmación.
* Al confirmarse, el estado del vehículo pasa a `archived`. El vehículo se oculta del catálogo de cara al cliente y sus imágenes se preservan intactas en Supabase Storage.

### 2. Sección "Archivados" y Restauración
* Al seleccionar la pestaña **Archivados** en los filtros del dashboard, se listarán únicamente las publicaciones archivadas.
* Desde esta pestaña el administrador puede:
  - **Editar** los detalles del auto archivado.
  - **Restaurar** la publicación, lo cual volverá a establecer su estado en disponible (`available`) haciéndola visible en la web al instante.
  - **Eliminar permanente** (DELETE físico).

### 3. Eliminación Permanente
* Solo está disponible para vehículos dentro de la pestaña **Archivados**.
* **Flujo de Confirmación Fuerte:**
  - **Paso 1:** Advierte al usuario que la acción eliminará el vehículo permanentemente junto a todas sus imágenes del storage físico.
  - **Paso 2:** Exige escribir exactamente la palabra **ELIMINAR** para desbloquear el botón "Eliminar permanentemente".
* Al confirmarse, se ejecuta un DELETE en la base de datos y se remueven de forma irreversible todas las fotos del bucket de Supabase.

---

## 🖼️ Flujo de Gestión de Imágenes

El componente de imágenes valida la regla de negocio: **mínimo 1 imagen, máximo 8 imágenes por vehículo**.

### Subida de Imágenes
* Arrastra o selecciona archivos haciendo clic en el cuadro punteado.
* Las fotos se suben en segundo plano directamente al almacenamiento de Supabase.
* Tras finalizar, aparece la miniatura con su respectivo orden.

### Configuración de la Galería
* **Cambiar Imagen Principal:** Haz clic en la estrella (**★**) de cualquier miniatura para convertirla en la foto de portada. El sistema la marcará de inmediato y actualizará el orden.
* **Reordenar Imágenes:** Utiliza las flechas (**↑** y **↓**) para subir o bajar la prioridad de cada imagen en la galería del detalle del vehículo.
* **Eliminar Imágenes:** Haz clic en la cruz (**✕**) de la foto. El componente se encargará de remover la imagen de la lista y limpiará el archivo físico del bucket de Supabase.
