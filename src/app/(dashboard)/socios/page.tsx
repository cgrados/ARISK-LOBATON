import { getSocios } from '@/app/actions/socios'
import { createClient } from '@/lib/supabase/server'
import { SociosTable } from '@/components/socios/SociosTable'

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

  return <SociosTable socios={socios} role={role} />
}
