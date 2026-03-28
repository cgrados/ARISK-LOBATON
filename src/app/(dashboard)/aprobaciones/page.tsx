import { ShoppingCart, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSolicitudesPresentadas } from '@/app/actions/solicitudes'
import { ApprovalsList } from '@/components/approvals/ApprovalsList'

export const dynamic = 'force-dynamic'

export default async function AprobacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only certain roles can access this module
  if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'SUPERVISOR' && profile?.role !== 'APROBADOR') {
    redirect('/dashboard')
  }

  const solicitudes = await getSolicitudesPresentadas()

  return (
    <div className="flex flex-col gap-8 p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#4169E1] rounded-xl flex items-center justify-center shadow-lg shadow-[#4169E1]/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Módulo de Aprobaciones</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Revisión y autorización de solicitudes presentadas.</p>
        </div>

        {/* Mini Stats for context */}
        <div className="flex items-center gap-4">
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#FF4500]" />
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Pendientes</p>
                 <p className="text-lg font-black text-slate-800 leading-none mt-1">{solicitudes.length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full"></div>

      {/* Main Content: The Interactive List */}
      <div className="min-h-[400px]">
        <ApprovalsList solicitudes={solicitudes} />
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 flex items-start gap-4">
         <AlertCircle className="w-6 h-6 text-[#4169E1] flex-shrink-0 mt-0.5" />
         <div>
            <h4 className="text-sm font-black text-[#4169E1] uppercase tracking-wider">Aviso de Seguridad</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
               Como usuario con privilegios de **{profile.role}**, tus acciones de aprobación son finales y vinculantes. 
               Asegúrate de revisar todos los documentos adjuntos y la evaluación del analista antes de proceder.
            </p>
         </div>
      </div>

    </div>
  )
}
