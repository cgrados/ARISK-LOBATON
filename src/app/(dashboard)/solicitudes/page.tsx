import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getSolicitudes } from '@/app/actions/solicitudes'
import { createClient } from '@/lib/supabase/server'
import { DeleteSolicitudButton } from '@/components/solicitudes/DeleteSolicitudButton'
import { formatCurrency } from '@/lib/utils/format'


export const dynamic = 'force-dynamic'

const estadoBadge = (estado: string) => {
  const map: Record<string, string> = {
    BORRADOR: 'bg-gray-100 text-gray-700 ring-gray-300',
    EN_REVISION: 'bg-amber-50 text-amber-700 ring-amber-300',
    OBSERVADO: 'bg-orange-50 text-orange-700 ring-orange-300',
    APROBADO: 'bg-green-50 text-green-700 ring-green-300',
    DENEGADO: 'bg-red-50 text-red-700 ring-red-300',
  }
  return map[estado] || 'bg-gray-100 text-gray-700 ring-gray-300'
}

export default async function SolicitudesPage() {
  const solicitudes = await getSolicitudes()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  const isPrivileged = profile?.role === 'SUPER_ADMIN' || profile?.role === 'SUPERVISOR'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Solicitudes de Crédito</h1>
        <Link href="/solicitudes/nueva">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">N°</TableHead>
              <TableHead>Socio</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center">Plazo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Analista</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  No hay solicitudes registradas aún. Crea la primera con el botón de arriba.
                </TableCell>
              </TableRow>
            ) : (
              solicitudes.map((sol: any) => (
                <TableRow key={sol.id}>
                  <TableCell className="font-bold text-blue-700">
                    {String(sol.correlativo).padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-medium">{sol.socios?.nombres_apellidos}</TableCell>
                  <TableCell className="text-sm">{sol.socios?.dni}</TableCell>
                  <TableCell className="text-sm">{sol.producto || '-'}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(sol.monto_solicitado)}</TableCell>
                  <TableCell className="text-center">{sol.plazo_meses} m</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${estadoBadge(sol.estado)}`}>
                      {sol.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{sol.analista?.full_name || '-'}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Link href={`/solicitudes/${sol.id}`}>
                      <Button variant="ghost" size="icon" title="Ver Detalle">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    {(isPrivileged || sol.estado === 'EN_REVISION') && (
                      <DeleteSolicitudButton id={sol.id} numero={String(sol.correlativo).padStart(3, '0')} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
