-- ============================================
-- Black Belt System - Schema inicial
-- Ejecutar en: Supabase SQL Editor
-- ============================================

-- 1. Crear enums
CREATE TYPE color_cinturon AS ENUM ('blanco', 'azul', 'violeta', 'marron');
CREATE TYPE rol_usuario AS ENUM ('admin', 'instructor');
CREATE TYPE tipo_evento AS ENUM ('grado', 'competencia', 'seminario');

-- 2. Tabla usuarios (ligada a Supabase Auth)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'instructor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla alumnos
CREATE TABLE alumnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  identificacion TEXT NOT NULL UNIQUE,
  celular TEXT,
  email TEXT,
  eps TEXT,
  foto_url TEXT,
  color_cinturon color_cinturon NOT NULL DEFAULT 'blanco',
  grado INT NOT NULL DEFAULT 1 CHECK (grado >= 1 AND grado <= 4),
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla asistencias
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME,
  hora_salida TIME,
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla eventos_progreso
CREATE TABLE eventos_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion TEXT NOT NULL,
  tipo tipo_evento NOT NULL,
  registrado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Índices para búsquedas rápidas
CREATE INDEX idx_alumnos_identificacion ON alumnos(identificacion);
CREATE INDEX idx_alumnos_color_grado ON alumnos(color_cinturon, grado);
CREATE INDEX idx_asistencias_alumno ON asistencias(alumno_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_eventos_alumno ON eventos_progreso(alumno_id);

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para alumnos
CREATE TRIGGER trigger_actualizar_alumnos
  BEFORE UPDATE ON alumnos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- 9. Storage: bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-alumnos', 'fotos-alumnos', false);

-- 10. RLS (Row Level Security) - Básico
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_progreso ENABLE ROW LEVEL SECURITY;

-- Politica: cualquier usuario autenticado puede ver alumnos
CREATE POLICY "ver_alumnos" ON alumnos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politica: admin e instructors pueden editar alumnos
CREATE POLICY "editar_alumnos" ON alumnos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
  );

-- Politica: ver asistencias
CREATE POLICY "ver_asistencias" ON asistencias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politica: registrar asistencias
CREATE POLICY "registrar_asistencias" ON asistencias
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
  );

-- Politica: ver eventos
CREATE POLICY "ver_eventos" ON eventos_progreso
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politica: registrar eventos
CREATE POLICY "registrar_eventos" ON eventos_progreso
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
  );

-- Politica: ver usuarios
CREATE POLICY "ver_usuarios" ON usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politica: solo admin puede gestionar usuarios
CREATE POLICY "admin_usuarios" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Politica: storage fotos
CREATE POLICY "ver_fotos" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos-alumnos' AND auth.role() = 'authenticated');

CREATE POLICY "subir_fotos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fotos-alumnos' AND auth.role() = 'authenticated');
