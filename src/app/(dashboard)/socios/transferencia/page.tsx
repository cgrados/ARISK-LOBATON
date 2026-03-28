import { getAllUsers } from '@/app/actions/users'
import { TransferenciaForm } from '@/components/forms/TransferenciaForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TransferenciaCarteraPage() {
  const users = await getAllUsers()

  if (users.length === 0) {
    // If the array is empty, the user is likely not a super admin (handled by the action)
    redirect('/socios')
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transferencia de Cartera</h1>
        <p className="text-muted-foreground">
          Reasignación de titulares de cuentas de socios.
        </p>
      </div>

      <TransferenciaForm users={users} />
    </div>
  )
}
