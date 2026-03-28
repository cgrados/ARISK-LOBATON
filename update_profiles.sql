-- Ejecuta esto en tu editor SQL de Supabase para añadir los permisos dinámicos a los perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS modules_access JSONB DEFAULT '["dashboard"]'::jsonb;
