'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateSocio } from '@/app/actions/socios'

export function EditSocioForm({ socio }: { socio: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateSocio(socio.id, formData)
        router.push('/socios')
      } catch (error) {
        console.error('Error:', error)
        alert('Ocurrió un error al actualizar el socio.')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ficha Técnica del Socio</CardTitle>
        <CardDescription>
          Modifique los campos necesarios para actualizar al socio en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-8">
            {/* Sección 1: Datos Generales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nro_cuenta">N° Cuenta <span className="text-red-500">*</span></Label>
                  <Input id="nro_cuenta" name="nro_cuenta" required defaultValue={socio.nro_cuenta || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
                  <Input id="dni" name="dni" required maxLength={8} defaultValue={socio.dni || ''} />
                </div>
                <div className="space-y-2 lg:col-span-2"></div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="nombres">Nombres <span className="text-red-500">*</span></Label>
                  <Input id="nombres" name="nombres" required defaultValue={socio.nombres || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Ap. Paterno <span className="text-red-500">*</span></Label>
                  <Input id="apellido_paterno" name="apellido_paterno" required defaultValue={socio.apellido_paterno || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Ap. Materno <span className="text-red-500">*</span></Label>
                  <Input id="apellido_materno" name="apellido_materno" required defaultValue={socio.apellido_materno || ''} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nac.</Label>
                  <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" defaultValue={socio.fecha_nacimiento || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Input id="sexo" name="sexo" placeholder="M / F" defaultValue={socio.sexo || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Input id="estado_civil" name="estado_civil" placeholder="S/C/D/V" defaultValue={socio.estado_civil || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nro_dependientes">Nro. Dependientes</Label>
                  <Input id="nro_dependientes" name="nro_dependientes" type="number" defaultValue={socio.nro_dependientes || '0'} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Celular / Teléfono</Label>
                  <Input id="telefono" name="telefono" defaultValue={socio.telefono || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instruccion">G. Instrucción</Label>
                  <Input id="instruccion" name="instruccion" defaultValue={socio.instruccion || ''} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="nro_cuenta_conyuge">N° Cuenta Cónyuge</Label>
                  <Input id="nro_cuenta_conyuge" name="nro_cuenta_conyuge" defaultValue={socio.nro_cuenta_conyuge || ''} />
                </div>
              </div>
            </div>

            {/* Sección 2: Domicilio */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Domicilio</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="direccion">Dirección Domicilio</Label>
                  <Input id="direccion" name="direccion" defaultValue={socio.direccion || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distrito">Distrito</Label>
                  <Input id="distrito" name="distrito" defaultValue={socio.distrito || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input id="provincia" name="provincia" defaultValue={socio.provincia || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" name="departamento" defaultValue={socio.departamento || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condicion_vivienda">Condición de Vivienda</Label>
                  <Input id="condicion_vivienda" name="condicion_vivienda" placeholder="Propia, Alquilada, Familiar..." defaultValue={socio.condicion_vivienda || ''} />
                </div>
              </div>
            </div>

            {/* Sección 3: Datos Laborales y del Negocio */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Datos Laborales e Independientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actividad_economica">Actividad Económica</Label>
                  <Input id="actividad_economica" name="actividad_economica" defaultValue={socio.actividad_economica || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profesion_oficio">Profesión / Oficio</Label>
                  <Input id="profesion_oficio" name="profesion_oficio" defaultValue={socio.profesion_oficio || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_laboral">Empresa / Trabajo Dir.</Label>
                  <Input id="empresa_laboral" name="empresa_laboral" defaultValue={socio.empresa_laboral || ''} />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion_negocio">Dirección del Negocio</Label>
                  <Input id="direccion_negocio" name="direccion_negocio" defaultValue={socio.direccion_negocio || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distrito_negocio">Distrito (Negocio)</Label>
                  <Input id="distrito_negocio" name="distrito_negocio" defaultValue={socio.distrito_negocio || ''} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input id="ruc" name="ruc" defaultValue={socio.ruc || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_ruc">Estado de RUC</Label>
                  <Input id="estado_ruc" name="estado_ruc" placeholder="Activo, Baja..." defaultValue={socio.estado_ruc || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo en Empresa</Label>
                  <Input id="cargo" name="cargo" defaultValue={socio.cargo || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_empresa">Tamaño de Empresa</Label>
                  <Select name="tipo_empresa" defaultValue={socio.tipo_empresa || ''}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Micro">Micro</SelectItem>
                      <SelectItem value="Pequeña">Pequeña</SelectItem>
                      <SelectItem value="Mediana">Mediana</SelectItem>
                      <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sección 4: Finanzas y Evaluación */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Finanzas y Calificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ingreso_bruto_mensual">Ingresos Mensuales</Label>
                  <Input id="ingreso_bruto_mensual" name="ingreso_bruto_mensual" type="number" step="0.01" defaultValue={socio.ingreso_bruto_mensual || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aportes_totales">Aporte</Label>
                  <Input id="aportes_totales" name="aportes_totales" type="number" step="0.01" defaultValue={socio.aportes_totales || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_ingreso">Fecha de Ingreso (Afil.)</Label>
                  <Input id="fecha_ingreso" name="fecha_ingreso" type="date" defaultValue={socio.fecha_ingreso || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calificacion_interna">Clasificación Interna</Label>
                  <Input id="calificacion_interna" name="calificacion_interna" placeholder="Normal, CPP, Deficiente..." defaultValue={socio.calificacion_interna || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clasificacion_central_riesgo">Clasif. Central Riesgos</Label>
                  <Input id="clasificacion_central_riesgo" name="clasificacion_central_riesgo" placeholder="Normal..." defaultValue={socio.clasificacion_central_riesgo || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_ingreso_laboral">Fec. Ingreso Laboral</Label>
                  <Input id="fecha_ingreso_laboral" name="fecha_ingreso_laboral" type="date" defaultValue={socio.fecha_ingreso_laboral || ''} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  )
}
