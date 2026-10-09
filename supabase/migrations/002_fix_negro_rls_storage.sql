-- ============================================
-- Black Belt System - Fixes
-- Ejecutar en: Supabase SQL Editor
-- 1. Agrega 'negro' al enum color_cinturon
-- 2. Corrige recursión infinita en políticas RLS de usuarios
-- 3. Hace público el bucket de fotos y agrega políticas UPDATE/DELETE
-- ============================================

-- 1. Agregar 'negro' al enum (permite cinta negra en ascensos)
ALTER TYPE color_cinturon ADD VALUE IF NOT EXISTS 'negro';

-- 2. Funciones de verificación de rol (SECURITY DEFINER evita recursión RLS)
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.es_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
  );
$$;

GRANT EXECUTE ON FUNCTION public.es_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_instructor() TO authenticated;

-- 3. Reescribir políticas de usuarios sin recursión
DROP POLICY IF EXISTS "admin_usuarios" ON usuarios;
CREATE POLICY "admin_usuarios" ON usuarios
  FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS "ver_usuarios" ON usuarios;
CREATE POLICY "ver_usuarios" ON usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Reescribir políticas de alumnos con la función (antes subquery recursiva)
DROP POLICY IF EXISTS "editar_alumnos" ON alumnos;
CREATE POLICY "editar_alumnos" ON alumnos
  FOR ALL USING (public.es_instructor()) WITH CHECK (public.es_instructor());

DROP POLICY IF EXISTS "ver_alumnos" ON alumnos;
CREATE POLICY "ver_alumnos" ON alumnos
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Reescribir políticas de asistencias y eventos
DROP POLICY IF EXISTS "registrar_asistencias" ON asistencias;
CREATE POLICY "registrar_asistencias" ON asistencias
  FOR INSERT WITH CHECK (public.es_instructor());

DROP POLICY IF EXISTS "ver_asistencias" ON asistencias;
CREATE POLICY "ver_asistencias" ON asistencias
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "registrar_eventos" ON eventos_progreso;
CREATE POLICY "registrar_eventos" ON eventos_progreso
  FOR INSERT WITH CHECK (public.es_instructor());

DROP POLICY IF EXISTS "ver_eventos" ON eventos_progreso;
CREATE POLICY "ver_eventos" ON eventos_progreso
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Bucket público para que getPublicUrl() funcione en las fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-alumnos', 'fotos-alumnos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Políticas completas de storage (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "ver_fotos" ON storage.objects;
CREATE POLICY "ver_fotos" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos-alumnos');

DROP POLICY IF EXISTS "subir_fotos" ON storage.objects;
CREATE POLICY "subir_fotos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotos-alumnos' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "actualizar_fotos" ON storage.objects;
CREATE POLICY "actualizar_fotos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'fotos-alumnos' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "eliminar_fotos" ON storage.objects;
CREATE POLICY "eliminar_fotos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'fotos-alumnos' AND auth.role() = 'authenticated'
  );