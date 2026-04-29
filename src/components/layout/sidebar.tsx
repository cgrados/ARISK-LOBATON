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
  solicitudesCount?: number | null
}

export function Sidebar({ allowedModules, solicitudesCount }: SidebarProps) {
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
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col bg-[#161065] border-r border-white/10 shadow-2xl shadow-black/50 transition-all print:hidden">

      <div className="flex h-24 items-center px-8 gap-4 border-b border-white/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffcc00] to-[#b28f00] shadow-lg shadow-gold/20 animate-pulse">
          <Gauge className="h-7 w-7 text-[#161065]" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white leading-none">A.RISK</span>
          <span className="text-[10px] font-bold text-[#ffcc00] uppercase tracking-[0.2em] mt-1">Enterprise ERM</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-8 no-scrollbar">
        <div className="px-8 mb-6 flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Navigation</span>
           <div className="h-px flex-1 ml-4 bg-white/5"></div>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {navItems.filter(item => hasAccess(item.id)).map((item) => {
            const isActive = pathname === item.href || (item.id === 'configuraciones' && pathname?.startsWith('/configuracion'))
            
            return (
              <div key={item.id} className="flex flex-col gap-1">
                <Link 
                   href={item.href} 
                   className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group border ${
                     isActive 
                     ? 'bg-[#ffcc00] text-[#161065] shadow-xl shadow-black/50 border-[#ffcc00]' 
                     : 'text-white/50 hover:bg-white/5 hover:text-white border-transparent'
                   }`}
                >
                  <item.icon className={`h-6 w-6 ${isActive ? 'text-[#161065]' : 'text-[#ffcc00]'} group-hover:scale-110 transition-transform`} />
                  <span className={`text-sm font-black transition-colors ${isActive ? 'text-[#161065]' : 'group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  {item.id === 'solicitudes' && solicitudesCount !== undefined && solicitudesCount !== null && solicitudesCount > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#161065] text-[#ffcc00]' : 'bg-[#ffcc00] text-[#161065]'}`}>
                      {solicitudesCount}
                    </span>
                  )}
                </Link>
                
                {item.id === 'configuraciones' && isActive && (
                  <div className="flex flex-col gap-1 ml-14 my-2 border-l border-white/10 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Link 
                      href="/configuracion/credito" 
                      className={`text-xs font-bold py-2 transition-colors ${pathname === '/configuracion/credito' ? 'text-[#ffcc00]' : 'text-white/50 hover:text-[#ffcc00]'}`}
                    >
                      TASAS Y PRODUCTOS
                    </Link>
                    <Link 
                      href="/configuracion/empresa" 
                      className={`text-xs font-bold py-2 transition-colors ${pathname === '/configuracion/empresa' ? 'text-[#ffcc00]' : 'text-white/50 hover:text-[#ffcc00]'}`}
                    >
                      DATOS DE EMPRESA
                    </Link>
                    <Link 
                      href="/configuracion/evaluacion" 
                      className={`text-xs font-bold py-2 transition-colors ${pathname === '/configuracion/evaluacion' ? 'text-[#ffcc00]' : 'text-white/50 hover:text-[#ffcc00]'}`}
                    >
                      MOTOR DE SCORING
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

      </div>

      <div className="p-8 mt-auto border-t border-white/5">
         <button className="flex items-center gap-4 text-white/50 hover:text-[#ffcc00] transition-all font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-5 w-5 text-[#ffcc00]" />
            Soporte Técnico
         </button>
      </div>
    </aside>

  )
}



