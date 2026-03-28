-- Fix RLS Policies for solicitudes
-- Allow ANALISTA to insert their own solicitudes
DROP POLICY IF EXISTS "Analistas pueden insertar solicitudes" ON solicitudes;
CREATE POLICY "Analistas pueden insertar solicitudes" 
ON solicitudes FOR INSERT 
WITH CHECK (auth.uid() = analista_id);

-- Allow ANALISTA to update their own solicitudes
DROP POLICY IF EXISTS "Analistas pueden actualizar solicitudes" ON solicitudes;
CREATE POLICY "Analistas pueden actualizar solicitudes" 
ON solicitudes FOR UPDATE
USING (auth.uid() = analista_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')));

-- Ensure SELECT policy is inclusive
DROP POLICY IF EXISTS "Analistas ven sus propias solicitudes" ON solicitudes;
CREATE POLICY "Analistas ven sus propias solicitudes" 
ON solicitudes FOR SELECT 
USING (auth.uid() = analista_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')));
