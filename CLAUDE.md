# CLAUDE.md — Estado del Proyecto EduTrack Dashboard

Estructura y reglas del proyecto: @AGENTS.md
Inventario completo del proyecto (vistas, servicios, tipos, estado): @docs/ARQUITECTURA.md

Léelos antes de cualquier cambio y respétalos en cada prompt.

---

## 📌 Estado Actual del Proyecto (Rama `feature/auth-roles`)

### 1. Autenticación y Roles (Completado en Código)
- **Implementado:** Supabase Auth con roles `administrador` y `sede`.
- **Vistas nuevas:** `LoginView.tsx` (pantalla de ingreso) y `UsuariosView.tsx` (gestión de usuarios para admin).
- **Vistas restringidas:** Permisos ajustados en `AlumnosView`, `ApoderadosView`, `ReportesView` y `Gestión Web`.
- **Servicios/Hooks:** `services/auth.ts` y `hooks/useAuth.ts` listos.
- **SQL de Supabase:** Preparado en `docs/supabase_auth_setup.sql`.
- **Pendiente Manual:** Ejecución de SQL y creación de usuario admin en Supabase tras reinicio de ciclo de facturación (26 de Agosto).

### 2. Optimización de Caché y Ancho de Banda (Completado)
- Conversión a WebP aplicada también en uploads de Filiales (antes solo en Historias y Carrusel).
- `cacheControl: '2592000'` (30 días) añadido en `services/filiales.ts`, `services/historias.ts` y `services/carrusel.ts`.
- `loading="lazy"` y `decoding="async"` en thumbnails remotos de `HistoriasView` y `CarruselView`.

---

## 🚀 Evolución Planificada — CRM WhatsApp + Reestructuración

### Decisiones de arquitectura aprobadas

El proyecto escalará de dashboard de gestión a **CRM educativo con canal de WhatsApp por sede e IA**. Para soportar este crecimiento sin deuda técnica se adoptarán tres cambios estructurales **antes** de implementar el CRM:

| Cambio | Motivo |
|---|---|
| **React Router** | URLs navegables por módulo (`/chat`, `/alumnos`, `/configuracion`). Necesario para que cada conversación de WhatsApp tenga su propio link y el historial del navegador funcione. |
| **Zustand** | Estado global sin prop-drilling. El patrón actual de `App.tsx` + props no escala con chat en tiempo real, sesión de IA y múltiples módulos simultáneos. |
| **Vercel API (`/api/*.ts`)** | Lógica de servidor para el webhook de WhatsApp y las llamadas a la API de IA. Las claves de IA nunca deben quedar expuestas en el bundle del frontend. |

### Módulos nuevos planificados

- **Chat CRM por sede** — bandeja de conversaciones de WhatsApp, historial, etiquetas de contacto.
- **Bot de IA configurable** — cada sede define su propio prompt y activa/desactiva respuestas automáticas.
- **Registro de citas desde WhatsApp** — el bot agenda directamente en el módulo de citas.
- **Panel de configuración de WhatsApp** — el admin registra los números y credenciales API de cada sede.

### Webhook de WhatsApp
- **Estrategia elegida:** Vercel Serverless Function (`api/wsp-webhook.ts`) — auto-deploy con cada push a `main`, 1M invocaciones/mes gratis.
- **Credenciales obtenidas:** Phone Number ID, WABA ID, Access Token permanente, App Secret.
- **Pendiente:** Verify Token (lo define el dev) + URL final del webhook en Meta (se configura al desplegar la función).

### Preguntas pendientes de responder antes de planificar la migración
1. ¿Cuántas vistas existen actualmente además de las listadas en este archivo?
2. ¿El chat de sede es solo desktop o también necesita ser responsive/móvil?
3. ¿El admin puede editar el prompt del bot de cada sede, o solo cada sede gestiona el suyo?
4. ¿Las citas agendadas por WhatsApp van a la tabla `citas` existente o a una tabla separada?
5. ¿El sidebar actual se rediseña o se mantiene igual al agregar los nuevos módulos?
