# CLAUDE.md — Estado del Proyecto EduTrack Dashboard

Estructura y reglas del proyecto: @AGENTS.md

Léelo antes de cualquier cambio y respétalo en cada prompt.

---

## 📌 Estado Actual del Proyecto (Rama `feature/auth-roles`)

### 1. Autenticación y Roles (Completado en Código)
- **Implementado:** Supabase Auth con roles `administrador` y `sede`.
- **Vistas nuevas:** `LoginView.tsx` (pantalla de ingreso) y `UsuariosView.tsx` (gestión de usuarios para admin).
- **Vistas restringidas:** Permisos ajustados en `AlumnosView`, `ApoderadosView`, `ReportesView` y `Gestión Web`.
- **Servicios/Hooks:** `services/auth.ts` y `hooks/useAuth.ts` listos.
- **SQL de Supabase:** Preparado en `docs/supabase_auth_setup.sql`.
- **Pendiente Manual:** Ejecución de SQL y creación de usuario admin en Supabase tras reinicio de ciclo de facturación (26 de Agosto).

### 2. Optimización de Caché y Ancho de Banda (Pendiente de Implementación)
- Redimensionamiento y compresión previa de imágenes (WebP < 150 KB).
- Encabezado `cacheControl: '2592000'` (30 días) en uploads de Filiales, Historias y Carrusel.
- Atributos `loading="lazy"` y `decoding="async"` en componentes de interfaz.
