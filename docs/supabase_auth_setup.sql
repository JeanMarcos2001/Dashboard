-- =============================================================================
-- EduTrack Dashboard — Script de Autenticación y Roles
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- IDEMPOTENTE: se puede ejecutar múltiples veces sin error.
-- =============================================================================

-- ─── 1. Tabla de perfiles de usuario ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.perfiles_usuario (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol            TEXT        NOT NULL CHECK (rol IN ('administrador', 'sede')),
  id_filial      INTEGER     REFERENCES public.filiales(id) ON DELETE SET NULL,
  nombre_display TEXT        NOT NULL,
  activo         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfil_propio_lectura"   ON public.perfiles_usuario;
DROP POLICY IF EXISTS "admin_gestiona_perfiles" ON public.perfiles_usuario;

CREATE POLICY "perfil_propio_lectura" ON public.perfiles_usuario
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admin_gestiona_perfiles" ON public.perfiles_usuario
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.perfiles_usuario p WHERE p.id = auth.uid() AND p.rol = 'administrador')
  );

-- ─── 2. RLS en tabla alumnos ──────────────────────────────────────────────────

ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alumnos_admin_total"  ON public.alumnos;
DROP POLICY IF EXISTS "alumnos_sede_lectura" ON public.alumnos;

CREATE POLICY "alumnos_admin_total" ON public.alumnos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "alumnos_sede_lectura" ON public.alumnos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.perfiles_usuario p WHERE p.id = auth.uid() AND p.rol = 'sede'
      AND (
        EXISTS (SELECT 1 FROM public.citas c WHERE c.id_alumno = alumnos.id AND c.id_filial = p.id_filial)
        OR EXISTS (SELECT 1 FROM public.entrevistas e WHERE e.id_alumno = alumnos.id AND e.id_filial = p.id_filial)
      )
  ));

-- ─── 3. RLS en tabla apoderados ───────────────────────────────────────────────

ALTER TABLE public.apoderados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apoderados_admin_total"  ON public.apoderados;
DROP POLICY IF EXISTS "apoderados_sede_lectura" ON public.apoderados;

CREATE POLICY "apoderados_admin_total" ON public.apoderados FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "apoderados_sede_lectura" ON public.apoderados FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.perfiles_usuario p WHERE p.id = auth.uid() AND p.rol = 'sede'
      AND EXISTS (
        SELECT 1 FROM public.alumnos al WHERE al.id_apoderado = apoderados.id
          AND (
            EXISTS (SELECT 1 FROM public.citas c WHERE c.id_alumno = al.id AND c.id_filial = p.id_filial)
            OR EXISTS (SELECT 1 FROM public.entrevistas e WHERE e.id_alumno = al.id AND e.id_filial = p.id_filial)
          )
      )
  ));

-- ─── 4. RLS en tabla citas ────────────────────────────────────────────────────

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "citas_admin_total"   ON public.citas;
DROP POLICY IF EXISTS "citas_sede_su_filial" ON public.citas;

CREATE POLICY "citas_admin_total" ON public.citas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "citas_sede_su_filial" ON public.citas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'sede' AND id_filial = citas.id_filial));

-- ─── 5. RLS en tabla entrevistas ─────────────────────────────────────────────

ALTER TABLE public.entrevistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entrevistas_admin_total"     ON public.entrevistas;
DROP POLICY IF EXISTS "entrevistas_sede_su_filial"  ON public.entrevistas;

CREATE POLICY "entrevistas_admin_total" ON public.entrevistas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'administrador'));

CREATE POLICY "entrevistas_sede_su_filial" ON public.entrevistas FOR ALL
  USING (EXISTS (SELECT 1 FROM public.perfiles_usuario WHERE id = auth.uid() AND rol = 'sede' AND id_filial = entrevistas.id_filial));

-- ─── 6. Crear el primer administrador ────────────────────────────────────────
-- 1) Ve a Supabase → Authentication → Users → Add User (con email y contraseña).
-- 2) Copia el UUID generado y reemplázalo abajo, luego ejecuta solo este INSERT.

-- INSERT INTO public.perfiles_usuario (id, rol, id_filial, nombre_display, activo)
-- VALUES ('REEMPLAZA-CON-UUID', 'administrador', NULL, 'Administrador Principal', TRUE);

-- ─── 7. Función RPC: crear_usuario_sede ──────────────────────────────────────
-- Permite al administrador crear usuarios de sede desde el dashboard.
-- Crea el user en auth.users y su perfil de forma atómica.
-- Requiere permisos de superusuario (postgres) — ejecutar en SQL Editor de Supabase.

CREATE OR REPLACE FUNCTION public.crear_usuario_sede(
  p_email          TEXT,
  p_password       TEXT,
  p_id_filial      INTEGER,
  p_nombre_display TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_rol  TEXT;
  v_new_user_id UUID;
BEGIN
  -- Solo el administrador puede invocar esta función
  SELECT rol INTO v_caller_rol
    FROM public.perfiles_usuario
   WHERE id = auth.uid();

  IF v_caller_rol IS DISTINCT FROM 'administrador' THEN
    RAISE EXCEPTION 'Acceso denegado: solo el administrador puede crear usuarios.';
  END IF;

  -- Verificar que el correo no exista ya
  SELECT id INTO v_new_user_id
    FROM auth.users
   WHERE email = p_email
   LIMIT 1;

  IF v_new_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Ya existe un usuario con ese correo electrónico.';
  END IF;

  -- Crear el usuario en auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  )
  VALUES (
    gen_random_uuid(),
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre_display', p_nombre_display),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO v_new_user_id;

  -- Registrar el perfil de sede
  INSERT INTO public.perfiles_usuario (id, rol, id_filial, nombre_display, activo)
  VALUES (v_new_user_id, 'sede', p_id_filial, p_nombre_display, TRUE);
END;
$$;

-- Permitir que usuarios autenticados invoquen la función
-- (la validación interna garantiza que solo admins la usen)
GRANT EXECUTE ON FUNCTION public.crear_usuario_sede(TEXT, TEXT, INTEGER, TEXT)
  TO authenticated;
