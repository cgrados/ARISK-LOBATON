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
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-10 print:hidden">
      <div className="flex flex-1 items-center gap-6">
        <div className="relative w-full max-w-lg group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/30 group-focus-within:text-[#ffcc00] transition-colors" />
          </div>
          <input
            type="search"
            placeholder="Buscar en el ecosistema..."
            className="h-11 w-full rounded-2xl bg-slate-100 border border-slate-200 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#161065]/10 focus:border-[#161065]/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#161065] border border-white/10 px-3 py-1.5 rounded-full shadow-lg shadow-black/20">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado Pipeline</span>
            <span className="text-[10px] font-black text-[#161065] uppercase tracking-widest ml-1">Estable</span>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">5 riesgos detectados</span>
          </div>
        </div>

        <button className="relative p-2 text-white/50 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-4 pl-2 group outline-none"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 tracking-tight">{userName || 'Usuario'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userEmail || 'Socio Administrador'}</span>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#161065] to-[#2a1f8a] border border-white/10 flex items-center justify-center shadow-lg shadow-black/30 overflow-hidden group cursor-pointer">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName || 'U'}`} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-white/5 mb-2">
                <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                  {userName || 'Usuario'}
                </p>
                <p className="text-[10px] text-white/40 truncate lowercase font-bold tracking-widest mt-1">
                  {userEmail || 'Socio Administrador'}
                </p>
              </div>
              
              <button className="w-full flex items-center gap-4 px-6 py-3 text-[10px] text-white/70 hover:bg-white/5 hover:text-[#ffcc00] transition-colors text-left uppercase font-black tracking-widest">
                <User className="w-4 h-4" />
                Mi Perfil
              </button>
              
              <div className="h-px bg-white/5 my-2 mx-4" />
              
              <form action={signOut}>
                <button 
                  type="submit"
                  className="w-full flex items-center gap-4 px-6 py-3 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors text-left uppercase font-black tracking-widest"
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
