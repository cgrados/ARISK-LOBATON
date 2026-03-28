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
    <div className="flex min-h-screen w-full bg-slate-50/50">
      <Sidebar allowedModules={allowedModules} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
