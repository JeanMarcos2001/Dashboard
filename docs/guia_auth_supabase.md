# Guía de Integración de Autenticación y Sesiones con Supabase
### Extraída del proyecto SystemMkt · Stack: React + TypeScript + Vite + Zustand + React Query + Supabase

---

## Visión general de la arquitectura

```
Supabase Auth (auth.users)
       │
       │ trigger automático al registrarse
       ▼
public.profiles  ──────  tabla propia con rol, estado, datos del perfil
       │
       │ consultada en cada login / restauración de sesión
       ▼
AuthStore (Zustand)  ──  estado global: { user, session, isLoading }
       │
       │ inyectado a toda la app vía AuthProvider
       ▼
ProtectedRoute / RoleRoute  ──  guardias de navegación por ruta
```

---

## Paso 1 — Instalar dependencias

```bash
npm install @supabase/supabase-js zustand @tanstack/react-query react-hook-form @hookform/resolvers zod
```

---

## Paso 2 — Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Copiar las credenciales: **Project URL** y **anon/public key**
3. En **Authentication → Settings**:
   - Habilitar confirmación de correo si lo deseas
   - En *Site URL*: poner la URL de tu app (ej. `http://localhost:5173`)
   - En *Redirect URLs*: agregar `http://localhost:5173/reset-password`

---

## Paso 3 — Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://TU_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...tu_clave_anonima
```

Y en `.gitignore`:
```
.env
```

---

## Paso 4 — Cliente Supabase

`src/services/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

> Este cliente se importa en **todos** los servicios que necesiten acceder a Supabase.

---

## Paso 5 — Migración SQL: tabla `profiles`

Ejecutar en el **SQL Editor** de Supabase. Esta tabla extiende `auth.users` con datos propios de tu app (rol, estado, nombre, etc.).

```sql
-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de perfiles (vinculada 1:1 a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text NOT NULL,
  avatar_url    text,
  phone         text,
  role          text NOT NULL CHECK (role IN ('admin', 'supervisor', 'designer')),
  status        text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  requested_role text CHECK (requested_role IN ('supervisor', 'designer')),
  bio           text,
  specialty     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Funciones helper (usadas en políticas RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin', false
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active', false
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Políticas RLS básicas para `profiles`

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin puede leer todos los perfiles
CREATE POLICY "Admin reads all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Admin puede actualizar cualquier perfil (cambiar rol/estado)
CREATE POLICY "Admin updates any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Un usuario puede actualizar sus propios datos (no rol ni status)
CREATE POLICY "User updates own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Trigger para crear el perfil automáticamente al registrarse

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, status, requested_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'designer',              -- rol por defecto (el admin lo sube luego)
    'pending',               -- estado por defecto: espera aprobación
    NEW.raw_user_meta_data->>'requested_role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

> **Nota:** Para el primer usuario administrador, luego del registro ejecuta manualmente:
> ```sql
> UPDATE public.profiles
> SET role = 'admin', status = 'active'
> WHERE email = 'tu_correo@ejemplo.com';
> ```

---

## Paso 6 — Tipos TypeScript

`src/shared/types/app.types.ts`

```typescript
export type UserRole = 'admin' | 'supervisor' | 'designer';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  requested_role: string | null;
  bio: string | null;
  specialty: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Paso 7 — Servicio de autenticación

`src/modules/auth/services/authService.ts`

```typescript
import { supabase } from '../../../services/supabase/client';

export const authService = {
  // Login con email y contraseña
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Registro de nuevo usuario
  async signUp(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    requestedRole: 'supervisor' | 'designer';
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          requested_role: payload.requestedRole,
          // Estos datos llegan al trigger de SQL via raw_user_meta_data
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Reenviar correo de confirmación
  async resendConfirmationEmail(email: string) {
    const { data, error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return data;
  },

  // Enviar enlace de restablecimiento de contraseña
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  // Obtener sesión actual (persiste entre refrescos de página)
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};
```

---

## Paso 8 — Servicio de usuarios (perfil)

`src/modules/users/services/userService.ts`

```typescript
import { supabase } from '../../../services/supabase/client';
import { Profile, UserRole } from '../../../shared/types/app.types';

export const userService = {
  // Perfil del usuario actualmente logueado
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Listar todos los usuarios (admin)
  async getUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Profile[];
  },

  // Usuarios pendientes de aprobación
  async getPendingUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Profile[];
  },

  // Activar un usuario
  async activateUser(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // Suspender un usuario
  async suspendUser(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'suspended' })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // Rechazar un usuario
  async rejectUser(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // Cambiar el rol de un usuario (solo admin)
  async updateUserRole(userId: string, role: UserRole): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // El usuario actualiza sus propios datos (sin poder cambiar role/status)
  async updateMyProfile(payload: Partial<Profile>): Promise<Profile> {
    // Se excluyen los campos sensibles que no puede auto-modificar
    const { role, status, id, created_at, email, ...allowedFields } = payload as any;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No hay una sesión activa.');

    const { data, error } = await supabase
      .from('profiles')
      .update(allowedFields)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
```

---

## Paso 9 — Store global de autenticación (Zustand)

`src/modules/auth/store.ts`

```typescript
import { create } from 'zustand';
import { Profile } from '../../shared/types/app.types';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  justLoggedIn: boolean;        // true solo en el login de esta pestaña (no en restauración)
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setJustLoggedIn: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,      // Empieza en true para bloquear UI hasta que se restaure la sesión
  justLoggedIn: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setJustLoggedIn: (justLoggedIn) => set({ justLoggedIn }),
  logout: () => set({ user: null, session: null }),
}));
```

---

## Paso 10 — Hook `useAuth` (React Query)

`src/modules/auth/hooks/useAuth.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store';
import { userService } from '../../users/services/userService';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, setSession, setJustLoggedIn } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: async (data) => {
      setSession(data.session);
      // Guardar timestamp de login para timeouts absolutos de sesión
      localStorage.setItem('app_login_at', String(Date.now()));
      try {
        const profile = await userService.getCurrentProfile();
        setUser(profile);
      } catch (err) {
        setUser(null);
      }
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
      setJustLoggedIn(true);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      localStorage.removeItem('app_login_at');
      setUser(null);
      setSession(null);
      queryClient.clear();
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
```

---

## Paso 11 — AuthProvider (restaura sesión y escucha cambios)

`src/modules/auth/components/AuthProvider.tsx`

```tsx
import React, { useEffect } from 'react';
import { supabase } from '../../../services/supabase/client';
import { useAuthStore } from '../store';
import { userService } from '../../users/services/userService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, setSession, setLoading } = useAuthStore();

  // ── 1. RESTAURAR SESIÓN AL CARGAR LA APP ─────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Supabase guarda la sesión en localStorage automáticamente.
        // getSession() la recupera sin necesidad de hacer login de nuevo.
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session?.user) {
          const profile = await userService.getCurrentProfile();
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);   // ← desbloquea la UI
      }
    };

    initAuth();

    // ── 2. ESCUCHAR CAMBIOS DE SESIÓN (login/logout en otras pestañas) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          try {
            const profile = await userService.getCurrentProfile();
            setUser(profile);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  // ── 3. DETECTAR CAMBIOS DE ROL/ESTADO EN TIEMPO REAL ─────────────────
  // Si un admin cambia el rol o suspende a este usuario, lo expulsamos
  // de la sesión inmediatamente sin esperar a que refresque la página.
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-watch-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as { role: string; status: string };
          if (updated.role !== user.role || updated.status !== user.status) {
            supabase.auth.signOut().finally(() => {
              setUser(null);
              setSession(null);
              window.location.href = '/login';
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, user?.role, user?.status, setUser, setSession]);

  return <>{children}</>;
};
```

> **Requisito para el punto 3:** La tabla `profiles` debe estar en la publicación de Realtime de Supabase. Ejecutar en SQL Editor:
> ```sql
> ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
> ```

---

## Paso 12 — Guardias de rutas

`src/app/routes/index.tsx`

```tsx
import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../modules/auth/store';

// ── Guarda 1: usuario autenticado y activo ───────────────────────────────
const ProtectedRoute: React.FC = () => {
  const { user, session } = useAuthStore();

  // Sin sesión → login
  if (!session) return <Navigate to="/login" replace />;

  if (user) {
    if (user.status === 'pending')   return <Navigate to="/pending-account" replace />;
    if (user.status === 'suspended') return <Navigate to="/suspended-account" replace />;
    if (user.status === 'rejected')  return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ── Guarda 2: rol requerido ──────────────────────────────────────────────
const RoleRoute: React.FC<{ allowedRoles: ('admin' | 'supervisor' | 'designer')[] }> = ({ allowedRoles }) => {
  const { user } = useAuthStore();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/no-permission" replace />;
  }
  return <Outlet />;
};

// ── Árbol de rutas ───────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  const { session, user } = useAuthStore();
  const isAuthenticated = !!session && user?.status === 'active';

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/app/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/app/dashboard" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Estados de cuenta */}
      <Route path="/pending-account"   element={<PendingAccountPage />} />
      <Route path="/suspended-account" element={<SuspendedAccountPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile"   element={<ProfilePage />} />

          {/* Solo admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="admin/users"    element={<UsersAdminPage />} />
          </Route>

          {/* Admin y supervisor */}
          <Route element={<RoleRoute allowedRoles={['admin', 'supervisor']} />}>
            <Route path="tasks"          element={<TasksPage />} />
            <Route path="tasks/:id"      element={<TaskDetailPage />} />
          </Route>

          {/* Todos los roles */}
          <Route element={<RoleRoute allowedRoles={['admin', 'supervisor', 'designer']} />}>
            <Route path="my-tasks"       element={<MyTasksPage />} />
          </Route>
        </Route>
      </Route>

      {/* Raíz y 404 */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
```

---

## Paso 13 — Wrappers en el punto de entrada

`src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './modules/auth/components/AuthProvider';
import { AppRoutes } from './app/routes';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider va dentro de QueryClient porque userService usa React Query */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## Paso 14 — Cómo usar el estado de auth en cualquier componente

```tsx
import { useAuthStore } from '../../modules/auth/store';
import { useAuth } from '../../modules/auth/hooks/useAuth';

const MyComponent = () => {
  const { user } = useAuthStore();         // datos del perfil
  const { logout, isLoggingOut } = useAuth();

  if (!user) return null;

  return (
    <div>
      <p>Hola, {user.first_name} ({user.role})</p>
      <button onClick={() => logout()} disabled={isLoggingOut}>
        Cerrar sesión
      </button>

      {/* Renderizado condicional por rol */}
      {user.role === 'admin' && <AdminPanel />}
    </div>
  );
};
```

---

## Flujo completo de una sesión

```
1. Usuario abre la app
   └─ AuthProvider llama getSession()
      ├─ SI hay sesión guardada → carga el perfil → setUser() → isLoading=false
      └─ SI no hay sesión       → setUser(null)   → isLoading=false

2. Usuario hace login (LoginPage)
   └─ useAuth().login(email, password)
      └─ authService.signIn() → Supabase devuelve { session, user }
         └─ setSession() + getCurrentProfile() + setUser()
            └─ navigate('/app/dashboard')

3. Usuario navega entre páginas
   └─ ProtectedRoute verifica session + user.status
   └─ RoleRoute verifica user.role

4. Admin cambia rol/estado de un usuario activo
   └─ AuthProvider escucha via Realtime el UPDATE en profiles
      └─ signOut() + redirect('/login')

5. Usuario cierra sesión
   └─ useAuth().logout()
      └─ authService.signOut() → limpia localStorage + store + query cache
```

---

## Sección de usuarios (panel de administración)

El flujo de gestión de usuarios funciona así:

1. **Registro público** → `status = 'pending'`, `role = 'designer'` (por el trigger SQL)
2. **Admin aprueba** → llama `userService.activateUser(id)` → `status = 'active'`
3. **Admin sube de rol** → llama `userService.updateUserRole(id, 'supervisor')` → activa Realtime en el afectado
4. **Admin suspende** → llama `userService.suspendUser(id)` → Realtime fuerza logout al afectado

> **Truco clave:** Al detectar el cambio por Realtime, el cliente del usuario afectado llama a `signOut()` y redirige a `/login` automáticamente, sin esperar a que recargue la página.

---

## Resumen de archivos a crear

| Archivo | Propósito |
|---|---|
| `src/services/supabase/client.ts` | Instancia única del cliente Supabase |
| `src/shared/types/app.types.ts` | Tipos `Profile`, `UserRole`, `UserStatus` |
| `src/modules/auth/services/authService.ts` | signIn / signUp / signOut / resetPassword |
| `src/modules/users/services/userService.ts` | CRUD de perfiles |
| `src/modules/auth/store.ts` | Estado global con Zustand |
| `src/modules/auth/hooks/useAuth.ts` | Mutaciones con React Query |
| `src/modules/auth/components/AuthProvider.tsx` | Restauración de sesión + Realtime |
| `src/app/routes/index.tsx` | ProtectedRoute + RoleRoute + árbol de rutas |
| `src/main.tsx` | Orden correcto de providers |
| `supabase/migrations/001_initial_schema.sql` | Tabla profiles + trigger + RLS |
