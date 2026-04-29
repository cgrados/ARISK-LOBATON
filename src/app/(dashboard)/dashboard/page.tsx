import Link from "next/link"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  UserPlus, 
  CreditCard, 
  History, 
  BarChart3,
  ChevronRight,
  Send,
  CheckCircle2,
  ShieldCheck
} from "lucide-react"

import { getSocios } from "@/app/actions/socios"
import { getSolicitudes } from "@/app/actions/solicitudes"

export default async function DashboardPage() {
  const socios = await getSocios() || []
  const solicitudes = await getSolicitudes() || []
  
  const totalSocios = socios.length
  const totalSolicitudes = solicitudes.length
  const totalPresentada = solicitudes.filter(s => s.estado === 'PRESENTADA').length
  const totalAprobadas = solicitudes.filter(s => s.estado === 'APROBADO').length
  const totalObservadas = solicitudes.filter(s => s.estado === 'OBSERVADO').length
  const totalEnRevision = solicitudes.filter(s => s.estado === 'EN_REVISION').length

  const stats = [
    { title: "SOCIOS", value: totalSocios, icon: Users, color: "from-[#161065] to-[#1a1f7a]", accent: "text-[#ffcc00]" },
    { title: "SOLICITUDES", value: totalSolicitudes, icon: Package, color: "from-[#1a1a1a] to-[#262626]", accent: "text-[#ffcc00]" },
    { title: "PRESENTADAS", value: totalPresentada, icon: Send, color: "from-[#1a1a1a] to-[#262626]", accent: "text-[#ffcc00]" },
    { title: "EN REVISIÓN", value: totalEnRevision, icon: CreditCard, color: "from-[#161065] to-[#1a1f7a]", accent: "text-amber-400" },
    { title: "APROBADAS", value: totalAprobadas, icon: ShoppingCart, color: "from-[#1a1a1a] to-[#262626]", accent: "text-emerald-400" },
    { title: "OBSERVADAS", value: totalObservadas, icon: FileText, color: "from-[#1a1a1a] to-[#262626]", accent: "text-rose-400" },
  ]

  return (
    <div className="flex flex-col gap-10 p-2 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#161065] to-[#1a1f7a] p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffcc00]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Panel de Control Riesgos</h1>
          <p className="text-white/60 mt-2 font-bold uppercase tracking-[0.2em] text-xs">Visión General del Ecosistema Financiero</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <button className="bg-[#ffcc00] text-[#161065] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all">Exportar Reporte</button>
           <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Configuración</button>
        </div>
      </div>

      {/* Top Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl shadow-black/40 hover:scale-[1.03] transition-all cursor-default relative overflow-hidden group min-h-[220px]`}
          >
            <div className={`absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all ${stat.accent}`}>
               <stat.icon className="w-32 h-32" />
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner ${stat.accent}`}>
               <stat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-2">{stat.title}</h3>
            <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{stat.value}</p>
            <div className={`h-1 w-12 rounded-full mt-6 bg-current ${stat.accent}/40 opacity-30`}></div>
          </div>
        ))}
      </div>

      {/* Central Control Section */}
      <div className="bg-[#1a1a1a] rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-black/60 border border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#161065]/20 rounded-full blur-[120px] -ml-48 -mb-48"></div>
        
        <div className="text-center mb-16 relative z-10">
           <h2 className="text-3xl font-black text-white tracking-tight">Evaluaciones de Crédito</h2>
           <p className="text-white/40 mt-3 text-sm font-bold uppercase tracking-[0.2em]">Gestión Centralizada de Operaciones</p>
           <div className="h-1.5 w-20 bg-[#ffcc00] mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
           {/* Action 1: Registro Socios */}
           <Link href="/socios" className="group bg-[#262626]/50 hover:bg-[#262626] p-10 rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5 hover:border-[#ffcc00]/20 hover:shadow-2xl transition-all h-full">
              <div className="relative mb-8">
                 <div className="w-24 h-24 bg-[#161065] rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                    <Users className="w-10 h-10 text-[#ffcc00]" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#141313] rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg animate-pulse"></div>
                 </div>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.3em] group-hover:text-[#ffcc00] transition-colors">SOCIOS</span>
              <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest text-center">Alta y Gestión</p>
           </Link>

           {/* Action 2: Solicitud */}
           <Link href="/solicitudes" className="group bg-[#262626]/50 hover:bg-[#262626] p-10 rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5 hover:border-[#ffcc00]/20 hover:shadow-2xl transition-all h-full">
              <div className="relative mb-8">
                 <div className="w-24 h-24 bg-[#161065] rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                    <CreditCard className="w-10 h-10 text-[#ffcc00]" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#141313] rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                    <span className="text-[#ffcc00] font-black text-sm">$</span>
                 </div>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.3em] group-hover:text-[#ffcc00] transition-colors">SOLICITUDES</span>
              <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest text-center">Nuevos Créditos</p>
           </Link>

           {/* Action 3: Reporteria */}
           <Link href="/reporteria" className="group bg-[#262626]/50 hover:bg-[#262626] p-10 rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5 hover:border-[#ffcc00]/20 hover:shadow-2xl transition-all h-full">
              <div className="relative mb-8">
                 <div className="w-24 h-24 bg-[#161065] rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                    <BarChart3 className="w-10 h-10 text-[#ffcc00]" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#141313] rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full mx-0.5"></div>
                    <div className="w-1.5 h-4 bg-amber-500/50 rounded-full mx-0.5"></div>
                 </div>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.3em] group-hover:text-[#ffcc00] transition-colors">REPORTES</span>
              <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest text-center">Analítica Avanzada</p>
           </Link>

           {/* Action 4: Aprobaciones */}
           <Link href="/aprobaciones" className="group bg-[#262626]/50 hover:bg-[#262626] p-10 rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5 hover:border-[#ffcc00]/20 hover:shadow-2xl transition-all h-full">
              <div className="relative mb-8">
                 <div className="w-24 h-24 bg-[#161065] rounded-[2rem] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                    <ShieldCheck className="w-10 h-10 text-[#ffcc00]" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#141313] rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                 </div>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-[0.3em] group-hover:text-[#ffcc00] transition-colors">APROBACIONES</span>
              <p className="text-[10px] text-white/30 mt-3 font-bold uppercase tracking-widest text-center">Firma y Validación</p>
           </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
         <button className="flex items-center gap-3 text-[10px] font-black text-[#ffcc00] uppercase tracking-[0.4em] hover:gap-6 transition-all group bg-white/5 px-8 py-4 rounded-full border border-white/5">
           VER SISTEMA COMPLETO <ChevronRight className="w-4 h-4" />
         </button>
      </div>

    </div>
  )
}

