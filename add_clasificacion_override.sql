-- Add clasificacion_override column to solicitudes table
-- This stores the manual classification (Condición) selected by the analyst
ALTER TABLE solicitudes
ADD COLUMN IF NOT EXISTS clasificacion_override TEXT DEFAULT 'Normal';

-- Comment for documentation
COMMENT ON COLUMN solicitudes.clasificacion_override IS 'Manual classification override for interest rate determination (Normal, AA, A, B, C, D)';
