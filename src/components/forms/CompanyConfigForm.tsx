'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSystemSetting } from '@/app/actions/settings'
import { Save, Plus, Trash2 } from 'lucide-react'

export function CompanyConfigForm({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const saveConfig = () => {
    startTransition(async () => {
      try {
        await saveSystemSetting('company_info', data)
        alert('Configuración guardada correctamente.')
      } catch (error) {
        console.error(error)
        alert('Error al guardar configuración.')
      }
    })
  }

  const addAgency = () => {
    setData({
      ...data,
      agencias: [...data.agencias, { nombre: '', direccion: '', telefono: '' }]
    })
  }

  const updateAgency = (idx: number, field: string, value: string) => {
    const newAgencias = [...data.agencias]
    newAgencias[idx][field] = value
    setData({ ...data, agencias: newAgencias })
  }

  const removeAgency = (idx: number) => {
    const newAgencias = [...data.agencias]
    newAgencias.splice(idx, 1)
    setData({ ...data, agencias: newAgencias })
  }

  const addOffice = () => {
    setData({
      ...data,
      oficinas: [...data.oficinas, { nombre: '', direccion: '', telefono: '' }]
    })
  }

  const updateOffice = (idx: number, field: string, value: string) => {
    const newOficinas = [...data.oficinas]
    newOficinas[idx][field] = value
    setData({ ...data, oficinas: newOficinas })
  }

  const removeOffice = (idx: number) => {
    const newOficinas = [...data.oficinas]
    newOficinas.splice(idx, 1)
    setData({ ...data, oficinas: newOficinas })
  }

  return (
    <div className="space-y-6">
      {/* Datos Generales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Información General e Institucional</CardTitle>
            <CardDescription>Datos legales y principales de la cooperativa o institución.</CardDescription>
          </div>
          <Button onClick={saveConfig} disabled={isPending} className="bg-slate-800 hover:bg-slate-900 text-white">
            <Save className="w-4 h-4 mr-2" />
            {isPending ? 'Guardando...' : 'Guardar Perfil'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Razón Social</Label>
              <Input 
                value={data.razon_social} 
                onChange={e => setData({...data, razon_social: e.target.value})} 
                placeholder="Ej. Cooperativa de Ahorro y Crédito XYZ"
              />
            </div>
            <div className="space-y-2">
              <Label>RUC</Label>
              <Input 
                value={data.ruc} 
                onChange={e => setData({...data, ruc: e.target.value})} 
                placeholder="Número de RUC"
              />
            </div>
            <div className="space-y-2">
              <Label>Representante Legal</Label>
              <Input 
                value={data.representante_legal} 
                onChange={e => setData({...data, representante_legal: e.target.value})} 
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Dirección Sede Principal</Label>
              <Input 
                value={data.direccion_principal} 
                onChange={e => setData({...data, direccion_principal: e.target.value})} 
                placeholder="Av. Principal 123, Distrito"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agencias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nuestras Agencias</CardTitle>
            <CardDescription>Locales y sucursales principales de atención al público.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addAgency} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <Plus className="w-4 h-4 mr-2" /> Agregar Agencia
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.agencias.length === 0 && <p className="text-sm text-muted-foreground italic">No hay agencias registradas.</p>}
          {data.agencias.map((ag: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end border p-4 bg-slate-50/50 rounded-lg relative">
              <div className="space-y-2 w-full md:w-1/3">
                <Label className="text-xs">Nombre de Agencia</Label>
                <Input value={ag.nombre} onChange={e => updateAgency(idx, 'nombre', e.target.value)} placeholder="Ej. Agencia Centro" />
              </div>
              <div className="space-y-2 w-full md:w-2/3">
                <Label className="text-xs">Dirección</Label>
                <Input value={ag.direccion} onChange={e => updateAgency(idx, 'direccion', e.target.value)} placeholder="Av. / Calle" />
              </div>
              <div className="space-y-2 w-full md:w-1/4">
                <Label className="text-xs">Teléfono</Label>
                <Input value={ag.telefono} onChange={e => updateAgency(idx, 'telefono', e.target.value)} placeholder="(01) ... " />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeAgency(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Oficinas Informativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Oficinas Informativas</CardTitle>
            <CardDescription>Módulos o puntos de atención descentralizados.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addOffice} className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Plus className="w-4 h-4 mr-2" /> Agregar Oficina
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.oficinas.length === 0 && <p className="text-sm text-muted-foreground italic">No hay oficinas registradas.</p>}
          {data.oficinas.map((of: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end border p-4 bg-slate-50/50 rounded-lg relative">
              <div className="space-y-2 w-full md:w-1/3">
                <Label className="text-xs">Nombre/Punto</Label>
                <Input value={of.nombre} onChange={e => updateOffice(idx, 'nombre', e.target.value)} placeholder="Ej. Módulo Norte" />
              </div>
              <div className="space-y-2 w-full md:w-2/3">
                <Label className="text-xs">Ubicación</Label>
                <Input value={of.direccion} onChange={e => updateOffice(idx, 'direccion', e.target.value)} placeholder="Centro Comercial, Mercado..." />
              </div>
              <div className="space-y-2 w-full md:w-1/4">
                <Label className="text-xs">Teléfono (Opc.)</Label>
                <Input value={of.telefono} onChange={e => updateOffice(idx, 'telefono', e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeOffice(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}
