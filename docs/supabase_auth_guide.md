# Guía de Implementación: Autenticación y Control de Accesos por Roles (RBAC) con Supabase

Esta guía detalla la arquitectura, el diseño de la base de datos y la implementación en React para integrar un sistema de **Login, Registro** y **Protección de Funcionalidades** según el tipo de usuario (Administrador, Recepción, Profesor, etc.) utilizando **Supabase**.

---

## 1. Diseño de Base de Datos y Roles

Supabase maneja la autenticación en su esquema interno `auth.users`. Para asociar metadatos adicionales como el **Rol** o la **Sede asociada**, crearemos una tabla `profiles` (perfiles) en el esquema público vinculada por clave foránea.

### Script SQL para Supabase

Ejecuta el siguiente script en la consola SQL de tu proyecto Supabase:

```sql
-- 1. Crear tipo ENUM para los roles permitidos
CREATE TYPE user_role AS ENUM ('administrador', 'recepcion', 'profesor');

-- 2. Crear la tabla de Perfiles públicos
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  rol user_role NOT NULL DEFAULT 'recepcion',
  id_filial INTEGER REFERENCES public.filiales(id) ON DELETE SET NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politica RLS: Cualquiera puede ver perfiles públicos
CREATE POLICY "Permitir lectura de perfiles públicos" 
ON public.profiles FOR SELECT 
USING (true);

-- Politica RLS: Solo el propio usuario puede actualizar su perfil
CREATE POLICY "Permitir actualización del propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Crear disparador (Trigger) para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, rol, id_filial)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre_completo', 'Nuevo Usuario'),
    COALESCE((new.raw_user_meta_data->>'rol')::user_role, 'recepcion'),
    (new.raw_user_meta_data->>'id_filial')::INTEGER
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 2. Cliente de Autenticación en React (`config/supabase.ts`)

Asegúrate de que tu configuración de Supabase esté lista para utilizar autenticación.

```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 3. Estado de Autenticación Contextual en React (`context/AuthContext.tsx`)

Crear un Contexto de React para proveer la sesión activa y los datos del perfil actual del usuario en toda la aplicación.

```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'administrador' | 'recepcion' | 'profesor';

interface Profile {
  id: string;
  nombre_completo: string;
  rol: UserRole;
  id_filial: number | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de estado de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error al obtener perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 4. Pantalla de Login e Inicio de Sesión (`views/LoginView.tsx`)

Una vista simple, elegante y responsive para que los usuarios puedan autenticarse.

```typescript
// views/LoginView.tsx
import React, { useState } from 'react';
import { supabase } from '../config/supabase';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Credenciales incorrectas. Verifique correo y contraseña.' 
        : authError.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800">EduTrack</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Acceso al Panel Central</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Correo electrónico</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm shadow-sm bg-slate-50/50"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              required
              className="w-full p-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm shadow-sm bg-slate-50/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all uppercase tracking-wider text-xs shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

---

## 5. Integración y Protección de Rutas (`App.tsx`)

Modifica el layout principal en `App.tsx` para envolver la app con `<AuthProvider>` y evaluar si el usuario ha iniciado sesión antes de mostrar el panel.

```typescript
// App.tsx (Estructura de enrutado protegido)
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';

const MainAppContent: React.FC = () => {
  const { user, profile, loading, logout } = useAuth();

  // 1. Mostrar Spinner mientras carga la sesión en Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. Si no hay sesión iniciada, mostrar vista de Login
  if (!user) {
    return <LoginView />;
  }

  // 3. Si hay sesión, renderizar el Dashboard protegido
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar con perfiles condicionales */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="px-4">
            <h3 className="text-white font-extrabold text-xl">EduTrack</h3>
            <p className="text-slate-400 text-xs font-bold capitalize mt-1">Rol: {profile?.rol}</p>
          </div>
          {/* Navegación protegida */}
          <nav className="space-y-1">
            <button onClick={() => setActiveView('dashboard')}>Inicio</button>
            <button onClick={() => setActiveView('citas')}>Citas</button>
            
            {/* Solo administradores ven Reportes e Historias */}
            {profile?.rol === 'administrador' && (
              <>
                <button onClick={() => setActiveView('reportes')}>Reportes</button>
                <button onClick={() => setActiveView('historias')}>Historias Clínicas</button>
              </>
            )}
          </nav>
        </div>
        {/* Perfil del Usuario / Logout */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
          <div className="px-4">
            <p className="text-white font-bold text-sm truncate">{profile?.nombre_completo}</p>
            <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      {/* Contenido Principal */}
      <main className="flex-1 p-6">
        {/* Renderizado condicional de vistas protegidas */}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'citas' && <CitasView />}
        {activeView === 'reportes' && profile?.rol === 'administrador' && <ReportesView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
```

---

## 6. Políticas de RLS en Supabase para Datos Específicos

Para proteger los datos a nivel de servidor (Supabase API), crearemos políticas RLS basadas en el rol del usuario que ejecuta la consulta.

### Ejemplo para la tabla `appointments` / `citas`:

```sql
-- Habilitar RLS en citas
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

-- 1. Administradores: Acceso completo (CRUD) a cualquier cita
CREATE POLICY "Admin: CRUD completo" 
ON public.citas FOR ALL 
TO authenticated
USING (
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'administrador'
);

-- 2. Recepción: Solo lectura y actualización de citas pertenecientes a su Sede (id_filial)
CREATE POLICY "Recepcion: CRUD citas de su filial" 
ON public.citas FOR ALL 
TO authenticated
USING (
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'recepcion'
  AND id_filial = (SELECT id_filial FROM public.profiles WHERE id = auth.uid())
);

-- 3. Profesores: Solo ver (SELECT) citas de alumnos asignados a su filial
CREATE POLICY "Profesores: Solo lectura citas de su filial" 
ON public.citas FOR SELECT 
TO authenticated
USING (
  (SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'profesor'
  AND id_filial = (SELECT id_filial FROM public.profiles WHERE id = auth.uid())
);
```
