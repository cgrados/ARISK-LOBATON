-- Add summary data column to solicitudes for Checklist and Exceptions
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS datos_resumen JSONB DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN solicitudes.datos_resumen IS 'Stores final summary data, including the Credit File Checklist and exception requests';
