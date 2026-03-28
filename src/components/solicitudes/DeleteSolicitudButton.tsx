'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteSolicitud } from '@/app/actions/solicitudes'

interface DeleteSolicitudButtonProps {
  id: string
  numero: string
}

export function DeleteSolicitudButton({ id, numero }: DeleteSolicitudButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar la solicitud ${numero}? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteSolicitud(id)
      if (!result.success) {
        alert('No se pudo eliminar la solicitud.')
      }
    } catch (error) {
      console.error('Error deleting solicitud:', error)
      alert('Error técnico al intentar eliminar la solicitud.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      title="Eliminar Solicitud"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
