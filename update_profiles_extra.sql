-- Ejecuta esto en el editor SQL de Supabase para añadir los nuevos campos al perfil de usuario
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dni TEXT,
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS agencia TEXT,
ADD COLUMN IF NOT EXISTS telefono TEXT;
