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
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#161065]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[#161065] tracking-tight">Gestión de Socios</h1>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Directorio Centralizado de Clientes</p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
          {role === 'SUPER_ADMIN' && (
            <Link href="/socios/transferencia">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold uppercase text-[10px] tracking-widest h-12 px-6">
                <ArrowRightLeft className="mr-3 h-4 w-4 text-[#161065]" />
                Transferir Cartera
              </Button>
            </Link>
          )}
          <ExportExcelButton data={filtered} />
          <UploadExcelDialog />
          <Link href="/socios/nuevo">
            <Button className="bg-[#161065] text-white hover:bg-[#1a1f7a] rounded-xl font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8 shadow-xl shadow-navy/20">
              <Plus className="mr-3 h-4 w-4" />
              Nuevo Socio
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por DNI, nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl focus:ring-[#161065]/10 focus:border-[#161065]/40 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-transparent overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6 px-6">DNI</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Nombres y Apellidos</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Teléfono</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Ingreso Bruto</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Central Riesgos</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Registrado por</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-6 px-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell colSpan={7} className="text-center py-20 text-slate-300 text-xs font-bold uppercase tracking-widest">
                    {search ? `No se encontraron resultados para "${search}"` : 'No hay socios registrados.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((socio) => (
                  <TableRow key={socio.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                    <TableCell className="font-black text-[#161065] px-6 py-5">{socio.dni}</TableCell>
                    <TableCell className="font-bold text-slate-700">{socio.nombres_apellidos}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{socio.telefono}</TableCell>
                    <TableCell className="text-[#161065] font-black">{formatCurrency(socio.ingreso_bruto_mensual)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700 border border-blue-100 uppercase tracking-widest">
                        {socio.clasificacion_central_riesgo || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{socio.registrado_por || 'N/A'}</TableCell>
                    <TableCell className="text-right px-6 py-5">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/socios/${socio.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-[#161065] hover:text-white text-slate-400 transition-all">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                          onClick={() => handleDelete(socio.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-8 flex justify-end">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
             EXPOSICIÓN: {filtered.length} DE {socios.length} ENTIDADES
           </p>
        </div>
      </div>
    </div>


  )
}
