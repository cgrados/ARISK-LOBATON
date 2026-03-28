import { getAllUsers } from '@/app/actions/users'
import { UsersManagementForm } from '@/components/forms/UsersManagementForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSystemSetting } from '@/app/actions/settings'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 mt-10">
        <h2 className="text-xl font-bold">ACCESO DENEGADO</h2>
        <p>Solo los usuarios Super Admin pueden ver y gestionar otros usuarios.</p>
      </div>
    )
  }

  const users = await getAllUsers()
  const companyInfo = await getSystemSetting('company_info')
  const agencias = companyInfo?.agencias || []

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Control de Usuarios y Accesos</h1>
        <p className="text-muted-foreground">
          Gestione los analistas, supervisores y administradores de la plataforma. Asigne a mano por nivel de seguridad los módulos que pueden visualizar.
        </p>
      </div>

      <UsersManagementForm users={users} companyAgencias={agencias} />
    </div>
  )
}
