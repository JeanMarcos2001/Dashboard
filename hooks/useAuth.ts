import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { getPerfilUsuario, signIn as authSignIn, signOut as authSignOut } from '@/services/auth';
import type { PerfilUsuario } from '@/types';

interface UseAuthReturn {
  session: Session | null;
  perfil: PerfilUsuario | null;
  loadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

/**
 * Hook de autenticación.
 * Escucha cambios de sesión via onAuthStateChange y carga el perfil
 * del usuario desde perfiles_usuario al detectar una sesión activa.
 */
export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial (si ya hay una activa)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data } = await getPerfilUsuario(session.user.id);
        setPerfil(data);
      }
      setLoadingAuth(false);
    });

    // Escuchar cambios de sesión (login, logout, refresco de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data } = await getPerfilUsuario(session.user.id);
          setPerfil(data);
        } else {
          setPerfil(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await authSignIn(email, password);
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    setPerfil(null);
  };

  return { session, perfil, loadingAuth, signIn, signOut };
};
