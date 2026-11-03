import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { getPerfilUsuario, signIn as authSignIn, signOut as authSignOut } from '@/services/auth';
import type { PerfilUsuario } from '@/types';

const SESSION_EXPIRY_KEY = 'edutrack_session_expiry';
const SESSION_48H = 48 * 60 * 60 * 1000;

interface UseAuthReturn {
  session: Session | null;
  perfil: PerfilUsuario | null;
  loadingAuth: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const withProfileTimeout = (userId: string) =>
  Promise.race([
    getPerfilUsuario(userId),
    new Promise<{ data: null; error: null }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: null }), 8000)
    ),
  ]);

export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const cerrarSesionExpirada = async () => {
    await authSignOut();
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    setSession(null);
    setPerfil(null);
  };

  useEffect(() => {
    // Timer de seguridad: si Supabase no dispara INITIAL_SESSION en 6s, desbloquear UI
    const safetyTimer = setTimeout(() => setLoadingAuth(false), 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        // ── Carga inicial ──────────────────────────────────────────────────────
        if (event === 'INITIAL_SESSION') {
          try {
            if (!session?.user) {
              // Sin sesión guardada → mostrar login
              return;
            }
            // Verificar expiración manual de sesión (48h sin "recordarme")
            const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
            if (expiry && Date.now() > Number(expiry)) {
              await cerrarSesionExpirada();
              return;
            }
            const { data } = await withProfileTimeout(session.user.id);
            if (data && !data.activo) {
              await cerrarSesionExpirada();
              return;
            }
            setSession(session);
            setPerfil(data);
          } catch {
            setSession(null);
            setPerfil(null);
          } finally {
            clearTimeout(safetyTimer);
            setLoadingAuth(false);
          }
          return;
        }

        // ── Cierre de sesión ───────────────────────────────────────────────────
        if (event === 'SIGNED_OUT' || !session?.user) {
          clearTimeout(safetyTimer);
          setLoadingAuth(false);
          setSession(null);
          setPerfil(null);
          return;
        }

        // ── Login exitoso ──────────────────────────────────────────────────────
        if (event === 'SIGNED_IN') {
          try {
            const { data } = await withProfileTimeout(session.user.id);
            if (data && !data.activo) {
              await cerrarSesionExpirada();
              return;
            }
            setSession(session);
            if (data) setPerfil(data);
          } catch {
            setSession(session);
          }
          return;
        }

        // ── Refresco de token (cada ~1h) — mantener perfil existente ──────────
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(session);
          // No recargar perfil aquí para evitar flickers; el perfil ya está en memoria
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean): Promise<{ error: string | null }> => {
    try {
      // 1. Autenticar credenciales con timeout de 10s
      const authTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.')), 10000)
      );
      const result = await Promise.race([authSignIn(email, password), authTimeout]);
      if (result.error) return { error: result.error.message };

      // 2. Verificar que el perfil existe y está activo
      const userId = result.data?.session?.user?.id;
      if (userId) {
        const { data: perfilData, error: perfilErr } = await withProfileTimeout(userId);
        if (!perfilData || perfilErr) {
          await authSignOut();
          return { error: 'Tu cuenta no tiene un perfil configurado. Contacta al administrador.' };
        }
        if (!perfilData.activo) {
          await authSignOut();
          return { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
        }
      }

      // 3. Política de "recordar sesión"
      if (!rememberMe) {
        localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_48H));
      } else {
        localStorage.removeItem(SESSION_EXPIRY_KEY);
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Error al conectar con el servidor.' };
    }
  };

  const signOut = async () => {
    await authSignOut();
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    setSession(null);
    setPerfil(null);
  };

  return { session, perfil, loadingAuth, signIn, signOut };
};
