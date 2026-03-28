'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, Calculator, FileText, ArrowRight, TrendingUp, Save, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { updateSolicitud } from '@/app/actions/solicitudes'

interface HojaResumenProps {
  solicitud: any
  budgetData?: any
  qualitativeData?: any
  socioSnapshot?: any
  onNavigate?: (tab: string) => void
  onSaveResumen?: (data: any) => Promise<void>
  onFinalSubmit?: () => Promise<void>
  isLocked?: boolean
}

const EXPEDIENTE_ITEMS = [
  { id: 'liquidacion', label: '1. LIQUIDACIÓN DE PRÉSTAMO' },
  { id: 'propuesta', label: '2. PROPUESTA DE CRÉDITO' },
  { id: 'cronograma', label: '3. CRONOGRAMA DE PAGOS' },
  { id: 'estado_titular', label: '4. ESTADO DE CUENTA TITULAR Y CÓNYUGE' },
  { id: 'estado_aval', label: '5. ESTADO DE CUENTA DEL AVAL Y CÓNYUGE' },
  { id: 'pagare', label: '6. PAGARÉ' },
  { id: 'contrato_mutuo', label: '7. CONTRATO MUTUO' },
  { id: 'acuerdo_incompleto', label: '8. CONTRATO DE ACUERDO DE PAGARÉ INCOMPLETO' },
  { id: 'copia_dni', label: '9. COPIA DE DNI TITULAR, CÓNYUGE Y AVAL' },
  { id: 'central_titular', label: '10. CENTRAL DE RIESGO DEL TITULAR Y CÓNYUGE' },
  { id: 'central_avales', label: '11. CENTRAL DE RIESGO DE AVALES' },
  { id: 'foto_negocio', label: '12. FOTO DE NEGOCIO' },
  { id: 'foto_domicilio', label: '13. FOTO DE DOMICILIO' },
  { id: 'recibo_servicios', label: '14. RECIBO DE LUZ O DE AGUA' },
]

export function HojaResumen({ 
  solicitud, 
  budgetData, 
  qualitativeData, 
  socioSnapshot, 
  onNavigate, 
  onSaveResumen, 
  onFinalSubmit, 
  isLocked 
}: HojaResumenProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(solicitud?.datos_resumen?.checklist || {})
  const [excepcion, setExcepcion] = useState(solicitud?.datos_resumen?.excepcion || '')
  const [isSaving, setIsSaving] = useState(false)
  
  // Sync if solicitation changes
  useEffect(() => {
    if (solicitud?.datos_resumen) {
      setChecklist(solicitud.datos_resumen.checklist || {})
      setExcepcion(solicitud.datos_resumen.excepcion || '')
    }
  }, [solicitud?.id])

  const handleSaveChecklist = async () => {
    if (!onSaveResumen) return
    setIsSaving(true)
    try {
      await onSaveResumen({ checklist, excepcion })
    } finally {
      setIsSaving(false)
    }
  }
  // 1. Basic Calculations
  const monto = parseFloat(solicitud.monto_solicitado || 0)
  const tea = parseFloat(solicitud.tea || 0)
  const tem = parseFloat(solicitud.tem || 0)
  const plazo = parseInt(solicitud.plazo_meses || 0)
  const cuota = parseFloat(solicitud.cuota_mensual || 0)
  
  const pagoDiario = cuota / 30

  // 2. Capacity Calculations (from Budget Data)
  // We sum all income, expense and debt rows for Month 1 (stable representative month)
  const totalIngresos = budgetData?.ingresos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const totalGastos = budgetData?.gastos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const deudasFinancieras = budgetData?.deudas_financieras?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  
  const ingresosNetosGastos = totalIngresos - totalGastos
  const capacidadPrevia = ingresosNetosGastos - deudasFinancieras
  
  // Capacidad Libre is what stays AFTER paying the new cuota
  const capacidadLibreTotal = capacidadPrevia - cuota
  
  const cubreCuota = capacidadPrevia >= cuota
  const coberturaPorcentaje = cuota > 0 ? (capacidadPrevia / cuota) * 100 : 0

  // 3. Max Loan Calculation
  // We use the capacity BEFORE the new cuota to see how much more they could handle
  const i = tem / 100
  const n = plazo 
  const factorCuota = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
  const montoMaximo = factorCuota > 0 ? capacidadPrevia / factorCuota : 0

  // 4. Decision Matrix
  const scoreCualitativo = qualitativeData?.scoring?.titular?.total || 0
  const clasificacion = solicitud.clasificacion_override || 'Normal'
  
  // Logical Recommendation
  let recomendacion = 'APROBADO'
  let recomendacionColor = 'bg-green-600'
  
  if (!cubreCuota || (capacidadPrevia / cuota) < 1.1 || scoreCualitativo <= 220) {
    recomendacion = 'OBSERVADO'
    recomendacionColor = 'bg-amber-600'
  }
  
  if (capacidadPrevia < cuota * 0.8 || scoreCualitativo < 180) {
    recomendacion = 'DENEGADO'
    recomendacionColor = 'bg-red-600'
  }

  const isPresented = solicitud.estado === 'PRESENTADA' || solicitud.estado === 'APROBADO' || solicitud.estado === 'DENEGADO'

  const MetricItem = ({ label, value, subValue, color }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color || 'text-slate-800'}`}>{value}</p>
      {subValue && <p className="text-[9px] font-medium text-slate-500 mt-1">{subValue}</p>}
    </div>
  )

  const CheckItem = ({ label, status, targetTab }: { label: string; status: 'ok' | 'fail' | 'warn'; targetTab?: string }) => (
    <div 
      onClick={() => targetTab && onNavigate?.(targetTab)} 
      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
        targetTab ? 'hover:bg-indigo-50 hover:border-indigo-200 active:scale-[0.98]' : 'bg-slate-50 border-slate-100'
      }`}
    >
      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
          status === 'ok' ? 'bg-green-100 text-green-700' : 
          status === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          {status === 'ok' ? 'Cumple' : status === 'warn' ? 'Observado' : 'No Cumple'}
        </span>
        {status === 'ok' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
         status === 'warn' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" /> HOJA DE RESUMEN DE EVALUACIÓN
          </h2>
          <p className="text-slate-500 text-sm font-medium">Consolidado de resultados y dictamen final del analista</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <Badge variant="outline" className="text-[10px] font-black border-indigo-200 text-indigo-700 px-3 py-1 uppercase tracking-widest shadow-sm">
            {solicitud?.numero_solicitud ? `SOLICITUD: ${solicitud.numero_solicitud}` : 'ESTADO: BORRADOR'}
          </Badge>
          <Button 
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1 h-8 rounded-lg flex items-center gap-2 shadow-md text-[9px] uppercase tracking-tighter transition-all hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" /> Imprimir Reporte Profesional
          </Button>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Socio: {socioSnapshot?.nombres_apellidos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricItem label="Monto Solicitado" value={`S/ ${monto.toLocaleString()}`} subValue={`Plazo: ${plazo} meses`} color="text-indigo-600" />
        <MetricItem label="TEA Aplicada" value={`${tea}%`} subValue={`TEM: ${tem}%`} color="text-slate-800" />
        <MetricItem label="Cuota Mensual" value={`S/ ${cuota.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="text-indigo-700" />
        <MetricItem label="Pago Diario (Est.)" value={`S/ ${pagoDiario.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="text-indigo-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CALCULO DE CAPACIDAD */}
        <Card className="shadow-md border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b py-4">
            <CardTitle className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-500" /> Cálculo de Capacidad de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold">
              <span className="text-slate-500">Ingresos brutos:</span>
              <span className="text-right text-slate-800">S/ {totalIngresos.toLocaleString()}</span>
              <span className="text-slate-500">Gastos familiares:</span>
              <span className="text-right text-red-600">- S/ {totalGastos.toLocaleString()}</span>
              <span className="text-slate-500">Ingresos netos de gastos:</span>
              <span className="text-right text-indigo-600">S/ {ingresosNetosGastos.toLocaleString()}</span>
              <span className="text-slate-500">Otros pagos de deudas:</span>
              <span className="text-right text-red-600">- S/ {deudasFinancieras.toLocaleString()}</span>
              <div className="col-span-2 h-px bg-slate-200 my-2"></div>
              <span className="text-sm font-black text-slate-800 uppercase">Capacidad Sobra (Mensual):</span>
              <span className={`text-sm font-black text-right ${capacidadLibreTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                S/ {capacidadLibreTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className={`mt-6 p-4 rounded-xl border-2 flex items-center justify-between ${cubreCuota ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">¿Cubre Cuota de S/ {cuota.toLocaleString()}?</p>
                  <p className={`text-xl font-black ${cubreCuota ? 'text-green-700' : 'text-red-700'}`}>
                    {cubreCuota ? 'SÍ CUBRE' : 'NO CUBRE'}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Margen de Cobertura</p>
                  <p className={`text-lg font-black ${cubreCuota ? 'text-green-600' : 'text-red-600'}`}>
                    {coberturaPorcentaje.toFixed(0)} %
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* DECISION FINAL */}
        <Card className="shadow-md border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b py-4">
            <CardTitle className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" /> Matriz de Decisión Final
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
             <CheckItem 
               label={`Cumple Clasificación Riesgo (${clasificacion})`} 
               status={
                 clasificacion === 'Normal' || 
                 clasificacion === 'AA' || 
                 clasificacion.includes('Premium') || 
                 clasificacion.includes('A-1') 
                 ? 'ok' : 'warn'
               } 
               targetTab="solicitud" 
             />
             <CheckItem label="Capacidad de Pago Mensual" status={cubreCuota ? 'ok' : 'fail'} targetTab="evaluacion" />
             <CheckItem 
               label={`Evaluación Cualitativa (Score: ${scoreCualitativo} pts)`} 
               status={scoreCualitativo > 220 ? 'ok' : scoreCualitativo >= 181 ? 'warn' : 'fail'} 
               targetTab="cualitativa" 
             />
             <CheckItem label="Aportes Disponibles (Neto)" status="ok" targetTab="solicitud" />
             
             <div className="mt-6">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 text-center tracking-[4px]">DICTAMEN SUGERIDO</p>
                <div className={`${recomendacionColor} text-white p-5 rounded-2xl text-center shadow-lg transform transition-transform hover:scale-[1.02] duration-300`}>
                  <p className="text-2xl font-black uppercase tracking-tighter">{recomendacion}</p>
                  <p className="text-[9px] font-bold opacity-80 mt-1">BASADO EN LOS PARÁMETROS DE RIESGO DE ARISK ENGINE</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* MAX CAPACITY BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-8 rounded-3xl shadow-xl border border-indigo-700 relative overflow-hidden group">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Calculator className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
              <TrendingUp className="w-12 h-12 text-white" />
           </div>
           <div>
              <p className="text-indigo-200 text-xs font-black uppercase tracking-[3px] mb-2 text-center md:text-left">Límite Máximo Estimado</p>
              <h3 className="text-white text-4xl md:text-5xl font-black tracking-tighter text-center md:text-left">
                S/ {montoMaximo.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-indigo-300 text-[10px] font-medium mt-3 text-center md:text-left max-w-lg">
                Este es el monto máximo que el socio podría financiar basado en su capacidad previa de 
                <span className="text-white font-bold"> S/ {capacidadPrevia.toLocaleString()} </span> 
                y el plazo de <span className="text-white font-bold">{n} meses</span> del producto actual.
              </p>
           </div>
           <div className="flex-1 flex justify-center md:justify-end gap-3 print:hidden">
             <Button 
               variant="outline" 
               onClick={() => window.print()}
               className="bg-white border-white text-indigo-900 hover:bg-slate-100 font-black h-14 px-8 rounded-xl gap-2 shadow-2xl"
             >
               IMPRIMIR REPORTE <ArrowRight className="w-5 h-5" />
             </Button>

             {!isPresented && (
               <Button 
                onClick={onFinalSubmit}
                disabled={isSaving || isLocked}
                className="bg-green-500 hover:bg-green-600 text-white font-black h-14 px-8 rounded-xl gap-2 shadow-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
               >
                 ENVIAR A APROBACIÓN <ShieldCheck className="w-5 h-5" />
               </Button>
             )}
           </div>
        </div>
      </div>

      {/* SIGNATURE BLOCK FOR PRINT */}
      <div className="hidden print:block mt-24">
        <div className="flex justify-center flex-col items-center">
          <div className="w-64 border-t-2 border-slate-900"></div>
          <p className="text-xs font-black uppercase mt-2">Firma del Asesor de Créditos</p>
          <p className="text-[10px] text-slate-500 uppercase mt-1">DNI: {solicitud.analista?.dni || ''}</p>
        </div>
      </div>

      {/* CHECKLIST SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-500" /> Check List Expediente de Crédito
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleSaveChecklist}
              disabled={isSaving || isLocked}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 h-8 text-[10px]"
            >
              {isSaving ? 'Guardando...' : <span className="flex items-center gap-2"><Save className="w-3 h-3" /> GUARDAR CHECK LIST</span>}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={EXPEDIENTE_ITEMS.every(item => checklist[item.id])}
                  onCheckedChange={(checked) => {
                    const newChecklist = { ...checklist }
                    EXPEDIENTE_ITEMS.forEach(item => newChecklist[item.id] = !!checked)
                    setChecklist(newChecklist)
                  }}
                  disabled={isLocked}
                />
                <label htmlFor="select-all" className="text-[10px] font-black text-indigo-600 cursor-pointer uppercase">SELECCIONAR TODO</label>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{Object.values(checklist).filter(Boolean).length} / {EXPEDIENTE_ITEMS.length} COMPLETADOS</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
              {EXPEDIENTE_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <Checkbox 
                    id={item.id} 
                    checked={checklist[item.id] || false}
                    onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, [item.id]: !!checked }))}
                    disabled={isLocked}
                    className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <label 
                    htmlFor={item.id} 
                    className="text-[10px] font-bold text-slate-600 leading-none cursor-pointer uppercase tracking-tight"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b py-4">
            <CardTitle className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Solicitud de Excepción
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-[10px] text-slate-500 font-medium italic">
              * En caso de no contar con algún documento obligatorio en este momento, sustente la excepción aquí para revisión del comité.
            </p>
            <Textarea 
              placeholder="Escriba aquí los motivos de la excepción..."
              className="min-h-[180px] text-xs bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              value={excepcion}
              onChange={(e) => setExcepcion(e.target.value)}
              disabled={isLocked}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
