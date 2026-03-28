import { getSystemSetting } from '@/app/actions/settings'
import { SolicitudForm } from '@/components/forms/SolicitudForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function NuevaSolicitudPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const creditConfig = await getSystemSetting('credit_conditions')
  const scoringConfig = await getSystemSetting('scoring_rules')

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nueva Solicitud de Préstamo</h1>
          <p className="text-muted-foreground">Módulo de Ingreso de Datos Financieros</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-500">Analista Responsable</p>
          <p className="font-semibold">{profile?.full_name}</p>
        </div>
      </div>

      <SolicitudForm 
        creditConfig={creditConfig || {}} 
        scoringConfig={scoringConfig || {}}
      />
    </div>
  )
}
