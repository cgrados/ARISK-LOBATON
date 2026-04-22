"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash, Edit, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deleteSocio } from '@/app/actions/socios'
import { formatCurrency } from '@/lib/utils/format'
import { UploadExcelDialog } from '@/components/UploadExcelDialog'
import { ExportExcelButton } from '@/components/ExportExcelButton'
import { ArrowRightLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SociosTableProps {
  socios: any[]
  role: string
}

export function SociosTable({ socios, role }: SociosTableProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = socios.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.dni?.toLowerCase().includes(q) ||
      s.nombres_apellidos?.toLowerCase().includes(q) ||
      s.telefono?.toLowerCase().includes(q)
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este socio?')) return
    await deleteSocio(id)
    router.refresh()
  }

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
          <ExportExcelButton data={filtered} />
          <UploadExcelDialog />
          <Link href="/socios/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Socio
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por DNI, nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {search ? `No se encontraron resultados para "${search}"` : 'No hay socios registrados.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((socio) => (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">{socio.dni}</TableCell>
                  <TableCell>{socio.nombres_apellidos}</TableCell>
                  <TableCell>{socio.telefono}</TableCell>
                  <TableCell>{formatCurrency(socio.ingreso_bruto_mensual)}</TableCell>
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
                    <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(socio.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-400 text-right">{filtered.length} de {socios.length} socios</p>
    </div>
  )
}
