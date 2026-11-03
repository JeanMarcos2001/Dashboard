import { supabase, supabaseAdmin } from '@/config/supabase';
import type { PerfilUsuario, DatosEdicionUsuario } from '@/types';

// ─── Sesión ───────────────────────────────────────────────────────────────────

/** Inicia sesión con email y contraseña. */
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

/** Cierra la sesión activa. */
export const signOut = async () => {
  return await supabase.auth.signOut();
};

/** Obtiene la sesión actual (si existe). */
export const getSession = async () => {
  return await supabase.auth.getSession();
};

// ─── Perfil de usuario ────────────────────────────────────────────────────────

/** Carga el perfil de un usuario desde la tabla perfiles_usuario. */
export const getPerfilUsuario = async (userId: string): Promise<{ data: PerfilUsuario | null; error: any }> => {
  const { data, error } = await supabase
    .from('perfiles_usuario')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as PerfilUsuario | null, error };
};

// ─── Gestión de usuarios (solo Administrador) ─────────────────────────────────

/** Lista todos los perfiles de usuario. Solo accesible para administradores. */
export const getUsuarios = async (): Promise<{ data: PerfilUsuario[]; error: any }> => {
  const { data, error } = await supabase
    .from('perfiles_usuario')
    .select('*, filiales(nombre)')
    .order('created_at', { ascending: false });
  return { data: (data as PerfilUsuario[]) || [], error };
};

/**
 * Crea un usuario de sede.
 * Invoca una función RPC de Supabase para crear el usuario en auth.users
 * y su registro en perfiles_usuario de forma atómica.
 */
export const crearUsuarioSede = async (
  email: string,
  password: string,
  idFilial: number,
  nombreDisplay: string
): Promise<{ error: any }> => {
  if (!supabaseAdmin) {
    return { error: { message: 'Service role key no configurado. Agrega VITE_SUPABASE_SERVICE_ROLE_KEY al .env' } };
  }

  // 1. Crear en Supabase Auth vía GoTrue (aparece en el panel de Authentication)
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre_display: nombreDisplay },
  });
  if (authError) return { error: authError };

  const userId = data.user?.id;
  if (!userId) return { error: { message: 'No se obtuvo el ID del nuevo usuario.' } };

  // 2. Crear perfil en perfiles_usuario
  const { error: perfilError } = await supabase
    .from('perfiles_usuario')
    .insert({ id: userId, rol: 'sede', id_filial: idFilial, nombre_display: nombreDisplay, activo: true });

  if (perfilError) {
    // Revertir: eliminar el usuario de auth si el perfil falló
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: perfilError };
  }

  return { error: null };
};

/**
 * Actualiza el nombre para mostrar y la filial de un usuario de sede.
 * Solo afecta perfiles con rol 'sede'. Si RLS bloquea el cambio, Supabase no devuelve
 * error pero tampoco filas; se trata como error para no mostrar un éxito falso.
 */
export const actualizarUsuarioSede = async (
  userId: string,
  datos: DatosEdicionUsuario
): Promise<{ data: PerfilUsuario | null; error: any }> => {
  const { data, error } = await supabase
    .from('perfiles_usuario')
    .update(datos)
    .eq('id', userId)
    .eq('rol', 'sede')
    .select()
    .maybeSingle();

  if (!error && !data) {
    return { data: null, error: { message: 'No se pudo actualizar el usuario (no existe o no tienes permisos).' } };
  }
  return { data: data as PerfilUsuario | null, error };
};

/**
 * Desactiva un usuario de sede (no lo elimina, solo lo marca como inactivo).
 * El administrador debe ser el llamante.
 */
export const desactivarUsuario = async (userId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('perfiles_usuario')
    .update({ activo: false })
    .eq('id', userId);
  return { error };
};

/**
 * Reactiva un usuario de sede.
 */
export const reactivarUsuario = async (userId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('perfiles_usuario')
    .update({ activo: true })
    .eq('id', userId);
  return { error };
};
