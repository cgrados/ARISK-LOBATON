'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'

import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Loader2,
  ExternalLink,
  User,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react'
import { updateSolicitudStatus } from '@/app/actions/solicitudes'

interface ApprovalsListProps {
  solicitudes: any[]
}

export function ApprovalsList({ solicitudes: initialSolicitudes }: ApprovalsListProps) {
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAction = async (id: string, newStatus: 'APROBADO' | 'OBSERVADO' | 'DENEGADO') => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return

    setProcessingId(id)
    try {
      const result = await updateSolicitudStatus(id, newStatus)
      if (result.success) {
        setSolicitudes(prev => prev.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado de la solicitud. Verifique los permisos o el estado de la base de datos.')
    } finally {
      setProcessingId(null)
    }
  }

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-16 text-center shadow-xl shadow-slate-100 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sin Pendientes</h3>
        <p className="text-slate-400 mt-2 font-medium">No hay solicitudes en estado 'PRESENTADA' para revisar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {solicitudes.map((solicitud) => (
        <div 
          key={solicitud.id}
          className="bg-white rounded-[1.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-[#4169E1]/20 transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            
            {/* Numero y Estado */}
            <div className="flex-shrink-0">
               <div className="w-16 h-16 bg-[#4169E1]/10 rounded-2xl flex flex-col items-center justify-center text-[#4169E1] font-black border border-[#4169E1]/10">
                  <span className="text-[10px] uppercase leading-none opacity-60">SOL</span>
                  <span className="text-xl leading-none mt-1">{solicitud.correlativo || '---'}</span>
               </div>
            </div>

            {/* Datos Principales */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-4 lg:pb-0">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                     <User className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Socio</p>
                     <p className="text-sm font-black text-slate-800 line-clamp-1">{solicitud.socios?.nombres_apellidos}</p>
                     <p className="text-[10px] font-bold text-[#4169E1] mt-0.5">{solicitud.socios?.dni}</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                     <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto</p>
                     <p className="text-sm font-black text-slate-800">{formatCurrency(parseFloat(solicitud.monto_solicitado))}</p>

                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                     <Package className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producto</p>
                     <p className="text-sm font-black text-slate-800">{solicitud.producto}</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                     <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analista</p>
                     <p className="text-sm font-black text-slate-800 line-clamp-1">{solicitud.analista?.full_name}</p>
                  </div>
               </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-3 lg:border-l lg:pl-6 border-slate-100">
               <a 
                 href={`/solicitudes/${solicitud.id}`}
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-[#4169E1] transition-all shadow-lg shadow-black/5"
               >
                 <Eye className="w-4 h-4" /> Revisar
               </a>

               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAction(solicitud.id, 'APROBADO')}
                    disabled={processingId === solicitud.id}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#32CD32]/10 text-[#32CD32] hover:bg-[#32CD32] hover:text-white transition-all disabled:opacity-50"
                    title="Aprobar"
                  >
                    {processingId === solicitud.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => handleAction(solicitud.id, 'OBSERVADO')}
                    disabled={processingId === solicitud.id}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FFBF00]/10 text-[#FFBF00] hover:bg-[#FFBF00] hover:text-white transition-all disabled:opacity-50"
                    title="Observar"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => handleAction(solicitud.id, 'DENEGADO')}
                    disabled={processingId === solicitud.id}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500] hover:text-white transition-all disabled:opacity-50"
                    title="Rechazar"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
               </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  )
}
