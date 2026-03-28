import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSocio } from '@/app/actions/socios'
import { EditSocioForm } from '@/components/forms/EditSocioForm'

export default async function EditSocioPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const socio = await getSocio(params.id)

  if (!socio) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Editar Socio: {socio.nombres_apellidos}</h1>
        <Link href="/socios">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
      
      <EditSocioForm socio={socio} />
    </div>
  )
}
