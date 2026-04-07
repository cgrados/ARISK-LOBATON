'use client'

import { useState, useMemo, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils/format'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Calculator, ArrowRight, ArrowLeft, Info, AlertCircle, CheckCircle2, ShieldCheck, Pencil } from 'lucide-react'
import { savePresupuesto } from '@/app/actions/solicitudes'
import { useRouter } from 'next/navigation'

interface PresupuestoFamiliarProps {
  solicitudId: string
  initialData?: any
  cuotaSolicitada: number
  socioIncome: number
  socioCompany: string
  onSaveSuccess?: () => void
  onAdvance?: () => void
  isLocked?: boolean
}

const MONTHS = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6']

// Sub-component moved outside to prevent re-mounting on every render
const SectionHeader = ({ title, color }: { title: string; color: string }) => (
  <div className={`py-1.5 px-4 ${color} text-white font-bold text-xs uppercase tracking-wider mb-2`}>{title}</div>
)

interface BudgetTableProps {
  rows: any[]
  setter: any
  section: string
  onValueChange: (setter: any, rowIndex: number, monthIndex: number, value: string, section: string) => void
  onLabelChange: (setter: any, rowIndex: number, label: string) => void
}

const BudgetTable = ({ rows, setter, section, onValueChange, onLabelChange }: BudgetTableProps) => (
  <div className="overflow-x-auto border border-slate-200 rounded-lg mb-6">
    <table className="min-w-[800px] w-full text-xs text-left border-collapse">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-2 border font-bold text-slate-700 w-[20%]">CONCEPTO</th>
          {MONTHS.map(m => <th key={m} className="p-2 border text-center font-bold text-slate-700 w-[10%] text-[10px]">{m}</th>)}
          <th className="p-2 border text-center font-bold bg-slate-200 w-[20%]">TOTAL PERIODO</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any, rowIndex: number) => {
          const rowTotal = row.values.reduce((a: number, b: number) => a + b, 0)
          return (
            <tr key={`row-${section}-${rowIndex}`} className="hover:bg-slate-50">
              <td className="p-1 border font-medium text-slate-600 bg-slate-50/30">
                <div className="flex items-center gap-1.5 px-2">
                  <Input 
                    value={row.label} 
                    onChange={e => onLabelChange(setter, rowIndex, e.target.value)}
                    className="h-7 text-[11px] font-semibold border-none bg-transparent focus-visible:ring-0 p-0 hover:bg-white/50 transition-colors"
                    placeholder="Nombre del concepto..."
                  />
                  <Pencil className="w-2.5 h-2.5 text-slate-300 pointer-events-none" />
                </div>
              </td>
              {MONTHS.map((_, i) => (
                <td key={i} className="p-1 border text-center">
                  <Input 
                    type="number" 
                    value={row.values[i] || ''} 
                    onChange={e => onValueChange(setter, rowIndex, i, e.target.value, section)}
                    className="h-7 text-right px-1 text-[11px] font-semibold border-none bg-transparent focus-visible:ring-0"
                  />
                </td>
              ))}
              <td className="p-1.5 border text-right font-bold bg-slate-50/50">{formatCurrency(rowTotal)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export function PresupuestoFamiliar({ 
  solicitudId, 
  initialData, 
  cuotaSolicitada, 
  socioIncome, 
  socioCompany, 
  onSaveSuccess, 
  onAdvance,
  isLocked
}: PresupuestoFamiliarProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [ahorroInicial, setAhorroInicial] = useState(initialData?.ahorro_inicial || 0)
  
  const [ingresos, setIngresos] = useState<any[]>([
    { label: 'Ingreso # 1', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Ingreso # 2', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Otros ingresos', values: [0, 0, 0, 0, 0, 0] },
  ])

  const [gastos, setGastos] = useState<any[]>([
    { label: 'Alquiler de vivienda', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Agua, Luz, Teléfono, Internet', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Alimentos hogar', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Transporte (Taxis, Micro, etc)', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Educación', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Plan médico y medicamentos', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Higiene, Ropa y calzado', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Otros gastos', values: [0, 0, 0, 0, 0, 0] },
  ])

  const [deudas, setDeudas] = useState<any[]>([
    { label: 'Tarjetas de crédito', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Cuotas otros créditos', values: [0, 0, 0, 0, 0, 0] },
    { label: 'Otras deudas', values: [0, 0, 0, 0, 0, 0] },
  ])

  useEffect(() => {
    // Priority 1: If we have saved data from database
    if (initialData && Object.keys(initialData).length > 0) {
      if (initialData.ingresos_detalle && Array.isArray(initialData.ingresos_detalle)) {
         const current = [...initialData.ingresos_detalle]
         
         // Aggressive sync for the first row if it belongs to the main activity
         const isDefaultLabel = !current[0]?.label || current[0]?.label === 'Ingreso # 1' || current[0]?.label === 'POR DEFINIR'
         const matchesCompany = current[0]?.label === socioCompany
         
         if (socioCompany && (isDefaultLabel || matchesCompany)) {
            current[0] = { ...current[0], label: socioCompany }
            
            // Sync values if they were previously synced (all same) or all zero
            const firstVal = current[0].values?.[0] || 0
            const allSame = current[0].values?.every((v: number) => v === firstVal)
            if (allSame || firstVal === 0) {
               current[0].values = Array(6).fill(socioIncome || 0)
            }
         }
         setIngresos(current)
      } else if (initialData.ingresos_detalle) {
        const migrated = Object.entries(initialData.ingresos_detalle).map(([label, v]: any) => ({ label, values: Array.isArray(v) ? v : [v, v, v, v, v, v] }))
        setIngresos(migrated)
      }
      
      if (initialData.gastos_detalle && Array.isArray(initialData.gastos_detalle)) setGastos(initialData.gastos_detalle)
      else if (initialData.gastos_detalle) {
          const migrated = Object.entries(initialData.gastos_detalle).map(([label, v]: any) => ({ label, values: Array.isArray(v) ? v : [v, v, v, v, v, v] }))
          setGastos(migrated)
      }

      if (initialData.deudas_financieras && Array.isArray(initialData.deudas_financieras)) setDeudas(initialData.deudas_financieras)
      else if (initialData.deudas_financieras) {
          const migrated = Object.entries(initialData.deudas_financieras).map(([label, v]: any) => ({ label, values: Array.isArray(v) ? v : [v, v, v, v, v, v] }))
          setDeudas(migrated)
      }

      if (initialData.ahorro_inicial) setAhorroInicial(initialData.ahorro_inicial)
    } 
    // Priority 2: New evaluation initialization
    else if (socioIncome || socioCompany) {
      setIngresos(prev => {
        const newData = [...prev]
        newData[0] = { 
          ...newData[0], 
          label: socioCompany || 'Ingreso # 1',
          values: Array(6).fill(socioIncome || 0) 
        }
        return newData
      })
    }
  }, [initialData?.id || '', socioIncome, socioCompany])


  const handleValueChange = (setter: any, rowIndex: number, monthIndex: number, value: string, section: string) => {
    const num = parseFloat(value) || 0
    setter((prev: any[]) => {
      const newData = [...prev]
      const row = { ...newData[rowIndex] }
      const newValues = [...row.values]
      
      newValues[monthIndex] = num

      // Global Rule: Value in Mes 1 propagates to all subsequent months (2-6)
      if (monthIndex === 0) {
        for (let i = 1; i < 6; i++) {
          newValues[i] = num
        }
      }

      row.values = newValues
      newData[rowIndex] = row
      return newData
    })
  }

  const handleLabelChange = (setter: any, rowIndex: number, label: string) => {
    setter((prev: any[]) => {
      const newData = [...prev]
      newData[rowIndex] = { ...newData[rowIndex], label }
      return newData
    })
  }

  const totals = useMemo(() => {
    const monthlyTotalIngresos = MONTHS.map((_, i) => ingresos.reduce((sum, row) => sum + (row.values[i] || 0), 0))
    const monthlyTotalGastos = MONTHS.map((_, i) => gastos.reduce((sum, row) => sum + (row.values[i] || 0), 0))
    const monthlyTotalDeudas = MONTHS.map((_, i) => deudas.reduce((sum, row) => sum + (row.values[i] || 0), 0) + cuotaSolicitada)

    const ingresosMenosGastos = monthlyTotalIngresos.map((val, i) => val - monthlyTotalGastos[i])
    const saldoFinal = ingresosMenosGastos.map((val, i) => val - monthlyTotalDeudas[i])

    const ahorrosProgress = []
    let currentAhorro = ahorroInicial
    for (let i = 0; i < 6; i++) {
        const mesInicio = currentAhorro
        const deposito = saldoFinal[i]
        const mesFin = mesInicio + deposito
        ahorrosProgress.push({ inicio: mesInicio, deposito, fin: mesFin })
        currentAhorro = mesFin
    }

    return {
      monthlyTotalIngresos,
      monthlyTotalGastos,
      monthlyTotalDeudas,
      ingresosMenosGastos,
      saldoFinal,
      ahorrosProgress,
      totalIngresos: monthlyTotalIngresos.reduce((a, b) => a + b, 0),
      totalGastos: monthlyTotalGastos.reduce((a, b) => a + b, 0),
      totalDeudas: monthlyTotalDeudas.reduce((a, b) => a + b, 0),
    }
  }, [ingresos, gastos, deudas, cuotaSolicitada, ahorroInicial])

  const indicators = useMemo(() => {
    const hasIngresos = totals.totalIngresos > 0
    const gastoVsIngreso = hasIngresos ? (totals.totalGastos / totals.totalIngresos) * 100 : 0
    const deudaVsIngreso = hasIngresos ? (totals.totalDeudas / totals.totalIngresos) * 100 : 0
    
    let semaforoAhorro = 'ROJO'
    if (gastoVsIngreso < 70) semaforoAhorro = 'VERDE'
    else if (gastoVsIngreso < 90) semaforoAhorro = 'AMARILLO'

    let semaforoDeuda = 'VERDE'
    if (deudaVsIngreso > 40) semaforoDeuda = 'ROJO'
    else if (deudaVsIngreso > 30) semaforoDeuda = 'AMARILLO'

    return { gastoVsIngreso, deudaVsIngreso, semaforoAhorro, semaforoDeuda }
  }, [totals])

  const handleSave = async (shouldExit: boolean = false) => {
    setIsPending(true)
    try {
      await savePresupuesto(solicitudId, {
        ingresos_detalle: ingresos,
        gastos_detalle: gastos,
        deudas_financieras: deudas,
        ahorro_inicial: ahorroInicial,
        porcentaje_endeudamiento: indicators.deudaVsIngreso,
        semaforo_ahorro: indicators.semaforoAhorro,
        semaforo_endeudamiento: indicators.semaforoDeuda
      })
      alert('Evaluación presupuestaria guardada correctamente.')
      onSaveSuccess?.()
      if (shouldExit) {
        router.push('/solicitudes')
      } else if (onAdvance) {
        onAdvance()
      }
    } catch (err: any) { 
      alert(err.message) 
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-t-4 border-t-indigo-600 shadow-xl lg:max-w-[1200px] mx-auto">
        <CardHeader className="flex flex-row items-center justify-between py-4 bg-slate-50/50 border-b">
          <CardTitle className="text-xl flex items-center gap-2 text-indigo-900 uppercase">
            <Calculator className="w-6 h-6 text-indigo-600" /> Evaluación Financiera (6 Meses)
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Ahorro Inicial S/</Label>
              <Input 
                type="number" 
                value={ahorroInicial} 
                onChange={e => setAhorroInicial(parseFloat(e.target.value) || 0)}
                className="h-8 w-24 text-right font-bold border-indigo-200"
              />
            </div>
            <Button onClick={() => handleSave(false)} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 font-bold uppercase transition-all hover:shadow-lg">
              <Save className="w-4 h-4 mr-2" /> Guardar Evaluación
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          
          <SectionHeader title="Ingresos Mensuales / Origen del Ingreso" color="bg-blue-600" />
          <BudgetTable rows={ingresos} setter={setIngresos} section="ingresos" onValueChange={handleValueChange} onLabelChange={handleLabelChange} />
          
          <div className="bg-blue-50 p-2 text-right font-bold text-blue-900 border mb-6 flex justify-between px-6 items-center rounded-md">
            <span>TOTAL INGRESOS (6 MESES):</span>
            <span className="text-lg">{formatCurrency(totals.totalIngresos)}</span>
          </div>

          <SectionHeader title="Gastos Familiares Detallados" color="bg-slate-600" />
          <BudgetTable rows={gastos} setter={setGastos} section="gastos" onValueChange={handleValueChange} onLabelChange={handleLabelChange} />
          
          <div className="bg-slate-100 p-2 text-right font-bold text-slate-900 border mb-6 flex justify-between px-6 items-center rounded-md">
            <span>TOTAL GASTOS (6 MESES):</span>
            <span className="text-lg">{formatCurrency(totals.totalGastos)}</span>
          </div>

          <div className="bg-indigo-100 p-3 text-right font-bold text-indigo-900 border-2 border-indigo-200 mb-6 flex justify-between px-6 items-center text-sm rounded-lg shadow-inner">
            <span>DISPONIBLE (INGRESOS - GASTOS):</span>
            <span className="text-xl">{formatCurrency(totals.totalIngresos - totals.totalGastos)}</span>
          </div>

          <SectionHeader title="Gastos Financieros (Deudas)" color="bg-amber-600" />
          <div className="overflow-x-auto border border-slate-200 rounded-lg mb-6">
            <table className="min-w-[800px] w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border font-bold text-slate-700 w-[20%]">CONCEPTO</th>
                  {MONTHS.map(m => <th key={m} className="p-2 border text-center font-bold text-slate-700 w-[10%] text-[10px]">{m}</th>)}
                  <th className="p-2 border text-center font-bold bg-slate-200 w-[20%]">TOTAL PERIODO</th>
                </tr>
              </thead>
              <tbody>
                {deudas.map((row, rowIndex) => (
                  <tr key={`deuda-${rowIndex}`}>
                    <td className="p-1 border font-medium text-slate-600 bg-slate-50/30">
                      <div className="flex items-center gap-1.5 px-2">
                        <Input 
                          value={row.label} 
                          onChange={e => handleLabelChange(setDeudas, rowIndex, e.target.value)}
                          className="h-7 text-[11px] font-semibold border-none bg-transparent p-0"
                        />
                        <Pencil className="w-2.5 h-2.5 text-slate-300 pointer-events-none" />
                      </div>
                    </td>
                    {MONTHS.map((_, i) => (
                      <td key={i} className="p-1 border text-center">
                        <Input 
                          type="number" 
                          value={row.values[i] || ''} 
                          onChange={e => handleValueChange(setDeudas, rowIndex, i, e.target.value, 'deudas')}
                          className="h-7 text-right px-1 text-[11px] font-semibold border-none bg-transparent"
                        />
                      </td>
                    ))}
                    <td className="p-1.5 border text-right font-bold">{formatCurrency(row.values.reduce((a: number, b: number) => a + b, 0))}</td>
                  </tr>
                ))}
                <tr className="bg-indigo-50/50">
                  <td className="p-2 border font-bold text-indigo-700 pl-4 bg-indigo-50/80">
                    Cuota Crédito a Solicitar
                  </td>
                  {MONTHS.map((_, i) => (
                    <td key={i} className="p-2 border text-right font-bold text-indigo-900">{formatCurrency(cuotaSolicitada)}</td>
                  ))}
                  <td className="p-2 border text-right font-bold bg-indigo-100 text-indigo-900">{formatCurrency(cuotaSolicitada * 6)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* INDICATORS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
            <Card className="bg-slate-50 border-2 lg:col-span-2">
              <CardHeader className="py-3 border-b"><CardTitle className="text-sm uppercase font-bold text-slate-700">Resumen y Diagnóstico de Capacidad</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Capacidad Sobra Mensual (Promedio)</p>
                    <p className={`text-xl font-black ${totals.totalDeudas / 6 < totals.totalIngresos / 6 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totals.totalIngresos / 6 - totals.totalGastos / 6 - totals.totalDeudas / 6)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">% Gasto s/ Ingreso</p>
                    <p className="text-xl font-black text-slate-800">{indicators.gastoVsIngreso.toFixed(1)} %</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">% Endeudamiento</p>
                    <p className={`text-xl font-black ${indicators.deudaVsIngreso > 40 ? 'text-red-600' : 'text-indigo-600'}`}>{indicators.deudaVsIngreso.toFixed(1)} %</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-white to-slate-50 border-2 border-indigo-100 shadow-sm">
                  <p className="text-xs text-indigo-800 font-bold uppercase flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" /> Conclusión Automática:
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700 font-medium italic">
                    {indicators.deudaVsIngreso > 40 
                      ? "⚠️ ATENCIÓN: El socio se encuentra en estado de sobreendeudamiento. El pago mensual de deudas consume más del 40% de sus ingresos, lo que representa un riesgo alto."
                      : "✅ CAPACIDAD ÓPTIMA: El nivel de endeudamiento es saludable y permite la asunción de la nueva cuota sin comprometer la canasta básica familiar."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col p-6 shadow-sm border-2">
               <CardTitle className="text-sm uppercase font-bold text-center text-slate-700 mb-6 border-b pb-2">Semáforos de Riesgo</CardTitle>
               <div className="flex justify-around items-center flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Ahorro</p>
                    <div className="flex flex-col gap-1.5 p-2 bg-slate-900 rounded-2xl w-14">
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoAhorro === 'ROJO' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-red-900/30'}`}></div>
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoAhorro === 'AMARILLO' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-amber-900/30'}`}></div>
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoAhorro === 'VERDE' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-green-900/30'}`}></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Deuda</p>
                    <div className="flex flex-col gap-1.5 p-2 bg-slate-900 rounded-2xl w-14">
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoDeuda === 'ROJO' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-red-900/30'}`}></div>
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoDeuda === 'AMARILLO' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-amber-900/30'}`}></div>
                      <div className={`w-10 h-10 rounded-full ${indicators.semaforoDeuda === 'VERDE' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-green-900/30'}`}></div>
                    </div>
                  </div>
               </div>
               <div className="mt-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${indicators.semaforoDeuda === 'VERDE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {indicators.semaforoDeuda === 'VERDE' ? 'RIESGO BAJO' : 'RIESGO CRÍTICO'}
                  </span>
               </div>
            </Card>
          </div>
          
          <div className="mt-10 pt-6 border-t border-dashed">
            <SectionHeader title="Proyección de Ahorros / Saldo Final Acumulado" color="bg-indigo-800" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {totals.ahorrosProgress.map((ah, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg border text-center hover:bg-slate-100 transition-colors">
                  <p className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-tighter">Mes {i+1}</p>
                  <p className={`text-[11px] font-bold ${ah.deposito >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ah.deposito >= 0 ? '+' : ''} {formatCurrency(ah.deposito)}
                  </p>
                  <div className="h-0.5 bg-slate-200 my-1 w-2/3 mx-auto"></div>
                  <p className="text-xs font-black text-slate-800">{formatCurrency(ah.fin)}</p>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
        <div className="flex justify-end gap-4 p-6 border-t border-dashed bg-slate-50/30">
          <Button 
            variant="outline"
            disabled={isPending || isLocked} 
            onClick={() => handleSave(true)} 
            className="border-slate-300 text-slate-600 hover:bg-slate-50 h-12 px-8 font-black uppercase text-sm tracking-widest transition-all gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> {isPending ? 'Saliendo...' : 'Guardar y salir'}
          </Button>

          <Button                  disabled={isPending || isLocked}
 
            onClick={() => handleSave(false)} 
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 font-black uppercase text-sm tracking-widest shadow-lg hover:shadow-indigo-200 transition-all gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> {isPending ? 'Guardando...' : 'Guardar y avanzar'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
