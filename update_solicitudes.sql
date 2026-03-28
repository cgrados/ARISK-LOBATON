-- Ejecuta esto en SUPABASE SQL EDITOR para preparar la tabla de solicitudes
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS producto TEXT,
ADD COLUMN IF NOT EXISTS datos_patrimoniales JSONB DEFAULT '{}'::jsonb;
