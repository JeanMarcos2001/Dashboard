import { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { getPerfilUsuario, signIn as authSignIn, signOut as authSignOut } from '@/services/auth';
import type { PerfilUsuario } from '@/types';

const SESSION_EXPIRY_KEY = 'edutrack_session_expiry';
const PERFIL_CACHE_KEY = 'edutrack_perfil_cache';
const SESSION_48H = 48 * 60 * 60 * 1000;
const PERFIL_TIMEOUT_MS = 10000;
const SAFETY_TIMEOUT_MS = 8000;

interface UseAuthReturn {
  session: Session | null;
  perfil: PerfilUsuario | null;
  loadingAuth: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

type PerfilResult = { data: PerfilUsuario | null; error: any };

// ─── Caché del perfil ─────────────────────────────────────────────────────────
// Solo acelera la UI (rol y sede visibles al instante); la seguridad real la aplica RLS en Supabase.

const leerPerfilCache = (): PerfilUsuario | null => {
  try {
    const raw = localStorage.getItem(PERFIL_CACHE_KEY);
    const perfil = raw ? (JSON.parse(raw) as PerfilUsuario) : null;
    return perfil?.id && perfil.activo ? perfil : null;
  } catch {
    return null;
  }
};

const guardarPerfilCache = (perfil: PerfilUsuario) => {
  try { localStorage.setItem(PERFIL_CACHE_KEY, JSON.stringify(perfil)); } catch { /* almacenamiento no disponible */ }
};

const limpiarPerfilCache = () => {
  try { localStorage.removeItem(PERFIL_CACHE_KEY); } catch { /* almacenamiento no disponible */ }
};

const sesionManualExpirada = () => {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  return !!expiry && Date.now() > Number(expiry);
};

// ─── Carga del perfil (una sola petición aunque la pidan varios a la vez) ─────

let perfilEnCurso: { userId: string; promise: Promise<PerfilResult> } | null = null;

const cargarPerfil = (userId: string): Promise<PerfilResult> => {
  if (perfilEnCurso?.userId === userId) return perfilEnCurso.promise;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<PerfilResult>((resolve) => {
    timer = setTimeout(
      () => resolve({ data: null, error: { code: 'TIMEOUT', message: 'tiempo de espera agotado' } }),
      PERFIL_TIMEOUT_MS
    );
  });

  const promise: Promise<PerfilResult> = Promise.race([
    getPerfilUsuario(userId).catch((error): PerfilResult => ({ data: null, error })),
    timeout,
  ]).finally(() => {
    clearTimeout(timer);
    if (perfilEnCurso?.promise === promise) perfilEnCurso = null;
  });

  perfilEnCurso = { userId, promise };
  return promise;
};

export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(leerPerfilCache);
  const [sesionVerificada, setSesionVerificada] = useState(false);
  const [perfilFallido, setPerfilFallido] = useState(false);
  const [iniciandoSesion, setIniciandoSesion] = useState(false);
  const iniciandoRef = useRef(false);

  const limpiarEstado = () => {
    limpiarPerfilCache();
    setSession(null);
    setPerfil(null);
  };

  const cerrarSesion = async () => {
    limpiarEstado();
    await authSignOut();
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  };

  // ── Estado de la sesión de Supabase ─────────────────────────────────────────
  useEffect(() => {
    // Red de seguridad: si Supabase nunca responde, mostrar el login en vez de un loader eterno
    const safetyTimer = setTimeout(() => setSesionVerificada(true), SAFETY_TIMEOUT_MS);

    // IMPORTANTE: este callback debe ser SÍNCRONO. auth-js lo ejecuta con su candado interno
    // tomado y espera a que termine; un await a Supabase aquí se bloquea a sí mismo hasta el
    // timeout (~8s al refrescar o al volver a la pestaña). El perfil se carga en el efecto de abajo.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nueva) => {
      if (event === 'SIGNED_OUT' || !nueva?.user) {
        limpiarEstado();
        setSesionVerificada(true);
        return;
      }
      const entrante: Session = nueva;

      if (event === 'INITIAL_SESSION') {
        if (sesionManualExpirada()) {
          limpiarEstado();
          setSesionVerificada(true);
          setTimeout(() => { authSignOut().finally(() => localStorage.removeItem(SESSION_EXPIRY_KEY)); }, 0);
          return;
        }
        setSesionVerificada(true);
      }

      // INITIAL_SESSION, SIGNED_IN (también al volver a la pestaña), TOKEN_REFRESHED y USER_UPDATED
      setSession((actual) =>
        actual?.user.id === entrante.user.id && actual.access_token === entrante.access_token ? actual : entrante
      );
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // ── Perfil del usuario con sesión (se revalida en segundo plano aunque haya caché) ──
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelado = false;
    setPerfilFallido(false);

    cargarPerfil(userId).then(({ data, error }) => {
      // Durante signIn() es él quien valida el perfil y muestra el error al usuario
      if (cancelado || iniciandoRef.current) return;

      if (data?.activo) {
        guardarPerfilCache(data);
        setPerfil(data);
        return;
      }
      if (data) {
        void cerrarSesion(); // cuenta desactivada
        return;
      }
      setPerfilFallido(true);
      if (error?.code === 'PGRST116') void cerrarSesion(); // la cuenta no tiene perfil
      // Cualquier otro error (red, timeout): se conserva el perfil en caché si existe
    });

    return () => { cancelado = true; };
  }, [userId]);

  const signIn = async (email: string, password: string, rememberMe: boolean): Promise<{ error: string | null }> => {
    iniciandoRef.current = true;
    setIniciandoSesion(true);
    try {
      // 1. Autenticar credenciales con timeout de 10s
      const authTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.')), 10000)
      );
      const result = await Promise.race([authSignIn(email, password), authTimeout]);
      if (result.error) return { error: result.error.message };

      const userId = result.data?.session?.user?.id;
      if (!userId) return { error: 'No se pudo iniciar la sesión. Intenta de nuevo.' };

      // 2. Verificar que el perfil existe y está activo (reutiliza la petición del efecto de perfil)
      const { data: perfilData, error: perfilErr } = await cargarPerfil(userId);
      if (!perfilData) {
        await authSignOut();
        return {
          error: perfilErr?.code === 'PGRST116'
            ? 'Tu cuenta no tiene un perfil configurado. Contacta al administrador.'
            : `No se pudo cargar tu perfil (${perfilErr?.message ?? 'sin respuesta'}). Intenta de nuevo.`,
        };
      }
      if (!perfilData.activo) {
        await authSignOut();
        return { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
      }

      // 3. Política de "recordar sesión"
      if (!rememberMe) {
        localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_48H));
      } else {
        localStorage.removeItem(SESSION_EXPIRY_KEY);
      }

      guardarPerfilCache(perfilData);
      setPerfil(perfilData);
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Error al conectar con el servidor.' };
    } finally {
      iniciandoRef.current = false;
      setIniciandoSesion(false);
    }
  };

  const signOut = async () => {
    await cerrarSesion();
  };

  // El perfil en caché solo vale si pertenece al usuario de la sesión actual
  const perfilActual = userId && perfil?.id === userId ? perfil : null;
  const loadingAuth =
    !sesionVerificada || (!!session && !perfilActual && !perfilFallido && !iniciandoSesion);

  return { session, perfil: perfilActual, loadingAuth, signIn, signOut };
};
