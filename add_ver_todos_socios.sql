-- Ejecutar este SQL en el editor de Supabase para habilitar la nueva funcionalidad
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ver_todos_socios BOOLEAN DEFAULT FALSE;
