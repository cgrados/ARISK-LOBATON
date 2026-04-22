'use client'

import { useState, useRef, useEffect } from "react"
import { 
  Bell,
  Search, 
  LogOut,
  User,
  ChevronDown
} from "lucide-react"
import { signOut } from "@/app/actions/auth"

interface HeaderProps {
  userName?: string
  userEmail?: string
}

export function Header({ userName, userEmail }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="z-30 flex h-16 w-full items-center justify-between px-10 bg-white border-b border-slate-100 print:hidden">

      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-semibold">
           <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
             <span className="text-slate-400 uppercase tracking-tighter">Estado Pipeline</span>
             <span className="text-emerald-400">Estable</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-700 mx-1" />
           <span className="text-slate-400">5 riesgos detectados</span>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 group outline-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-indigo-300 transition-all">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">
                  {userName || 'Usuario'}
                </p>
                <p className="text-[10px] text-slate-500 truncate lowercase font-medium">
                  {userEmail || 'Socio Administrador'}
                </p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors text-left uppercase font-bold">
                <User className="w-4 h-4 text-slate-400" />
                Mi Perfil
              </button>
              
              <div className="h-px bg-slate-100 my-1 mx-2" />
              
              <form action={signOut}>
                <button 
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left uppercase font-black"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
