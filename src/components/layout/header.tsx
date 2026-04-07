import { 
  Bell,
  TriangleAlert,
  Menu, 
  Search, 
  ArrowLeft, 
  RotateCw, 
  MapPin, 
  ChevronRight,
  Package2
} from "lucide-react"

export function Header() {
  return (
    <header className="z-30 flex h-16 w-full items-center justify-between px-10 bg-white border-b border-slate-100 print:hidden">

      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
             <span className="text-slate-400">Pipeline health</span>
             <span className="text-emerald-400">Stable</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-700 mx-1" />
           <span className="text-slate-400">5 risks detected</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}




