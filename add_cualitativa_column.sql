-- Add qualitative data column to solicitudes
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS datos_cualitativos JSONB DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN solicitudes.datos_cualitativos IS 'Stores qualitative evaluation metrics and scoring results for Titular, Spouse and Guarantors';
