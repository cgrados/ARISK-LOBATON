-- CONSOLIDATED SCHEMA UPDATE FOR ARISK CREDIT EVALUATION
-- Run this in your Supabase SQL Editor

-- 1. Add missing state to the enum (if exists) or just allow the string
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'solicitud_estado') THEN
        -- If enum doesn't exist, we assume it's a text column with check constraint
        ALTER TABLE solicitudes DROP CONSTRAINT IF EXISTS solicitudes_estado_check;
        ALTER TABLE solicitudes ADD CONSTRAINT solicitudes_estado_check CHECK (estado IN ('BORRADOR', 'EN_REVISION', 'PRESENTADA', 'APROBADO', 'DENEGADO', 'OBSERVADO'));
    ELSE
        -- If it is an enum, add the value if missing
        ALTER TYPE solicitud_estado ADD VALUE IF NOT EXISTS 'PRESENTADA';
        ALTER TYPE solicitud_estado ADD VALUE IF NOT EXISTS 'OBSERVADO';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 2. Add all necessary JSONB and TEXT columns to solicitudes
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS clasificacion_override TEXT DEFAULT 'Normal',
ADD COLUMN IF NOT EXISTS datos_patrimoniales JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS datos_socio_snapshot JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS datos_avales JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS datos_conyuge JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS datos_cualitativos JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS datos_resumen JSONB DEFAULT '{}';

-- 3. Ensure the search path is correct for PostgREST to see changes immediately
NOTIFY pgrst, 'reload schema';
