-- Add unique constraint to allow upsert by solicitud_id
ALTER TABLE presupuestos ADD CONSTRAINT unique_presupuesto_solicitud UNIQUE (solicitud_id);

-- Enable RLS for presupuestos
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

-- Allow analysts to manage budgets for their own applications
CREATE POLICY "Analistas pueden gestionar sus presupuestos" 
ON presupuestos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM solicitudes s 
    WHERE s.id = presupuestos.solicitud_id 
    AND (s.analista_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')))
  )
);
