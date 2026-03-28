import { getSolicitud, getPresupuesto } from '@/app/actions/solicitudes'
import { getSystemSetting } from '@/app/actions/settings'
import { SolicitudForm } from '@/components/forms/SolicitudForm'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditSolicitudPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const solicitud = await getSolicitud(id)
  if (!solicitud) notFound()

  // Authorization check (optional but recommended)
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role === 'ANALISTA' && solicitud.analista_id !== user.id) {
    redirect('/solicitudes')
  }

  const creditConfig = await getSystemSetting('credit_conditions')
  const scoringConfig = await getSystemSetting('scoring_rules')
  
  // Fetch budget if it exists
  const presupuesto = await getPresupuesto(id)

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Detalle de Solicitud N° {String(solicitud.correlativo).padStart(3, '0')}
          </h1>
          <p className="text-muted-foreground italic">Vista de Edición / Evaluación</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-500">Analista Responsable</p>
          <p className="font-semibold text-blue-700">{solicitud.analista?.full_name || 'Sin asignar'}</p>
        </div>
      </div>

      <SolicitudForm 
        creditConfig={creditConfig || {}} 
        scoringConfig={scoringConfig || {}}
        initialData={solicitud} 
        budgetData={presupuesto} 
      />
    </div>
  )
}
