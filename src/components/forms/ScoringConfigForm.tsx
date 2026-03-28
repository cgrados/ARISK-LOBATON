'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveSystemSetting } from '@/app/actions/settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Plus, Trash2, GripVertical } from 'lucide-react'

// Basic types for the JSON
export type RuleExact = { value: string; score: number }
export type RuleRange = { min: number; max: number; score: number }

export type ScoringVariable = {
  id: string
  name: string
  type: 'exact' | 'range'
  rules: any[] // RuleExact[] | RuleRange[]
}

export type ScoringCutoff = {
  action: string
  color: string
  min: number
  max: number
}

export function ScoringConfigForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [variables, setVariables] = useState<ScoringVariable[]>(initialData?.variables || [])
  const [cutoffs, setCutoffs] = useState<ScoringCutoff[]>(initialData?.cutoffs || [])
  const [thresholds, setThresholds] = useState({
    edeMaxModerado: initialData?.thresholds?.edeMaxModerado || 30,
    edeMaxCritico: initialData?.thresholds?.edeMaxCritico || 40,
    gastoMaxModerado: initialData?.thresholds?.gastoMaxModerado || 70,
    gastoMaxCritico: initialData?.thresholds?.gastoMaxCritico || 90
  })

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveSystemSetting('scoring_rules', { variables, cutoffs, thresholds })
        alert('Configuración guardada exitosamente.')
        router.refresh()
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  // --- VARIABLES MANAGEMENT ---
  const addVariable = () => {
    setVariables([
      ...variables,
      { id: Date.now().toString(), name: 'Nueva Variable', type: 'exact', rules: [] }
    ])
  }

  const removeVariable = (idx: number) => {
    const newVars = [...variables]
    newVars.splice(idx, 1)
    setVariables(newVars)
  }

  const updateVariable = (idx: number, field: keyof ScoringVariable, val: string) => {
    const newVars = [...variables]
    newVars[idx] = { ...newVars[idx], [field]: val }
    if (field === 'type') {
      newVars[idx].rules = [] // clear rules on type switch
    }
    setVariables(newVars)
  }

  // --- RULES MANAGEMENT ---
  const addRule = (varIdx: number, type: 'exact' | 'range') => {
    const newVars = [...variables]
    if (type === 'exact') {
      newVars[varIdx].rules.push({ value: '', score: 0 })
    } else {
      newVars[varIdx].rules.push({ min: 0, max: 0, score: 0 })
    }
    setVariables(newVars)
  }

  const removeRule = (varIdx: number, ruleIdx: number) => {
    const newVars = [...variables]
    newVars[varIdx].rules.splice(ruleIdx, 1)
    setVariables(newVars)
  }

  const updateRule = (varIdx: number, ruleIdx: number, field: string, val: any) => {
    const newVars = [...variables]
    newVars[varIdx].rules[ruleIdx] = { ...newVars[varIdx].rules[ruleIdx], [field]: val }
    setVariables(newVars)
  }

  // --- CUTOFFS MANAGEMENT ---
  const updateCutoff = (idx: number, field: keyof ScoringCutoff, val: any) => {
    const newCutoffs = [...cutoffs]
    newCutoffs[idx] = { ...newCutoffs[idx], [field]: val }
    setCutoffs(newCutoffs)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="mr-2 h-4 w-4" />
          {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Puntos de Corte (Semáforo Final)</CardTitle>
          <CardDescription>
            Decide qué puntajes activan cada resultado en el semáforo de aprobación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cutoffs.map((cutoff, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 border rounded-md" style={{ borderLeftColor: cutoff.color, borderLeftWidth: '4px' }}>
                <div className="w-32">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Acción</Label>
                  <p className="font-bold">{cutoff.action}</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={'min'+idx}>Puntaje Mínimo</Label>
                    <Input id={'min'+idx} type="number" value={isNaN(cutoff.min) ? '' : cutoff.min} onChange={(e) => updateCutoff(idx, 'min', e.target.value === '' ? 0 : parseInt(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={'max'+idx}>Puntaje Máximo</Label>
                    <Input id={'max'+idx} type="number" value={isNaN(cutoff.max) ? '' : cutoff.max} onChange={(e) => updateCutoff(idx, 'max', e.target.value === '' ? 0 : parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
 
      {/* FINANCIAL RISK THRESHOLDS */}
      <Card>
        <CardHeader>
          <CardTitle>Umbrales de Riesgo Financiero</CardTitle>
          <CardDescription>
            Parámetros utilizados en los semáforos del reporte institucional para evaluar el sobre-endeudamiento y gastos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-indigo-900 border-b pb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> % ENDEUDAMIENTO
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tope Riesgo Bajo</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={thresholds.edeMaxModerado} onChange={e => setThresholds({...thresholds, edeMaxModerado: parseFloat(e.target.value)})} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Hasta este % es Verde.</p>
                </div>
                <div className="space-y-2">
                  <Label>Tope Riesgo Moderado</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={thresholds.edeMaxCritico} onChange={e => setThresholds({...thresholds, edeMaxCritico: parseFloat(e.target.value)})} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Desde el anterior hasta este es Ámbar. Superado este es Rojo.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-amber-900 border-b pb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> % GASTO FAMILIAR
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tope Riesgo Bajo</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={thresholds.gastoMaxModerado} onChange={e => setThresholds({...thresholds, gastoMaxModerado: parseFloat(e.target.value)})} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Hasta este % es Verde.</p>
                </div>
                <div className="space-y-2">
                  <Label>Tope Riesgo Moderado</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={thresholds.gastoMaxCritico} onChange={e => setThresholds({...thresholds, gastoMaxCritico: parseFloat(e.target.value)})} />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Desde el anterior hasta este es Ámbar. Superado este es Rojo.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Variables Socio-Demográficas</CardTitle>
            <CardDescription>
              Agrega indicadores como Edad, Estado Civil o Instrucción, y asígnales los puntos correspondientes.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addVariable}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Variable
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {variables.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-md">No hay variables configuradas.</p>
          ) : null}

          {variables.map((variable, varIdx) => (
            <div key={variable.id} className="p-4 border rounded-lg bg-slate-50/50 space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => removeVariable(varIdx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div className="space-y-2">
                  <Label>Nombre del Indicador (Ej. Estado Civil)</Label>
                  <Input value={variable.name} onChange={(e) => updateVariable(varIdx, 'name', e.target.value)} placeholder="Nombre de la variable" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Evaluación</Label>
                  <Select value={variable.type} onValueChange={(val) => updateVariable(varIdx, 'type', val as 'exact'|'range')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">Respuesta Exacta (Texto Múltiple)</SelectItem>
                      <SelectItem value="range">Rango Numérico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RULES BLOCK */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold text-slate-700">Reglas y Puntajes</Label>
                  <Button variant="secondary" size="sm" onClick={() => addRule(varIdx, variable.type)}>
                    <Plus className="h-3 w-3 mr-1" /> Añadir Regla
                  </Button>
                </div>

                <div className="space-y-2">
                  {variable.rules.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No hay reglas definidas para esta variable.</p>
                  )}
                  {variable.rules.map((rule, ruleIdx) => (
                    <div key={ruleIdx} className="flex flex-wrap md:flex-nowrap items-end gap-2 bg-white p-2 border rounded shadow-sm">
                      {variable.type === 'exact' ? (
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Valor Exacto</Label>
                          <Input value={rule.value} onChange={(e) => updateRule(varIdx, ruleIdx, 'value', e.target.value)} placeholder="Ej. Soltero (a)" />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Mínimo</Label>
                            <Input type="number" value={isNaN(rule.min) ? '' : rule.min} onChange={(e) => updateRule(varIdx, ruleIdx, 'min', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Máximo</Label>
                            <Input type="number" value={isNaN(rule.max) ? '' : rule.max} onChange={(e) => updateRule(varIdx, ruleIdx, 'max', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                          </div>
                        </>
                      )}
                      
                      <div className="w-24 space-y-1">
                        <Label className="text-xs font-bold text-blue-700">Puntaje</Label>
                        <Input type="number" className="border-blue-300 font-bold text-blue-700" value={isNaN(rule.score) ? '' : rule.score} onChange={(e) => updateRule(varIdx, ruleIdx, 'score', e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                      </div>
                      
                      <Button variant="ghost" size="icon" onClick={() => removeRule(varIdx, ruleIdx)} className="mb-[2px] text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
