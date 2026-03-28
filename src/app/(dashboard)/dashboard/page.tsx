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
  CheckCircle2
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
    { title: "Socios", value: totalSocios, icon: Users, color: "bg-[#FFD700]" },
    { title: "Solicitudes", value: totalSolicitudes, icon: Package, color: "bg-[#4169E1]" },
    { title: "Presentada", value: totalPresentada, icon: Send, color: "bg-[#8A2BE2]" },
    { title: "En Revisión por el Analista", value: totalEnRevision, icon: CreditCard, color: "bg-[#FF4500]" },
    { title: "Aprobadas", value: totalAprobadas, icon: ShoppingCart, color: "bg-[#32CD32]" },
    { title: "Observadas", value: totalObservadas, icon: FileText, color: "bg-[#FFBF00]" },
  ]

  return (
    <div className="flex flex-col gap-8 p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            className={`${stat.color} rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-black/5 hover:scale-[1.02] transition-all cursor-default relative overflow-hidden group min-h-[180px]`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
               <stat.icon className="w-24 h-24 text-white" />
            </div>
            <stat.icon className="w-10 h-10 text-white mb-4" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider leading-tight px-4">{stat.title}</h3>
            <p className="text-4xl font-black text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Central Control Section */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-12">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Control de evaluaciones de créditos</h2>
           <div className="h-1.5 w-24 bg-[#4169E1] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Action 1: Crear Cliente */}
           <Link href="/socios" className="group bg-slate-50/50 hover:bg-white p-8 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-transparent hover:border-[#4169E1]/20 hover:shadow-xl transition-all">
              <div className="relative mb-6">
                 <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-10 h-10 text-[#4169E1]" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-6 h-6 rounded-full" />
                 </div>
              </div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Registro de Socios</span>
           </Link>

           {/* Action 2: Registrar Crédito */}
           <Link href="/solicitudes" className="group bg-slate-50/50 hover:bg-white p-8 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-transparent hover:border-[#32CD32]/20 hover:shadow-xl transition-all">
              <div className="relative mb-6">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-[#32CD32]">
                    <CreditCard className="w-10 h-10" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                    <div className="w-5 h-5 bg-[#32CD32] rounded flex items-center justify-center text-[10px] text-white font-bold">$</div>
                 </div>
              </div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Solicitud de Crédito</span>
           </Link>

           {/* Action 3: Saldo Histórico */}
           <Link href="/reporteria" className="group bg-slate-50/50 hover:bg-white p-8 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-transparent hover:border-[#FFD700]/20 hover:shadow-xl transition-all">
              <div className="relative mb-6">
                 <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <History className="w-10 h-10 text-amber-500" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 font-bold text-[#FFD700] text-xs">S/</div>
              </div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Reportería</span>
           </Link>

           {/* Action 4: Aprobaciones */}
           <Link href="/aprobaciones" className="group bg-slate-50/50 hover:bg-white p-8 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-transparent hover:border-[#FF4500]/20 hover:shadow-xl transition-all">
              <div className="relative mb-6">
                 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-10 h-10 text-[#FF4500]" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                    <div className="w-5 h-5 animate-pulse bg-red-500 rounded-full"></div>
                 </div>
              </div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Aprobaciones</span>
           </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
         <button className="flex items-center gap-2 text-xs font-black text-[#4169E1] uppercase tracking-widest hover:translate-x-1 transition-transform group">
           Ver Reporte Completo <ChevronRight className="w-4 h-4" />
         </button>
      </div>

    </div>
  )
}
