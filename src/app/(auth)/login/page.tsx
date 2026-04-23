'use client'

import { signIn } from '@/app/actions/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <Card className="w-full max-w-sm">
      <form action={signIn}>
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a ARISK.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="m@ejemplo.com"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </CardContent>
        <CardFooter>
          <button 
            className="w-full h-10 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800" 
            type="submit"
          >
            Ingresar
          </button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
