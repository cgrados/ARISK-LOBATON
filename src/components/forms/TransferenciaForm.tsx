'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { transferSocios } from '@/app/actions/socios'
import { ArrowRightLeft, Users } from 'lucide-react'

export function TransferenciaForm({ users }: { users: any[] }) {
  const [sourceUserId, setSourceUserId] = useState('')
  const [targetUserId, setTargetUserId] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleTransfer = () => {
    if (!sourceUserId || !targetUserId) {
      alert('Por favor, seleccione usuario de origen y destino.')
      return
    }
    if (sourceUserId === targetUserId) {
      alert('El usuario origen y destino no pueden ser el mismo.')
      return
    }

    const targetUser = users.find(u => u.id === targetUserId)

    if (confirm(`¿Está completamente seguro de transferir TODA la cartera de socios al usuario ${targetUser?.full_name}? Esta acción es irreversible.`)) {
      startTransition(async () => {
        try {
          await transferSocios(sourceUserId, targetUserId, targetUser?.full_name || 'Sistema')
          alert('Cartera transferida exitosamente.')
          setSourceUserId('')
          setTargetUserId('')
        } catch (error: any) {
          alert(error.message || 'Error al completar la transferencia.')
        }
      })
    }
  }

  return (
    <Card className="max-w-2xl mt-6 border-red-100 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
          <ArrowRightLeft className="w-5 h-5 text-red-600" />
          Transferencia Masiva de Cartera
        </CardTitle>
        <CardDescription>
          Mueva todos los socios registrados por un usuario hacia otro. Acción exclusiva para Super Administradores.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          
          <div className="space-y-2">
            <Label className="text-slate-600 font-semibold flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600" /> Usuario Origen (Cede)
            </Label>
            <Select value={sourceUserId} onValueChange={v => setSourceUserId(v || '')}>
              <SelectTrigger className="w-full border-blue-200 focus:ring-blue-500">
                <SelectValue placeholder="Seleccione origen..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} <span className="text-xs text-muted-foreground ml-2">({user.role})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center pt-6 text-red-300">
            <ArrowRightLeft className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 font-semibold flex items-center gap-1">
              <Users className="w-4 h-4 text-green-600" /> Usuario Destino (Recibe)
            </Label>
            <Select value={targetUserId} onValueChange={v => setTargetUserId(v || '')}>
              <SelectTrigger className="w-full border-green-200 focus:ring-green-500">
                <SelectValue placeholder="Seleccione destino..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} <span className="text-xs text-muted-foreground ml-2">({user.role})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="bg-red-50 p-4 border border-red-100 rounded-lg text-sm text-red-800 flex items-start gap-3 mt-4">
          <div className="mt-0.5 font-bold">⚠️ Atención:</div>
          <p>
            Al ejecutar esta acción, <strong>absolutamente todos los socios</strong> cuyo creador actual sea el "Usuario Origen" 
            pasarán a pertenecer al "Usuario Destino". Desaparecerán de la vista del primero y aparecerán en la tabla del segundo inmediatamente.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleTransfer} 
            disabled={isPending || !sourceUserId || !targetUserId} 
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-8"
          >
            {isPending ? 'Procesando...' : 'Ejecutar Transferencia'}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
