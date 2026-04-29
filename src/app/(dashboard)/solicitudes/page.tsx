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
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#161065]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[#161065] tracking-tight">Solicitudes de Crédito</h1>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Registro Histórico y Operaciones</p>
        </div>
        <div className="relative z-10">
          <Link href="/solicitudes/nueva">
            <Button className="bg-[#161065] text-white hover:bg-[#1a1f7a] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] h-14 px-8 shadow-xl shadow-navy/20">
              <Plus className="mr-3 h-5 w-5" />
              Nueva Solicitud
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="rounded-3xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="w-20 text-[10px] font-black text-slate-400 uppercase tracking-widest py-6 px-6">N°</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Socio</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">DNI</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Producto</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Monto</TableHead>
                <TableHead className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Plazo</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Estado</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-6">Analista</TableHead>
                <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest py-6 px-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-20 text-slate-300 text-xs font-bold uppercase tracking-widest">
                    No hay solicitudes registradas aún.
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((sol: any) => (
                  <TableRow key={sol.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                    <TableCell className="font-black text-[#161065] px-6 py-5">
                      {String(sol.correlativo).padStart(3, '0')}
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">{sol.socios?.nombres_apellidos}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{sol.socios?.dni}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{sol.producto || '-'}</TableCell>
                    <TableCell className="text-right font-black text-[#161065]">{formatCurrency(sol.monto_solicitado)}</TableCell>
                    <TableCell className="text-center font-bold text-slate-500">{sol.plazo_meses} m</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${estadoBadge(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{sol.analista?.full_name || '-'}</TableCell>
                    <TableCell className="text-right px-6 py-5">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/solicitudes/${sol.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-[#161065] hover:text-white text-slate-400 transition-all">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(isPrivileged || sol.estado === 'EN_REVISION') && (
                          <DeleteSolicitudButton id={sol.id} numero={String(sol.correlativo).padStart(3, '0')} />
                        )}
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
             CARTERA ACTIVA: {solicitudes.length} SOLICITUDES
           </p>
        </div>
      </div>
    </div>
  )
}
