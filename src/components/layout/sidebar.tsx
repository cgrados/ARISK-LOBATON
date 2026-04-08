"use client"

import Link from "next/link"

import { usePathname } from "next/navigation"

import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  LineChart, 
  ShieldCheck, 
  Package2, 
  Search, 
  Bell, 
  ChevronRight,
  Download,
  Gauge
} from 'lucide-react'

interface SidebarProps {
  allowedModules: string[]
}

export function Sidebar({ allowedModules }: SidebarProps) {
  const pathname = usePathname()
  const hasAccess = (moduleId: string) => allowedModules.includes(moduleId)

  const navItems = [
    { id: 'dashboard', icon: Home, href: '/dashboard', label: 'Inicio (v1.1)', color: 'text-blue-500' },
    { id: 'socios', icon: Users, href: '/socios', label: 'Socios', color: 'text-indigo-500' },
    { id: 'solicitudes', icon: Package, href: '/solicitudes', label: 'Solicitudes', color: 'text-blue-600' },
    { id: 'aprobaciones', icon: ShoppingCart, href: '/aprobaciones', label: 'Aprobaciones', color: 'text-purple-500' },
    { id: 'reporteria', icon: FileText, href: '/reporteria', label: 'Reportes', color: 'text-orange-500' },
    { id: 'configuraciones', icon: LineChart, href: '/configuracion/evaluacion', label: 'Configuración', color: 'text-slate-600' },
    { id: 'usuarios', icon: ShieldCheck, href: '/usuarios', label: 'Usuarios', color: 'text-emerald-500' },
  ]


  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-[#f8f9fa] border-r border-slate-200 shadow-sm transition-all print:hidden">

      <div className="flex h-20 items-center px-8 gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
          <Gauge className="h-7 w-7 text-blue-400" />
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">A.RISK V1.0</span>
      </div>





      
      <div className="flex-1 overflow-auto py-6 no-scrollbar">
        <div className="px-8 mb-6">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">General</span>
        </div>

        <nav className="flex flex-col gap-1 px-4">
          {navItems.filter(item => hasAccess(item.id)).map((item) => {
            const isActive = pathname === item.href || (item.id === 'configuraciones' && pathname?.startsWith('/configuracion'))
            
            return (
              <div key={item.id} className="flex flex-col gap-1">
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group border border-transparent ${
                    isActive 
                    ? 'bg-sky-100/50 text-sky-700 shadow-sm border-sky-100' 
                    : 'text-slate-600 hover:bg-white hover:border-slate-100 hover:shadow-sm'
                  }`}
                >
                  <item.icon className={`h-6 w-6 ${isActive ? 'text-sky-600' : item.color} group-hover:scale-110 transition-transform`} />
                  <span className={`text-base font-bold transition-colors ${isActive ? 'text-sky-800' : 'group-hover:text-slate-900'}`}>
                    {item.label}
                  </span>
                  {item.id === 'solicitudes' && (
                    <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">3</span>
                  )}
                </Link>
                
                {item.id === 'configuraciones' && (
                  <div className="flex flex-col gap-1 ml-14 mb-2">
                    <Link 
                      href="/configuracion/credito" 
                      className={`text-sm font-semibold py-1.5 transition-colors ${pathname === '/configuracion/credito' ? 'text-sky-600' : 'text-slate-500 hover:text-sky-600'}`}
                    >
                      Tasas y Productos
                    </Link>
                    <Link 
                      href="/configuracion/empresa" 
                      className={`text-sm font-semibold py-1.5 transition-colors ${pathname === '/configuracion/empresa' ? 'text-sky-600' : 'text-slate-500 hover:text-sky-600'}`}
                    >
                      Datos de Empresa
                    </Link>
                    <Link 
                      href="/configuracion/evaluacion" 
                      className={`text-sm font-semibold py-1.5 transition-colors ${pathname === '/configuracion/evaluacion' ? 'text-sky-600' : 'text-slate-500 hover:text-sky-600'}`}
                    >
                      Motor de Scoring
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

      </div>

      <div className="p-8 mt-auto border-t border-slate-100">
         <button className="flex items-center gap-4 text-slate-500 hover:text-slate-900 transition-all font-semibold text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            FAQ
         </button>
      </div>
    </aside>
  )
}



