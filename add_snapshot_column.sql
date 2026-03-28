-- Add datos_socio_snapshot column to solicitudes table
ALTER TABLE solicitudes
ADD COLUMN IF NOT EXISTS datos_socio_snapshot JSONB DEFAULT '{}'::jsonb;
