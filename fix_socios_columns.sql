-- Add missing scoring columns to socios table
ALTER TABLE socios ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS distrito TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS provincia TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS departamento TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS clasificacion_central_riesgo TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS calificacion_interna TEXT;
ALTER TABLE socios ADD COLUMN IF NOT EXISTS tipo_empresa TEXT;

-- Comment for clarification
COMMENT ON COLUMN socios.tipo_empresa IS 'Mapeado para Scoring como "Tamaño empresa"';
