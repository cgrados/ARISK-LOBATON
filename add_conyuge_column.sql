-- Add spouse data column to solicitudes table
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS datos_conyuge JSONB DEFAULT '{}'::jsonb;
