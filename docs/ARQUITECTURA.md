# ARQUITECTURA.md — Dashboard Web

Inventario completo del estado actual del proyecto: vistas, componentes, servicios, tipos, estado global y lógica condicional.

> Mantener actualizado con cada cambio significativo. No documenta reglas de desarrollo (ver `AGENTS.md`) ni estado de tareas (ver `CLAUDE.md`).

---

## 1. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework UI | React 19 + TypeScript |
| Bundler | Vite |
| Estilos | Tailwind CSS (CDN) |
| Iconos | lucide-react |
| Backend / BD | Supabase (PostgreSQL + Storage + Auth + Realtime) |
| Despliegue | Vercel (auto-deploy desde rama `main` en GitHub) |
| Routing | Ninguno — SPA con `activeView` en `App.tsx` |
| Estado global | useState local en `App.tsx` + props hacia vistas |

---

## 2. Estructura de archivos

```
Dashboard/
├── App.tsx                  # Estado global, handlers, layout, routing por activeView
├── index.tsx                # Entry point — solo monta <App/>. No tocar.
├── types.ts                 # Todos los tipos e interfaces compartidos
│
├── config/
│   └── supabase.ts          # Clientes supabase (anon) y supabaseAdmin (service role)
│
├── hooks/
│   └── useAuth.ts           # Hook de autenticación con Supabase Auth
│
├── services/
│   ├── auth.ts              # signIn, signOut, getPerfilUsuario, crearUsuarioSede, etc.
│   ├── alumnos.ts           # getAlumnos, createAlumno, deleteAlumno, createAlumnosBulk
│   ├── apoderados.ts        # getApoderados, createApoderado, deleteApoderado
│   ├── citas.ts             # getCitas, createCita, createCitasBulk, updateCitaEstado,
│   │                        #   updateCitaReprogramar, updateCitaObservaciones, deleteCita
│   ├── filiales.ts          # getFiliales, createFilial, updateFilial, updateFilialStatus,
│   │                        #   deleteFilial, uploadFilialFoto, getFilialFotoPublicUrl
│   ├── mensajes.ts          # getMensajesWsp, createMensajeWsp, updateMensajeWsp,
│   │                        #   deleteMensajeWsp, disassociateMensajeFromFiliales,
│   │                        #   associateMensajeWithFiliales
│   ├── historias.ts         # getHistorias, createHistoria, updateHistoria,
│   │                        #   deleteHistoria, uploadHistoriaFoto
│   ├── colores.ts           # getColoresCorporativos, createColorCorporativo,
│   │                        #   updateColorCorporativo, deleteColorCorporativo,
│   │                        #   checkColorInUse
│   └── carrusel.ts          # getCarruselImagenes, createCarruselImagen,
│                            #   deleteCarruselImagen, updateCarruselImagen,
│                            #   uploadCarruselFoto, removeCarruselFotos,
│                            #   getCarruselFotoPublicUrl
│
├── views/
│   ├── LoginView.tsx        # Pantalla de inicio de sesión
│   ├── DashboardView.tsx    # Resumen estadístico principal
│   ├── CitasView.tsx        # Agenda de citas y matrículas
│   ├── AlumnosView.tsx      # Listado y gestión de alumnos
│   ├── ApoderadosView.tsx   # Listado y gestión de apoderados
│   ├── FilialesView.tsx     # Gestión de sedes/filiales
│   ├── HistoriasView.tsx    # Historias de transformación (testimonios)
│   ├── CarruselView.tsx     # Carrusel de imágenes del sitio web
│   ├── ReportesView.tsx     # Reportes y métricas
│   └── UsuariosView.tsx     # Gestión de usuarios por sede (solo admin)
│
├── components/
│   ├── Modal.tsx            # Modal genérico reutilizable
│   ├── ConfirmAlert.tsx     # Diálogo de confirmación/alerta
│   ├── StatCard.tsx         # Tarjeta de estadística en el dashboard
│   ├── StatusBadge.tsx      # Badge de estado de citas (coloreado)
│   ├── Loader.tsx           # Spinner de carga global
│   └── MiniCalendar.tsx     # Calendario pequeño para selección de fecha
│
├── utils/
│   ├── appointments.ts      # isAlumnoExistenteCita() — distingue tipo de cita
│   └── imageProcessing.ts   # convertToWebPBlob() — convierte imágenes a WebP
│
└── docs/
    ├── supabase_auth_setup.sql  # Script SQL de RLS y funciones de auth
    └── ARQUITECTURA.md          # Este archivo
```

---

## 3. Autenticación y roles

### Hook `useAuth` (`hooks/useAuth.ts`)

Gestiona toda la sesión. Expone: `session`, `perfil`, `loadingAuth`, `signIn`, `signOut`.

El callback de `onAuthStateChange` es **síncrono** (solo `setState`): `auth-js` lo ejecuta con su candado interno tomado, así que un `await` a Supabase dentro de él se bloquea a sí mismo hasta el timeout (~8s al refrescar o al volver a la pestaña). El perfil se carga en un `useEffect` aparte, keyed por `session.user.id`.

| Evento Supabase | Comportamiento |
|---|---|
| `INITIAL_SESSION` | Verifica expiración manual (48h), fija la sesión y marca la sesión como verificada |
| `SIGNED_IN` | Actualiza la sesión (también se emite al volver a la pestaña; no recarga datos) |
| `SIGNED_OUT` | Limpia sesión, perfil y caché |
| `TOKEN_REFRESHED` / `USER_UPDATED` | Actualiza la sesión sin recargar perfil (evita flickers) |

- **Perfil en caché:** `localStorage['edutrack_perfil_cache']`. Se pinta al instante (solo UI; la seguridad real es RLS) y se revalida en segundo plano. Si la revalidación falla por red se conserva; si la cuenta está desactivada o sin perfil (`PGRST116`) se cierra la sesión.
- **Una sola petición de perfil:** `cargarPerfil()` comparte la petición en curso entre el efecto de perfil y `signIn()`.
- **Timeout de perfil:** 10 segundos máximo para `getPerfilUsuario`
- **Red de seguridad:** si Supabase no dispara ningún evento en 8s, se muestra el login en vez de un loader eterno
- **"Recordar sesión":** si no está marcado, guarda expiración de 48h en `localStorage`

### Roles

| Rol | Descripción | Restricciones |
|---|---|---|
| `administrador` | Acceso total | Ninguna |
| `sede` | Acceso limitado a su filial | No ve Usuarios, Reportes. No gestiona Filiales ni Gestión Web |

### Guard de autenticación en `App.tsx`

```
loadingAuth → <Loader />
!session || !perfil || !perfil.activo → <LoginView />
session + perfil activo → dashboard completo
```

---

## 4. Vistas (`views/`)

### `LoginView.tsx`
- Formulario de email + contraseña
- Checkbox "Recordar sesión"
- Muestra errores de autenticación
- Props: `onSignIn(email, password, rememberMe)`

### `DashboardView.tsx`
- Muestra 4 `StatCard`: Total citas, Confirmadas, Pendientes, Tasa de conversión
- Los stats se calculan con `useMemo` en App.tsx excluyendo citas de alumnos existentes
- Acceso: todos los roles

### `CitasView.tsx`
Vista más compleja. Tiene dos modos de visualización:

**Modo calendario** (`citasView === 'calendar'`):
- Semana actual con navegación anterior/siguiente
- Slider animado con dirección (`slideDir`)
- Botón `+` por celda de día-hora para agendar directamente
- Clic en cita abre modal de detalles

**Modo lista** (`citasView === 'list'`):
- Tabla filtrable por fecha, rango de fechas, filial y estado
- Filtros expandibles

**Modal de nueva cita** — flujo dual:
- `schedulingFlow === 'existing'`: selecciona alumno existente con búsqueda predictiva por filial
- `schedulingFlow === 'new'`: crea apoderado + alumnos nuevos en el mismo paso
  - `newStudentType === 'dependent'`: requiere datos del apoderado
  - `newStudentType === 'independent'`: alumno sin apoderado

**Modal de detalles de cita**:
- Navegación prev/next entre citas
- Cambio de estado con confirmación
- Reprogramación con mini-calendario integrado
- Edición de notas/observaciones

**Estados de cita disponibles:** `PENDIENTE`, `AGENDADO`, `CONFIRMADO`, `ASISTIÓ`, `FALTÓ`, `CONVERTIDO`, `CANCELADO`

### `AlumnosView.tsx`
- Listado con búsqueda por nombre
- Registro de alumno: `dependiente` (requiere apoderado) o `independiente`
- Eliminación (también borra sus citas asociadas)
- Acceso: todos los roles

### `ApoderadosView.tsx`
- Listado con búsqueda
- CRUD completo de apoderados
- Acceso: todos los roles

### `FilialesView.tsx`
- Tarjetas por filial con foto, datos de contacto y estado activo/inactivo
- **Gestión de Mensajes WSP** — modal con interfaz de drag-and-drop:
  - Columna "Disponibles" y columna "Asignadas"
  - Arrastra filiales entre columnas para asignar/desasignar mensajes
  - Botones "Seleccionar todo" / "Quitar todo"
  - Cada mensaje puede tener múltiples filiales; cada filial solo uno
- **Subida de foto con ajuste de imagen:**
  - Conversión automática a WebP antes de subir
  - Ajustador de posición (X/Y en %) y escala
  - `cacheControl: '2592000'` (30 días)
- Toggle activo/inactivo por filial
- Acceso: solo `administrador`

### `HistoriasView.tsx`
- Historias de transformación (testimonios de alumnos)
- CRUD con imagen, posición ajustable, color corporativo asignado
- Campo `palabras_por_min` para control de velocidad de lectura/animación
- Toggle activo (con confirmación si se desactiva)
- `loading="lazy"` y `decoding="async"` en thumbnails
- Acceso: solo `administrador`

### `CarruselView.tsx`
- Imágenes del carrusel del sitio web público
- **Reordenamiento por drag-and-drop** entre tarjetas
- CRUD con subida de imagen (WebP), ajuste de posición/escala
- Toggle activo/oculto por imagen
- Orden persistido en BD con campo `orden`
- Acceso: solo `administrador`

### `ReportesView.tsx`
- Métricas y gráficas de citas/matrículas
- Acceso: solo `administrador`

### `UsuariosView.tsx`
- Lista usuarios del sistema (`perfiles_usuario`)
- Crear usuarios de rol `sede` asignados a una filial
  - Usa `supabaseAdmin.auth.admin.createUser()` (GoTrue Admin API)
  - Crea entrada en `perfiles_usuario` tras creación en Auth
  - Si falla el perfil → revierte eliminando el usuario de Auth
- Activar / desactivar usuarios
- Acceso: solo `administrador`

---

## 5. Componentes reutilizables (`components/`)

| Componente | Uso |
|---|---|
| `Modal` | Wrapper genérico para cualquier modal. Controla visibilidad y cierre |
| `ConfirmAlert` | Diálogo de confirmación o alerta pura. Soporta modo destructivo (rojo) y modo solo-alerta |
| `StatCard` | Tarjeta de KPI con título, valor, ícono y color |
| `StatusBadge` | Badge coloreado según `AppointmentStatus` |
| `Loader` | Spinner de pantalla completa para carga inicial |
| `MiniCalendar` | Calendario compacto para selección de fecha en modales de cita |

---

## 6. Tipos principales (`types.ts`)

| Tipo / Interfaz | Descripción |
|---|---|
| `RolUsuario` | `'administrador' \| 'sede'` |
| `PerfilUsuario` | id (UUID), rol, id_filial, nombre_display, activo |
| `ActiveView` | Union de todas las vistas posibles (9 vistas) |
| `AppointmentStatus` | Enum de estados de cita con aliases de compatibilidad |
| `Appointment` | Cita con join de alumno_nombre y filial_nombre |
| `Alumno` | Estudiante con id_apoderado opcional |
| `Apoderado` | Tutor/padre con nombre, teléfono, email |
| `Filial` | Sede con datos de contacto, foto, posición, id_mensaje_wsp |
| `MensajeWsp` | Mensaje de WhatsApp con título y contenido |
| `Historia` | Testimonio con foto, color, narracion, palabras_por_min |
| `Carrusel02Imagen` | Imagen del carrusel con orden, posición y escala |
| `ColorCorporativo` | Color con hex y clase_css de Tailwind |
| `Stats` | Estadísticas globales calculadas con useMemo |

---

## 7. Estado global en `App.tsx`

### Datos de BD (arrays)
```
alumnos, apoderados, filiales, appointments (citas),
historias, coloresCorporativos, carrusel02, mensajesWsp
```

### Navegación y layout
```
activeView          — vista activa actual
isSidebarOpen       — sidebar abierto/cerrado (responsive)
isWebManagementOpen — submenú "Gestión Web" expandido
```

### Vista de citas
```
citasView           — 'calendar' | 'list'
calendarWeekStart   — semana mostrada en el calendario
slideDir            — dirección de animación del slider
```

### Modales y formularios de citas
```
isModalOpen, editingItem
schedulingFlow      — 'existing' | 'new'
selectedFilialId, selectedAlumnoId
searchStudentTerm, isStudentDropdownOpen
newStudentType      — 'dependent' | 'independent'
apoderadoNombre, apoderadoTelefono, apoderadoEmail
newStudents         — array [{nombre_completo, edad}]
appointmentDate, appointmentTime, appointmentObservaciones
preselectedDate, plusMenuDate
isConfirmingSave, pendingBookingPayload
isDetailsModalOpen, detailsAppointment
isReprogrammingExpanded, detailsNotes
isRescheduleModalOpen, rescheduleApp
selectedDate, selectedTime
```

### Filtros de citas
```
filterDateMode      — 'all' | 'specific' | 'range'
filterDateStart, filterDateEnd
filterFiliales      — array de ids seleccionados
filterStatus        — AppointmentStatus | 'ALL'
isFilterExpanded, isFilialDropdownOpen
```

### Filiales e imágenes
```
filialFile, filialPreview
filialPosX, filialPosY, filialScale
isFilialAjusteOpen, uploadingFilial
filialFileInputRef
```

### Mensajes WSP
```
isMensajesModalOpen, isEditMensajeOpen, editingMensaje
availableFiliales, selectedFiliales
draggingItem, dragPos
```

### Historias
```
isHistoriaModalOpen, editingHistoria
historiaFotoPreview, historiaFotoFile
historiaColorSeleccionado, uploadingFoto
ajustePosX, ajustePosY, ajusteScale, isAjusteOpen
```

### Carrusel
```
isCarrusel02ModalOpen, carrusel02Editing
carrusel02File, carrusel02Preview, carrusel02Uploading
carrusel02PosX, carrusel02PosY, carrusel02Scale
isCarrusel02AjusteOpen, carrusel02DragOver
carrusel02DragRef, carrusel02FileInputRef
```

### Colores corporativos
```
isColorManagerOpen, editingColor
colorFormNombre, colorFormHex, colorFormClaseCss
```

### Global
```
loading, refreshing  — carga inicial vs. refresco silencioso
searchTerm           — búsqueda en vistas de listado
alertConfig          — configuración del ConfirmAlert activo
isSettingsOpen       — panel de configuración
```

---

## 8. Sidebar — navegación condicional por rol

| Ítem de menú | `administrador` | `sede` |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Citas | ✅ | ✅ |
| Alumnos | ✅ | ✅ |
| Apoderados | ✅ | ✅ |
| **Gestión Web** (submenú) | ✅ | ❌ |
| → Filiales | ✅ | ❌ |
| → Historias | ✅ | ❌ |
| → Carrusel | ✅ | ❌ |
| Reportes | ✅ | ❌ |
| Usuarios | ✅ | ❌ |

El submenú "Gestión Web" se abre automáticamente cuando `activeView` es `filiales`, `historias` o `carrusel02`.

---

## 9. Tablas en Supabase

| Tabla | Descripción |
|---|---|
| `auth.users` | Usuarios del sistema (gestionado por Supabase Auth / GoTrue) |
| `perfiles_usuario` | Perfil extendido: rol, filial asignada, nombre_display, activo |
| `filiales` | Sedes del colegio |
| `alumnos` | Estudiantes registrados |
| `apoderados` | Tutores/padres de familia |
| `citas` | Citas de alumnos existentes |
| `entrevistas` | Citas de matrículas nuevas |
| `historias_transformacion` | Testimonios de alumnos |
| `carrusel_02_imagenes` | Imágenes del carrusel web |
| `colores_corporativos` | Paleta de colores de la marca |
| `mensajes_wsp` | Mensajes de WhatsApp plantilla por filial |

### RLS activo en todas las tablas
- Función `es_administrador()` SECURITY DEFINER para evitar recursión infinita en policies
- Rol `administrador`: acceso total
- Rol `sede`: acceso solo a registros de su `id_filial`

### Storage buckets
| Bucket | Uso |
|---|---|
| `Testimonios/` | Fotos de historias de transformación |
| `Filiales/` | Fotos de portada de cada sede |
| `Carrusel02/` | Imágenes del carrusel web |

---

## 10. Utilidades (`utils/`)

### `imageProcessing.ts` — `convertToWebPBlob(file)`
Convierte cualquier imagen a WebP con calidad 0.85 y ancho máximo 800px antes de subirla a Supabase Storage.

### `appointments.ts` — `isAlumnoExistenteCita(appointment)`
Devuelve `true` si la cita es de un alumno ya registrado (vs. matrícula nueva). Usado para separar las estadísticas del dashboard.

---

## 11. Fetch de datos

`fetchAllData(silent?)` en App.tsx lanza en paralelo:
```
getAlumnos, getFiliales, getCitas, getApoderados,
getHistorias, getColoresCorporativos, getCarruselImagenes, getMensajesWsp
```
- Cada tabla se aplica al estado apenas responde, y el fallo de una no bloquea a las demás (cada error se registra en consola como `[FETCH] Error <tabla>`)
- `silent = true` → activa indicador `refreshing` sin bloquear la UI
- Arranca apenas hay `session` (en paralelo con la carga del perfil); RLS filtra por el JWT

---

## 12. Supabase — clientes

| Cliente | Key usada | Uso |
|---|---|---|
| `supabase` | anon key | Todas las operaciones de usuario normal |
| `supabaseAdmin` | service role key | Solo para crear usuarios vía GoTrue Admin API (`crearUsuarioSede`) |

`supabaseAdmin` tiene `autoRefreshToken: false` y `persistSession: false` — nunca persiste sesión propia.
