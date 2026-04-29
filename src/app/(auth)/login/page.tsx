'use client'

import { signIn } from '@/app/actions/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Gauge } from 'lucide-react'


function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <Card className="w-full max-w-md bg-white border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-4 relative z-10">
      <form action={signIn}>
        <CardHeader className="text-center pb-10">
          <div className="w-20 h-20 bg-[#161065] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-navy/20 border border-white/10 group-hover:scale-110 transition-transform">
             <Gauge className="w-10 h-10 text-[#ffcc00]" />
          </div>
          <CardTitle className="text-3xl font-black text-[#161065] tracking-tighter">A.RISK ERM</CardTitle>
          <CardDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Sistema de Gestión de Riesgos v1.1</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 animate-bounce">
              {error}
            </div>
          )}
          <div className="grid gap-3">
            <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identificación de Usuario</Label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              className="flex h-14 w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-1 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#161065]/10 focus:border-[#161065]/40 transition-all"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Clave de Acceso</Label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="flex h-14 w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-1 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#161065]/10 focus:border-[#161065]/40 transition-all"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-8">
          <button 
            className="w-full h-14 rounded-2xl bg-[#161065] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-navy/20 hover:scale-[1.02] hover:bg-[#1a1f7a] active:scale-[0.98] transition-all" 
            type="submit"
          >
            Validar Acceso
          </button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute -top-48 -right-48 w-full h-full bg-gradient-to-br from-[#161065] to-transparent rounded-full blur-[150px]"></div>
         <div className="absolute -bottom-48 -left-48 w-full h-full bg-gradient-to-tr from-[#ffcc00] to-transparent rounded-full blur-[150px]"></div>
      </div>
      
      <Suspense fallback={<div className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Cargando Ecosistema...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}

