import Link from 'next/link'
import { Plus, Trash, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getSocios, deleteSocio } from '@/app/actions/socios'
import { UploadExcelDialog } from '@/components/UploadExcelDialog'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { createClient } from '@/lib/supabase/server'
import { ArrowRightLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = 'USER'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role || 'USER'
  }

  const socios = await getSocios()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Socios</h1>
        <div className="flex items-center gap-2">
          {role === 'SUPER_ADMIN' && (
            <Link href="/socios/transferencia">
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transferir Cartera
              </Button>
            </Link>
          )}
          <ExportExcelButton data={socios} />
          <UploadExcelDialog />
          <Link href="/socios/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Socio
            </Button>
          </Link>
        </div>
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DNI</TableHead>
              <TableHead>Nombres y Apellidos</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Ingreso Bruto</TableHead>
              <TableHead>Central Riesgos</TableHead>
              <TableHead>Registrado por</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {socios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No hay socios registrados.
                </TableCell>
              </TableRow>
            ) : (
              socios.map((socio) => (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">{socio.dni}</TableCell>
                  <TableCell>{socio.nombres_apellidos}</TableCell>
                  <TableCell>{socio.telefono}</TableCell>
                  <TableCell>S/ {socio.ingreso_bruto_mensual?.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {socio.clasificacion_central_riesgo || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{socio.registrado_por || 'N/A'}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Link href={`/socios/${socio.id}`}>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deleteSocio(socio.id)
                    }}>
                      <Button variant="ghost" size="icon" title="Eliminar" type="submit">
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </form>
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
