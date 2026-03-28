import Link from "next/link"
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  ShieldCheck,
  FileText
} from "lucide-react"

interface SidebarProps {
  allowedModules: string[]
}

export function Sidebar({ allowedModules }: SidebarProps) {
  const hasAccess = (moduleId: string) => allowedModules.includes(moduleId)

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col bg-[#000000] text-slate-300 sm:flex print:hidden">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 font-black text-white">
          <div className="w-8 h-8 bg-[#4169E1] rounded flex items-center justify-center text-white font-bold italic shadow-lg shadow-blue-500/20">A</div>
          <span className="text-xl tracking-tight">ARISK</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-3 text-sm font-semibold space-y-1">
          
          {hasAccess('dashboard') && (
            <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all text-[#00A884] bg-[#00A884]/10 border-l-4 border-[#00A884]">
              <Home className="h-4 w-4" /> Dashboard
            </Link>
          )}

          {hasAccess('socios') && (
            <Link href="/socios" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
              <Users className="h-4 w-4" /> Registro de Socios
            </Link>
          )}

          {hasAccess('solicitudes') && (
            <Link href="/solicitudes" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
              <Package className="h-4 w-4" /> Solicitudes
            </Link>
          )}

          {hasAccess('aprobaciones') && (
            <Link href="/aprobaciones" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
              <ShoppingCart className="h-4 w-4" /> Aprobaciones
            </Link>
          )}

          {hasAccess('reporteria') && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Métricas</p>
              </div>
              <Link href="/reporteria" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
                <FileText className="h-4 w-4" /> Módulo de Reportería
              </Link>
            </>
          )}

          {hasAccess('configuraciones') && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuraciones</p>
              </div>
              <Link href="/configuracion/empresa" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
                <Home className="h-4 w-4" /> Datos Institución
              </Link>
              <Link href="/configuracion/evaluacion" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
                <LineChart className="h-4 w-4" /> Motor Evaluación
              </Link>
              <Link href="/configuracion/credito" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-white/5 hover:text-white">
                <Package2 className="h-4 w-4" /> Condiciones Crédito
              </Link>
            </>
          )}

          {hasAccess('usuarios') && (
            <>
              <div className="pt-6 pb-2">
                <p className="px-4 text-[10px] font-black text-red-500/80 uppercase tracking-widest">Administración</p>
              </div>
              <Link href="/usuarios" className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:bg-red-500/10 text-red-400 hover:text-red-300">
                <ShieldCheck className="h-4 w-4" /> Módulo de Usuarios
              </Link>
            </>
          )}

        </nav>
      </div>
      <div className="p-4 border-t border-white/5 mt-auto">
         <div className="flex items-center gap-3 px-2 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">AD</div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-white leading-none">Administrador</span>
               <span className="text-[10px] text-slate-500">arisk@system.com</span>
            </div>
         </div>
      </div>
    </aside>
  )
}
