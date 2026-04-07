import { ReactNode } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fetch user permissions ONCE here, pass to Sidebar as props.
  // This eliminates 2 redundant Supabase calls that Sidebar used to make.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let allowedModules: string[] = ['dashboard', 'reporteria']
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('modules_access')
      .eq('id', user.id)
      .single()
    
    if (profile?.modules_access && Array.isArray(profile.modules_access)) {
      allowedModules = profile.modules_access.includes('reporteria')
        ? profile.modules_access
        : [...profile.modules_access, 'reporteria']
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] print:h-auto print:overflow-visible print:block">
      <Sidebar allowedModules={allowedModules} />
      <div className="flex flex-1 flex-col overflow-hidden ml-72 print:m-0 print:p-0 print:ml-0 print:overflow-visible print:h-auto print:block">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          {children}
        </main>
      </div>

    </div>
  )



}
