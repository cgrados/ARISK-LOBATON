'use client'

import { useState, useTransition, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSystemSetting } from '@/app/actions/settings'
import { Save, Edit, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react'


interface Product {
  name: string
  max_months: number
  rates: Record<string, { tea: number; tem: number }>
}

interface Special {
  name: string
  tea?: number
  tem?: number
  max_months?: number
  description?: string
  amount?: number // For backward compatibility if any
}

interface ConfigData {
  products: Product[]
  special: Special[]
  categories: string[]
  moratoria: { tea: number; tem: number }
}

export function CreditConfigForm({ initialData }: { initialData: ConfigData }) {
  const [data, setData] = useState<ConfigData>(initialData)
  const [isPending, startTransition] = useTransition()


  // View state: 'list' | 'product' | 'special'
  const [view, setView] = useState<'list' | 'product' | 'special'>('list')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  // Temporary state for the item being edited
  const [tempProduct, setTempProduct] = useState<any>(null)
  const [tempSpecial, setTempSpecial] = useState<any>(null)

  const saveConfig = () => {
    startTransition(async () => {
      try {
        await saveSystemSetting('credit_conditions', data)
        alert('Configuración guardada en la base de datos.')
      } catch (error) {
        console.error(error)
        alert('Error al guardar configuración.')
      }
    })
  }

  const handleMoratoriaChange = (rateType: 'tea' | 'tem', value: number) => {
    const newData = { ...data }
    newData.moratoria[rateType] = value

    if (rateType === 'tea') {
      const tem = (Math.pow(1 + value / 100, 1 / 12) - 1) * 100
      newData.moratoria['tem'] = Number(tem.toFixed(2))
    } else {
      const tea = (Math.pow(1 + value / 100, 12) - 1) * 100
      newData.moratoria['tea'] = Number(tea.toFixed(2))
    }

    setData(newData)
  }

  // --- PRODUCT EDITING ---
  const startEditingProduct = (idx: number) => {
    setTempProduct(JSON.parse(JSON.stringify(data.products[idx])))
    setEditingIdx(idx)
    setView('product')
  }

  const handleTempProductRateChange = (catName: string, rateType: 'tea' | 'tem', value: number) => {
    const prod = { ...tempProduct }
    prod.rates[catName][rateType] = value

    if (rateType === 'tea') {
      const tem = (Math.pow(1 + value / 100, 1 / 12) - 1) * 100
      prod.rates[catName]['tem'] = Number(tem.toFixed(2))
    } else {
      const tea = (Math.pow(1 + value / 100, 12) - 1) * 100
      prod.rates[catName]['tea'] = Number(tea.toFixed(2))
    }
    setTempProduct(prod)
  }

  const applyProductEdit = () => {
    if (editingIdx !== null) {
      const newData = { ...data }
      newData.products[editingIdx] = tempProduct
      setData(newData)
    }
    setView('list')
    setEditingIdx(null)
  }

  const addProduct = () => {
    const newProduct: Product = {
      name: 'NUEVO PRODUCTO',
      max_months: 60,
      rates: {}
    }

    // Initialize rates with 0 for each category
    data.categories.forEach((cat: string) => {
      newProduct.rates[cat] = { tea: 0, tem: 0 }
    })

    const newData = { ...data }
    newData.products.push(newProduct)
    setData(newData)
    
    // Start editing immediately
    startEditingProduct(newData.products.length - 1)
  }

  const deleteProduct = (idx: number) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      const newData = { ...data }
      newData.products.splice(idx, 1)
      setData(newData)
    }
  }


  // --- SPECIAL EDITING ---
  const startEditingSpecial = (idx: number) => {
    setTempSpecial(JSON.parse(JSON.stringify(data.special[idx])))
    setEditingIdx(idx)
    setView('special')
  }

  const handleTempSpecialChange = (field: string, value: any) => {
    const spec = { ...tempSpecial }
    spec[field] = value

    if (field === 'tea' || field === 'tem') {
      if (field === 'tea') {
        const tem = (Math.pow(1 + Number(value) / 100, 1 / 12) - 1) * 100
        spec['tem'] = Number(tem.toFixed(2))
      } else {
        const tea = (Math.pow(1 + Number(value) / 100, 12) - 1) * 100
        spec['tea'] = Number(tea.toFixed(2))
      }
    }
    setTempSpecial(spec)
  }

  const applySpecialEdit = () => {
    if (editingIdx !== null) {
      const newData = { ...data }
      newData.special[editingIdx] = tempSpecial
      setData(newData)
    }
    setView('list')
    setEditingIdx(null)
  }

  const addSpecial = () => {
    const newSpecial = {
      name: 'NUEVA CONDICIÓN',
      tea: 0,
      tem: 0,
      max_months: 60
    }
    const newData = { ...data }
    newData.special.push(newSpecial)
    setData(newData)
    startEditingSpecial(newData.special.length - 1)
  }

  const deleteSpecial = (idx: number) => {
    if (confirm('¿Está seguro de eliminar esta condición especial?')) {
      const newData = { ...data }
      newData.special.splice(idx, 1)
      setData(newData)
    }
  }


  if (view === 'product' && tempProduct) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('list')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle>Configurar Producto</CardTitle>
              <CardDescription>Ajuste independientes para las clasificaciones del socio.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del Producto</Label>
              <Input 
                value={tempProduct.name} 
                onChange={(e) => setTempProduct({...tempProduct, name: e.target.value})} 
                className="col-span-1 border-amber-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Plazo Máximo en Meses</Label>
              <Input 
                type="number" 
                value={tempProduct.max_months || ''} 
                onChange={(e) => setTempProduct({...tempProduct, max_months: parseInt(e.target.value) || 0})}
                className="col-span-1 border-amber-200"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-amber-700">Tasas según Clasificación del Socio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.categories.map((cat: string) => (
                <div key={cat} className="p-4 border rounded-lg bg-slate-50">
                  <span className="font-semibold text-sm mb-3 block text-slate-700">{cat}</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">TEA (%)</Label>
                      <Input
                        type="number" step="0.01"
                        value={tempProduct.rates[cat]?.tea ?? 0}
                        onChange={(e) => handleTempProductRateChange(cat, 'tea', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">TEM (%)</Label>
                      <Input
                        type="number" step="0.01"
                        value={tempProduct.rates[cat]?.tem ?? 0}
                        onChange={(e) => handleTempProductRateChange(cat, 'tem', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setView('list')}>Cancelar</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={applyProductEdit}>
              <Check className="w-4 h-4 mr-2" /> Aplicar a Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (view === 'special' && tempSpecial) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('list')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle>Configuración Condición Especial</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de la Condición</Label>
            <Input 
              value={tempSpecial.name} 
              onChange={(e) => handleTempSpecialChange('name', e.target.value)} 
            />
          </div>

          {tempSpecial.description !== undefined ? (
            <div className="space-y-2">
              <Label>Descripción / Regla</Label>
              <Input 
                value={tempSpecial.description} 
                onChange={(e) => handleTempSpecialChange('description', e.target.value)} 
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Plazo Máximo en Meses</Label>
                <Input 
                  type="number" 
                  value={tempSpecial.max_months || ''} 
                  onChange={(e) => handleTempSpecialChange('max_months', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TEA General (%)</Label>
                  <Input 
                    type="number" step="0.01" 
                    value={tempSpecial.tea || 0} 
                    onChange={(e) => handleTempSpecialChange('tea', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>TEM General (%)</Label>
                  <Input 
                    type="number" step="0.01" 
                    value={tempSpecial.tem || 0} 
                    onChange={(e) => handleTempSpecialChange('tem', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setView('list')}>Cancelar</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={applySpecialEdit}>
              <Check className="w-4 h-4 mr-2" /> Aplicar a Lista
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // MASTER VIEW (LIST)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Base de Datos de Condiciones 
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium border border-green-200">Activo</span>
          </h2>
          <p className="text-sm text-muted-foreground">Registre y edite los productos individualmente antes de confirmar.</p>
        </div>
        <Button onClick={saveConfig} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {isPending ? 'Guardando DB...' : 'Guardar Cambios Oficiales'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-lg">Productos de Crédito Principales</h3>
            <Button size="sm" variant="outline" onClick={addProduct} className="h-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Producto
            </Button>
          </div>

          {data.products.map((prod: any, idx: number) => (
            <div key={idx} className="flex flex-col bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-amber-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-800">{prod.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Plazo máximo: <span className="font-medium text-slate-700">{prod.max_months || 'N/A'} meses</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startEditingProduct(idx)} className="h-8 shadow-sm">
                    <Edit className="w-4 h-4 mr-2 text-amber-600" /> Editar Tasa / Plazo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(idx)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">

                {data.categories.map((cat: string) => (
                  <div key={cat} className="bg-slate-50 border px-2 py-1 rounded text-[10px] text-slate-600">
                    <span className="font-semibold">{cat}:</span> {prod.rates[cat]?.tea ?? 0}% TEA
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg">Garantías y Especiales</h3>
              <Button size="sm" variant="outline" onClick={addSpecial} className="h-8 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                <Plus className="w-4 h-4 mr-1" /> Nueva Condición
              </Button>
            </div>
            {data.special.map((spec: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-amber-300">
                <div>
                  <h4 className="font-semibold text-slate-800">{spec.name}</h4>
                  {spec.description ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{spec.description}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      TEA: <strong className="text-slate-700">{spec.tea}%</strong> | Plazo Max: <strong className="text-slate-700">{spec.max_months || 'N/A'} meses</strong>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEditingSpecial(idx)} className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteSpecial(idx)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>


          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2 text-red-700">Tasas Moratorias Globales</h3>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label className="text-red-800">Tasa Efectiva Moratoria Anual (TEA)</Label>
                  <div className="flex items-center">
                    <Input
                      type="number" step="0.01" className="h-9 font-semibold text-red-700 border-red-200"
                      value={data.moratoria?.tea || 0}
                      onChange={(e) => handleMoratoriaChange('tea', parseFloat(e.target.value) || 0)}
                    />
                    <span className="ml-2 text-sm text-red-600 font-medium">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-800">Tasa Efectiva Moratoria Mensual (TEM)</Label>
                  <div className="flex items-center">
                    <Input
                      type="number" step="0.01" className="h-9 font-semibold text-red-700 border-red-200"
                      value={data.moratoria?.tem || 0}
                      onChange={(e) => handleMoratoriaChange('tem', parseFloat(e.target.value) || 0)}
                    />
                    <span className="ml-2 text-sm text-red-600 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
