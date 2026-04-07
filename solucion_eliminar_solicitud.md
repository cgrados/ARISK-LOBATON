# Problema de Eliminación de Solicitudes

## Diagnóstico
El sistema no permite eliminar solicitudes porque, aunque existe el botón en la interfaz, la base de datos (Supabase) tiene habilitado **RLS (Row Level Security)** pero no cuenta con una política que permita la operación `DELETE` para el rol de Analista o Administrador.

## Causa Técnica
En el archivo `00000000000000_schema.sql` se definen las siguientes políticas para la tabla `solicitudes`:
- `SELECT`: Permitido para dueños y admins.
- `INSERT`: Permitido para dueños.
- `UPDATE`: Permitido para dueños y admins.
- **`DELETE`: No definido (Bloqueado por defecto).**

## Solución
Se debe ejecutar el siguiente comando SQL en el editor de Supabase para habilitar la eliminación de solicitudes:

```sql
-- Permitir que los analistas eliminen sus propias solicitudes y que los administradores eliminen cualquiera
CREATE POLICY "Analistas pueden eliminar sus propias solicitudes" 
ON solicitudes FOR DELETE
USING (
  auth.uid() = analista_id 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')
  )
);
```

> [!IMPORTANT]
> Recuerda que el sistema solo permite eliminar solicitudes con estado `EN_REVISION`. Si intentas eliminar una solicitud `PRESENTADA`, el botón no aparecerá o el sistema lo bloqueará por regla de negocio.
