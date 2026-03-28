import { 
  CircleUser, 
  Menu, 
  Search, 
  ArrowLeft, 
  RotateCw, 
  MapPin, 
  ChevronRight 
} from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white px-6 border-b border-slate-100 print:hidden shadow-sm">
      <div className="flex items-center gap-6">
        {/* Mobile menu trigger */}
        <button className="sm:hidden h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white">
          <Menu className="h-5 w-5" />
        </button>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
           <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
             <RotateCw className="w-5 h-5" />
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
             <MapPin className="w-5 h-5" />
           </button>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs font-bold text-slate-400 gap-2">
           <span className="hover:text-[#4169E1] cursor-pointer">ARISK</span>
           <ChevronRight className="w-3 h-3" />
           <span className="text-slate-900 capitalize">Dashboard</span>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-64 rounded-xl bg-slate-50 pl-10 pr-4 py-2 text-sm border-none focus:ring-2 focus:ring-[#4169E1]/20 transition-all"
          />
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 leading-none">Root Admin</span>
              <span className="text-[10px] font-bold text-[#4169E1] uppercase tracking-tighter">Super Usuario</span>
           </div>
           <button className="w-10 h-10 rounded-xl bg-slate-900 shadow-lg shadow-black/10 flex items-center justify-center text-white ring-2 ring-white">
              <CircleUser className="w-6 h-6" />
           </button>
        </div>
      </div>
    </header>
  )
}
