-- Add datos_avales column to solicitudes table
ALTER TABLE solicitudes
ADD COLUMN IF NOT EXISTS datos_avales JSONB DEFAULT '[]'::jsonb;
