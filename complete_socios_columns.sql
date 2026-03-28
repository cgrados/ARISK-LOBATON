-- COMPREHENSIVE MIGRATION TO ADD ALL SCORING COLUMNS TO THE SOCIOS TABLE
-- This ensures that when a Spouse or Guarantor is searched, all their demographic data is retrieved.

ALTER TABLE socios ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS instruccion TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS profesion_oficio TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS nro_dependientes INTEGER;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS condicion_vivienda TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS fecha_ingreso_laboral DATE;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS actividad_economica TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS calificacion_interna TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS tipo_empresa TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS clasificacion_central_riesgo TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS aportes_totales DECIMAL(10,2);
ALTER TABLE socios ADD COLUMN IF NOT EXISTS ingreso_bruto_mensual DECIMAL(10,2);

-- Also ensuring location columns exist
ALTER TABLE socios ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS distrito TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS provincia TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS departamento TEXT;

-- Verify the columns exist for data synchronization
COMMENT ON TABLE socios IS 'Tabla de socios extendida con campos para Scoring automático';
