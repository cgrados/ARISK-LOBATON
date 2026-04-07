'use client'

import { useState, useTransition, useMemo, useCallback, useEffect } from 'react'
import { formatCurrency, formatNumber, parseFormattedNumber } from '@/lib/utils/format'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { searchSocioByDni, createSolicitud, updateSolicitud } from '@/app/actions/solicitudes'
import { PresupuestoFamiliar } from './PresupuestoFamiliar'
import { Search, TrendingUp, Pencil, AlertTriangle, Plus, Trash2, ClipboardCheck, ArrowRight, ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import { EvaluacionCualitativa } from './EvaluacionCualitativa'
import { HojaResumen } from './HojaResumen'
import { InstitutionalReport } from '@/components/reports/InstitutionalReport'
import { useRouter } from 'next/navigation'
import { calculateFullScoring } from '@/lib/scoring-logic'

interface CreditConfig {
  products?: any[]
  special?: any[]
  categories?: string[]
  moratoria?: { tea: number; tem: number }
}

const PERSONAL_FIELDS = [
  'nro_cuenta', 'nombres_apellidos', 'direccion', 'condicion_vivienda',
  'distrito', 'provincia', 'departamento', 'fecha_nacimiento',
  'instruccion', 'profesion_oficio', 'estado_civil', 'sexo',
  'telefono', 'nro_dependientes', 'clasificacion_central_riesgo', 'aportes_totales',
] as const

const LABOR_FIELDS = [
  'empresa_laboral', 'ruc_empresa', 'direccion_negocio', 'distrito_negocio',
  'cargo', 'ingreso_bruto_mensual', 'fecha_ingreso_laboral', 'tipo_empresa', 'actividad_economica',
] as const

const ALL_EDITABLE = [...PERSONAL_FIELDS, ...LABOR_FIELDS, 'calificacion_interna'] as const

const FIELD_LABELS: Record<string, string> = {
  nro_cuenta: 'Cuenta', nombres_apellidos: 'Nombres', direccion: 'Dirección',
  distrito: 'Distrito', provincia: 'Provincia', departamento: 'Departamento',
  telefono: 'Teléfono', estado_civil: 'Estado Civil', nro_dependientes: 'Dependientes',
  ingreso_bruto_mensual: 'Ingreso S/', cargo: 'Cargo', empresa_laboral: 'Empresa',
  ruc_empresa: 'RUC', cargo_laboral: 'Cargo', empresa: 'Empresa',
  ruc: 'RUC', direccion_negocio: 'Dir. Negocio', distrito_negocio: 'Dist. Negocio', aportes_totales: 'Aportes S/',
  clasificacion_central_riesgo: 'Riesgo Central', calificacion_interna: 'Calif. Interna', tipo_empresa: 'Tamaño Empresa', 
  sexo: 'Sexo', fecha_nacimiento: 'Fec. Nac.', instruccion: 'Instrucción', profesion_oficio: 'Profesión', fecha_ingreso_laboral: 'Fec. Ingreso'
}

function buildSnapshot(socio: any): Record<string, any> {
  const snap: Record<string, any> = {}
  for (const key of ALL_EDITABLE) {
    snap[key] = socio[key] ?? ''
  }
  snap.dni = socio.dni
  return snap
}

const EditableField = ({ fieldKey, type = 'text', colSpan, editData, originalData, setField }: { fieldKey: string; type?: string; colSpan?: string; editData: any; originalData: any; setField: any }) => {
    const isChanged = String(editData[fieldKey] ?? '') !== String(originalData[fieldKey] ?? '')
    return (
      <div className={`space-y-1 ${colSpan || ''}`}>
        <Label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">{FIELD_LABELS[fieldKey] || fieldKey} {isChanged && <Pencil className="w-2.5 h-2.5 text-blue-500" />}</Label>
        <Input type={type} value={editData[fieldKey] ?? ''} onChange={e => setField(fieldKey, e.target.value)} className={`h-8 text-xs ${isChanged ? 'bg-blue-50 border-blue-200' : 'bg-amber-50/20'}`} />
      </div>
    )
}
 
const EditableSelectField = ({ fieldKey, colSpan, options, editData, originalData, setField }: { fieldKey: string; colSpan?: string; options: string[]; editData: any; originalData: any; setField: any }) => {
    const isChanged = String(editData[fieldKey] ?? '') !== String(originalData[fieldKey] ?? '')
    return (
      <div className={`space-y-1 ${colSpan || ''}`}>
        <Label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
          {FIELD_LABELS[fieldKey] || fieldKey} {isChanged && <Pencil className="w-2.5 h-2.5 text-blue-500" />}
        </Label>
        <Select value={editData[fieldKey] ?? ''} onValueChange={v => setField(fieldKey, v)}>
          <SelectTrigger className={`h-8 text-xs ${isChanged ? 'bg-blue-50 border-blue-200' : 'bg-amber-50/20'}`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map((opt: string) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
}

export function SolicitudForm({ 
  creditConfig, 
  scoringConfig,
  initialData, 
  budgetData 
}: { 
  creditConfig: CreditConfig; 
  scoringConfig?: any;
  initialData?: any; 
  budgetData?: any 
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('solicitud')


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  const products = creditConfig?.products || []
  const categories = creditConfig?.categories || []

  const [searchDni, setSearchDni] = useState('')
  const [socio, setSocio] = useState<any>(initialData?.socios || null)

  const [editData, setEditData] = useState<Record<string, any>>({})
  const [originalData, setOriginalData] = useState<Record<string, any>>({})
  const [clasificacionOverride, setClasificacionOverride] = useState<string>('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [changedFields, setChangedFields] = useState<string[]>([])
  
  const [hasConyuge, setHasConyuge] = useState(false)
  const [conyuge, setConyuge] = useState<any>(initialData?.datos_conyuge || {})
  const [searchConyugeDni, setSearchConyugeDni] = useState('')

  const [hasAvales, setHasAvales] = useState(false)
  const [patrimonio, setPatrimonio] = useState<any[]>([
    { id: '1', nombre: 'Bienes Inmuebles (Casas, Terrenos)', hipotecado: 'NO', valor: 0 },
    { id: '2', nombre: 'Vehículos, otros bienes muebles', hipotecado: 'NO', valor: 0 },
    { id: '3', nombre: 'Depósitos, ahorros líquidos', hipotecado: 'NO', valor: 0 },
  ])

  const [avales, setAvales] = useState<any[]>([])
  const [qualitativeState, setQualitativeState] = useState<any>(initialData?.datos_cualitativos || {})

  const [credito, setCredito] = useState({
    producto: '',
    monto_solicitado: '',
    destino_credito: '',
    plazo_meses: '',
  })

  useEffect(() => {
    if (initialData) {
      setQualitativeState(initialData.datos_cualitativos || {})
      setSearchDni(initialData.socios?.dni || '')
      setEditData(initialData.datos_socio_snapshot || {})
      setOriginalData(initialData.datos_socio_snapshot || {})
      setClasificacionOverride(initialData.clasificacion_override || 'Normal') 
      setCredito({
        producto: initialData.producto || '',
        monto_solicitado: String(initialData.monto_solicitado || ''),
        destino_credito: initialData.destino_credito || '',
        plazo_meses: String(initialData.plazo_meses || ''),
      })
      if (initialData.datos_patrimoniales && Array.isArray(initialData.datos_patrimoniales)) {
        setPatrimonio(initialData.datos_patrimoniales)
      }
      if (initialData.datos_avales && Array.isArray(initialData.datos_avales)) {
        setAvales(initialData.datos_avales)
        if (initialData.datos_avales.length > 0) setHasAvales(true)
      }
      if (initialData.datos_conyuge) {
        setConyuge(initialData.datos_conyuge)
        if (initialData.datos_conyuge.dni) setHasConyuge(true)
      }
    }
  }, [initialData]) // Trigger on initialData update

  // Helper para obtener opciones dinámicas desde el motor de evaluación (scoringConfig)
  const getDynamicOptions = (variableName: string, defaultOptions: string[]) => {
    if (!scoringConfig?.variables) return defaultOptions
    
    // Buscar la variable por nombre (ignorando mayúsculas/minúsculas)
    const variable = scoringConfig.variables.find((v: any) => 
      v.name.toLowerCase().includes(variableName.toLowerCase())
    )
    
    if (variable?.type === 'exact' && variable.rules?.length > 0) {
      return variable.rules.map((r: any) => r.value).filter(Boolean)
    }
    
    return defaultOptions
  }

  const centralOptions = getDynamicOptions('Clasificación Central', ["Normal", "CPP", "Deficiente", "Dudoso", "Pérdida"])
  const internalOptions = getDynamicOptions('Clasificación interna', ["Normal", "CPP", "Deficiente"])
  const estadoCivilOptions = getDynamicOptions('Estado Civil', ["SOLTERO (A)", "CASADO (A)", "DIVORCIADO (A)", "VIUDO (A)", "CONVIVIENTE"])
  const instruccionOptions = getDynamicOptions('Instrucción', ["PRIMARIA", "SECUNDARIA", "TÉCNICA", "SUPERIOR", "POSTGRADO"])
  const profesionOptions = getDynamicOptions('Profesión', ["COMERCIANTE", "INDEPENDIENTE", "DEPENDIENTE"])
  const sexoOptions = ["MASCULINO", "FEMENINO"]

  const handleSearch = async () => {
    if (!searchDni) return
    const data = await searchSocioByDni(searchDni)
    if (data) {
      setSocio(data)
      const snap = buildSnapshot(data)
      setEditData({ ...snap, calificacion_interna: data.calificacion_interna })
      setOriginalData({ ...snap, calificacion_interna: data.calificacion_interna })
    } else {
      alert('Socio no encontrado.')
      setSocio(null)
      setEditData({})
      setOriginalData({})
    }
  }

  // Scoring en tiempo real para todas las pestañas
  const currentScoring = useMemo(() => 
    calculateFullScoring(editData, conyuge, avales, scoringConfig),
    [editData, conyuge, avales, scoringConfig]
  )

  const handleSearchConyuge = async () => {
    if (!searchConyugeDni) return
    const data = await searchSocioByDni(searchConyugeDni)
    if (data) {
      const snap = buildSnapshot(data)
      setConyuge({
        ...snap,
        dni: data.dni,
        nombres_apellidos: data.nombres_apellidos,
        ingresos: data.ingreso_bruto_mensual || 0,
        riesgo: data.clasificacion_central_riesgo || data.calificacion_interna || 'Normal'
      })
    } else {
      alert('Socio/Cónyuge no encontrado en la base de datos.')
    }
  }

  const handleSearchAval = async (id: string, dni: string) => {
    if (!dni) return
    const data = await searchSocioByDni(dni)
    if (data) {
      const snap = buildSnapshot(data)
      setAvales(prev => prev.map(a => a.id === id ? {
        ...snap,
        id,
        dni: data.dni,
        nombres_apellidos: data.nombres_apellidos,
        ingresos: data.ingreso_bruto_mensual || 0,
        telefono: data.telefono || '',
        direccion: data.direccion || ''
      } : a))
    } else {
      alert('Asegúrese que el Aval esté registrado como Socio.')
    }
  }

  const setField = useCallback((key: string, value: any) => {
    setEditData(prev => ({ ...prev, [key]: value }))
  }, [])

  const selectedProduct = useMemo(() => {
    return products.find((p: any) => p.name === credito.producto) || null
  }, [credito.producto, products])

  const socioClasificacion = (clasificacionOverride || editData.clasificacion_central_riesgo || 'Normal').toString()

  const { resolvedTea, resolvedTem } = useMemo(() => {
    if (!selectedProduct?.rates) return { resolvedTea: 0, resolvedTem: 0 }
    const rateRow = selectedProduct.rates[socioClasificacion] || selectedProduct.rates['Normal'] || Object.values(selectedProduct.rates)[0] as any
    return { resolvedTea: rateRow?.tea ?? 0, resolvedTem: rateRow?.tem ?? 0 }
  }, [selectedProduct, socioClasificacion])

  const simulatedCuota = useMemo(() => {
    if (!credito.monto_solicitado || !credito.plazo_meses || resolvedTem <= 0) return 0
    const P = parseFloat(credito.monto_solicitado)
    const n = parseInt(credito.plazo_meses)
    const i = resolvedTem / 100
    if (P <= 0 || n <= 0 || i <= 0) return 0
    return (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
  }, [credito.monto_solicitado, credito.plazo_meses, resolvedTem])

  // Calculated derived metrics for Summary and Print Report
  const totalIngresos = budgetData?.ingresos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const totalGastos = budgetData?.gastos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const deudasFinancieras = budgetData?.deudas_financieras?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const ingresosNetosGastos = totalIngresos - totalGastos
  const capacidadPrevia = ingresosNetosGastos - deudasFinancieras
  const cuota = simulatedCuota
  const coberturaPorcentaje = cuota > 0 ? (capacidadPrevia / cuota) * 100 : 0
  const scoreCualitativo = qualitativeState?.scoring?.titular?.total || 0
  const clasificacion = initialData?.clasificacion_override || 'Normal'

  let recomendacion = 'APROBADO'
  if (capacidadPrevia < cuota || (capacidadPrevia / cuota) < 1.1 || scoreCualitativo <= 220) {
    recomendacion = 'OBSERVADO'
  }
  if (capacidadPrevia < cuota * 0.8 || scoreCualitativo < 180) {
    recomendacion = 'DESAPROBADO'
  }

  const totalPatrimonio = patrimonio.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0)

  const handleSaveClick = (shouldExit: boolean = false) => {
    if (!socio) return alert('Busque un socio primero.')
    if (!credito.producto || !credito.monto_solicitado) return alert('Complete los datos del crédito.')
    const changed = []
    for (const key of ALL_EDITABLE) {
      if (String(originalData[key] ?? '') !== String(editData[key] ?? '')) changed.push(key)
    }
    if (changed.length > 0 && !initialData) {
      setChangedFields(changed)
      setShowSaveDialog(true)
    } else {
      executeSave(false, shouldExit)
    }
  }

  const executeSave = (actualizarSocio: boolean, exitAfterSave: boolean = false) => {
    setShowSaveDialog(false)
    startTransition(async () => {
      try {
        const payload = {
          socio_id: socio.id,
          producto: credito.producto,
          monto_solicitado: parseFloat(credito.monto_solicitado),
          plazo_meses: parseInt(credito.plazo_meses),
          destino_credito: credito.destino_credito,
          tea: resolvedTea,
          tem: resolvedTem,
          cuota_mensual: simulatedCuota,
          clasificacion_override: clasificacionOverride,
          datos_socio_snapshot: editData,
          datos_patrimoniales: patrimonio,
          datos_avales: hasAvales ? avales : [],
          datos_conyuge: hasConyuge ? conyuge : {},
          actualizar_socio: actualizarSocio,
          datos_socio_editados: editData
        }
        if (initialData?.id) {
          await updateSolicitud(initialData.id, payload)
          alert('Solicitud actualizada correctamente.')
          if (exitAfterSave) {
            router.push('/solicitudes')
          } else {
            setActiveTab('evaluacion')
          }
        } else {
          const res = await createSolicitud(payload)
          alert('Solicitud creada con correlativo ' + res.numero_solicitud)
          if (exitAfterSave) {
             router.push('/solicitudes')
          } else {
             router.push(`/solicitudes/${res.id}`)
          }
        }
        router.refresh()
      } catch (err: any) { alert(err.message) }
    })
  }

  const handleSaveCualitativa = async (data: any) => {
    startTransition(async () => {
      try {
        if (!initialData?.id) return
        await updateSolicitud(initialData.id, { datos_cualitativos: data })
        setQualitativeState(data)
        alert('Evaluación cualitativa guardada con éxito.')
        router.refresh()
      } catch (err: any) {
        alert('Error: ' + err.message)
      }
    })
  }

    async function handleSaveResumen(data: any) {
      if (!initialData?.id) return
      await updateSolicitud(initialData.id, { datos_resumen: data })
      router.refresh()
    }

    async function handleFinalSubmit() {
      if (!initialData?.id) return
      if (!confirm('¿Está seguro de enviar esta propuesta para su aprobación? Una vez enviada, no podrá realizar más modificaciones.')) return
      
      try {
        await updateSolicitud(initialData.id, { estado: 'PRESENTADA' })
        alert('Propuesta enviada correctamente para su aprobación.')
        router.refresh()
      } catch (err: any) {
        alert('Error al enviar: ' + err.message)
      }
    }

    const isLocked = initialData?.estado === 'PRESENTADA' || initialData?.estado === 'APROBADO' || initialData?.estado === 'DENEGADO'

    return (
    <div className="bg-slate-50 min-h-screen">
      {/* INTERFAZ DE USUARIO (OCULTA EN IMPRESIÓN) */}
      <div className="print:hidden space-y-4 max-w-7xl mx-auto px-4 pb-12">
        <div className="flex justify-center mb-6 no-print">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-slate-100 rounded-xl shadow-inner">
              <TabsTrigger value="solicitud" className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all rounded-lg">
                <ClipboardCheck className="w-4 h-4 mr-2" /> 1. SOLICITUD
              </TabsTrigger>
              <TabsTrigger value="evaluacion" 
                disabled={!initialData}
                className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all rounded-lg disabled:opacity-50">
                <TrendingUp className="w-4 h-4 mr-2" /> 2. FINANCIERA
              </TabsTrigger>
              <TabsTrigger value="cualitativa" 
                disabled={!initialData}
                className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all rounded-lg disabled:opacity-50">
                <ShieldCheck className="w-4 h-4 mr-2" /> 3. CUALITATIVA
              </TabsTrigger>
              <TabsTrigger value="resumen" 
                disabled={!initialData}
                className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all rounded-lg disabled:opacity-50">
                <FileText className="w-4 h-4 mr-2" /> 4. RESUMEN
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}</style>

      <div className={`${isLocked ? 'pointer-events-none opacity-90' : ''} print:hidden`}>
        {activeTab === 'solicitud' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-2 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="hasConyuge" checked={hasConyuge} onCheckedChange={(v: boolean) => setHasConyuge(v)} />
                <Label htmlFor="hasConyuge" className="text-[10px] font-black text-slate-600 cursor-pointer uppercase tracking-tight">¿Incluir Cónyuge?</Label>
             </div>
             <div className="flex items-center space-x-2 border-l pl-4 border-slate-300">
                <Checkbox id="hasAvales" checked={hasAvales} onCheckedChange={(v: boolean) => setHasAvales(v)} />
                <Label htmlFor="hasAvales" className="text-[10px] font-black text-slate-600 cursor-pointer uppercase tracking-tight">¿Incluir Avales?</Label>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-3 bg-amber-50/50 border-b">
                <CardTitle className="text-sm font-bold text-amber-900 uppercase">DATOS DEL SOCIO</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="DNI del Socio" className="h-7 w-32 border-amber-200 text-xs" value={searchDni} onChange={e => setSearchDni(e.target.value)} />
                  <Button size="sm" onClick={handleSearch} className="h-7 px-3 bg-amber-600 hover:bg-amber-700"><Search className="w-3 h-3 mr-1" /> Buscar</Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <EditableField fieldKey="nombres_apellidos" colSpan="md:col-span-3" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="nro_cuenta" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="direccion" colSpan="md:col-span-4" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="distrito" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="provincia" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="departamento" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="telefono" editData={editData} originalData={originalData} setField={setField} />
                <EditableSelectField fieldKey="estado_civil" options={estadoCivilOptions} editData={editData} originalData={originalData} setField={setField} />
                <EditableSelectField fieldKey="sexo" options={sexoOptions} editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="fecha_nacimiento" type="date" editData={editData} originalData={originalData} setField={setField} />
                <EditableSelectField fieldKey="instruccion" options={instruccionOptions} editData={editData} originalData={originalData} setField={setField} />
                <EditableSelectField fieldKey="profesion_oficio" options={profesionOptions} editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="nro_dependientes" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="aportes_totales" editData={editData} originalData={originalData} setField={setField} />
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 uppercase">Clasificación Central</Label>
                  <Select value={editData.clasificacion_central_riesgo || ''} onValueChange={v => setField('clasificacion_central_riesgo', v)}>
                    <SelectTrigger className="h-8 text-xs bg-amber-50/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {centralOptions.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 uppercase">Calificación Interna</Label>
                  <Select value={editData.calificacion_interna || ''} onValueChange={v => setField('calificacion_interna', v)}>
                    <SelectTrigger className="h-8 text-xs bg-amber-50/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {internalOptions.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="py-3 bg-blue-50/50 border-b">
                <CardTitle className="text-sm font-bold text-blue-900 uppercase">ACTIVIDAD LABORAL</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField fieldKey="empresa_laboral" colSpan="md:col-span-2" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="ruc_empresa" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="cargo" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="direccion_negocio" colSpan="md:col-span-2" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="distrito_negocio" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="ingreso_bruto_mensual" editData={editData} originalData={originalData} setField={setField} />
                <EditableField fieldKey="fecha_ingreso_laboral" type="date" editData={editData} originalData={originalData} setField={setField} />
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 uppercase">Tamaño de Empresa</Label>
                  <Select value={editData.tipo_empresa || ''} onValueChange={v => setField('tipo_empresa', v)}>
                    <SelectTrigger className="h-8 text-xs bg-blue-50/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Microempresa">Microempresa</SelectItem>
                      <SelectItem value="Pequeña empresa">Pequeña empresa</SelectItem>
                      <SelectItem value="Mediana empresa">Mediana empresa</SelectItem>
                      <SelectItem value="Gran empresa">Gran empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-500 uppercase">Actividad Económica</Label>
                  <Select value={editData.actividad_economica || ''} onValueChange={v => setField('actividad_economica', v)}>
                    <SelectTrigger className="h-8 text-xs bg-blue-50/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comercio">Comercio</SelectItem>
                      <SelectItem value="Producción">Producción</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {hasConyuge && (
            <div className="mt-6 animate-in zoom-in-95 duration-300">
              <Card className="border-indigo-100 shadow-sm">
                  <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold uppercase rounded-t-lg flex justify-between items-center">
                      <span>DATOS DEL CÓNYUGE</span>
                      <div className="flex items-center gap-2">
                          <Input 
                            placeholder="DNI Cónyuge" 
                            className="h-6 w-28 text-black text-[10px]" 
                            value={searchConyugeDni}
                            onChange={e => setSearchConyugeDni(e.target.value)}
                          />
                          <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onClick={handleSearchConyuge}>Buscar</Button>
                      </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                              <Label className="text-[10px] uppercase text-slate-500 font-bold">Nombres y Apellidos</Label>
                              <Input value={conyuge.nombres_apellidos || ''} readOnly className="h-8 bg-slate-50 text-xs font-bold" />
                          </div>
                          <div>
                              <Label className="text-[10px] uppercase text-slate-500 font-bold">DNI</Label>
                              <Input value={conyuge.dni || ''} readOnly className="h-8 bg-slate-50 text-xs font-bold" />
                          </div>
                          <div>
                              <Label className="text-[10px] uppercase text-slate-500 font-bold">Ingresos</Label>
                              <Input value={formatCurrency(conyuge.ingresos || 0)} readOnly className="h-8 bg-slate-50 text-xs font-bold" />
                          </div>
                          <div className="md:col-span-4">
                              <Label className="text-[10px] uppercase text-slate-500 font-bold">Central de Riesgo</Label>
                              <Input value={conyuge.riesgo || ''} readOnly className="h-8 bg-slate-50 text-xs font-bold" />
                          </div>

                          {/* Verification labels */}
                          {conyuge.dni && (
                            <div className="md:col-span-4 grid grid-cols-3 gap-4 border-t pt-2 mt-2">
                               <div>
                                  <Label className="text-[8px] font-black text-slate-400 uppercase">Fec. Nacimiento</Label>
                                  <div className="text-[10px] font-black text-blue-800">{conyuge.fecha_nacimiento || 'VACÍO EN REGISTRO'}</div>
                               </div>
                               <div>
                                  <Label className="text-[8px] font-black text-slate-400 uppercase">Estado Civil</Label>
                                  <div className="text-[10px] font-black text-blue-800">{conyuge.estado_civil || 'VACÍO EN REGISTRO'}</div>
                               </div>
                               <div>
                                  <Label className="text-[8px] font-black text-slate-400 uppercase">Instrucción</Label>
                                  <div className="text-[10px] font-black text-blue-800">{conyuge.instruccion || 'VACÍO EN REGISTRO'}</div>
                               </div>
                            </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <Card className="border-amber-100 shadow-sm overflow-hidden">
              <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                <span>DECLARACIÓN PATRIMONIAL</span>
                <Button variant="secondary" size="sm" className="h-6 text-[10px]" onClick={() => setPatrimonio([...patrimonio, { id: Date.now().toString(), nombre: '', valor: 0 }])}>
                  <Plus className="w-3 h-3 mr-1" /> Nuevo Bien
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {patrimonio.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border-b pb-2 last:border-0">
                      <div className="md:col-span-3">
                        <Label className="text-[9px] uppercase font-bold text-slate-400">Tipo de Bien / Origen</Label>
                        <Input value={item.nombre} onChange={e => {
                          const n = [...patrimonio]
                          n[idx].nombre = e.target.value
                          setPatrimonio(n)
                        }} className="h-8 text-xs font-bold border-amber-100" />
                      </div>
                      <div>
                        <Label className="text-[9px] uppercase font-bold text-slate-400">¿Hipotecado?</Label>
                        <Select value={item.hipotecado || 'NO'} onValueChange={v => {
                          const n = [...patrimonio]
                          n[idx].hipotecado = v
                          setPatrimonio(n)
                        }}>
                          <SelectTrigger className="h-8 text-[10px] font-bold border-amber-100"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="NO">NO</SelectItem><SelectItem value="SI">SI</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[9px] uppercase font-bold text-slate-400">Valor Estimado S/</Label>
                        <Input type="number" value={item.valor} onChange={e => {
                          const n = [...patrimonio]
                          n[idx].valor = e.target.value
                          setPatrimonio(n)
                        }} className="h-8 text-xs font-bold text-right border-amber-100" />
                      </div>
                      <div className="flex justify-center mb-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-400" onClick={() => setPatrimonio(patrimonio.filter(p => p.id !== item.id))}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-2 bg-amber-50 rounded-lg text-right font-bold text-amber-900 text-sm">TOTAL PATRIMONIO: {formatCurrency(totalPatrimonio)}</div>
              </CardContent>
            </Card>

            {hasAvales && (
              <Card className="border-indigo-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-indigo-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>AVALES / GARANTÍAS</span>
                  <Button variant="secondary" size="sm" className="h-6 text-[10px]" onClick={() => setAvales([...avales, { id: Date.now().toString(), dni: '', nombres_apellidos: '', ingresos: 0, cargo: '', telefono: '', direccion: '' }])}>
                    <Plus className="w-3 h-3 mr-1" /> Nuevo Aval
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {avales.length === 0 && <p className="text-center py-4 text-slate-400 italic text-[11px]">No se han registrado avales para esta solicitud.</p>}
                    {avales.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 space-y-3 relative">
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-7 w-7 text-red-300 hover:text-red-500" onClick={() => setAvales(avales.filter(a => a.id !== item.id))}><Trash2 className="w-4 h-4" /></Button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">DNI Aval</Label>
                            <div className="flex gap-1">
                              <Input value={item.dni} onChange={e => {
                                const n = [...avales]
                                n[idx].dni = e.target.value
                                setAvales(n)
                              }} className="h-7 text-xs font-bold" />
                              <Button size="sm" className="h-7 px-2" onClick={() => handleSearchAval(item.id, item.dni)}><Search className="w-3 h-3" /></Button>
                            </div>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Nombres y Apellidos</Label>
                            <Input value={item.nombres_apellidos} readOnly className="h-7 text-xs font-bold bg-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Ingresos</Label>
                            <Input value={formatCurrency(item.ingresos || 0)} readOnly className="h-7 text-xs font-bold bg-white text-right" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Teléfono</Label>
                            <Input value={item.telefono} readOnly className="h-7 text-xs font-medium bg-white" />
                          </div>
                          <div className="md:col-span-3 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Dirección</Label>
                            <Input value={item.direccion} readOnly className="h-7 text-[10px] font-medium bg-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-green-100 shadow-md">
              <CardHeader className="py-3 bg-green-50/50 border-b">
                <CardTitle className="text-sm font-bold text-green-900 uppercase">REQUERIMIENTO DE CRÉDITO</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Producto Financiero</Label>
                    <Select value={credito.producto} onValueChange={(v: string | null) => setCredito({ ...credito, producto: v || '' })}>
                      <SelectTrigger className="h-9 text-[11px] font-bold uppercase overflow-hidden bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p: any) => <SelectItem key={p.name} value={p.name} className="text-[11px] uppercase font-bold">{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Condición (Tasa)</Label>
                    <Select value={socioClasificacion} onValueChange={(v: string | null) => setClasificacionOverride(v || 'Normal')}>
                      <SelectTrigger className="h-9 text-[11px] font-bold uppercase bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat} className="text-[11px] uppercase font-bold">{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Monto Solicitado (S/)</Label>
                    <Input 
                      type="text" 
                      value={formatNumber(credito.monto_solicitado)} 
                      onChange={e => setCredito({ ...credito, monto_solicitado: parseFormattedNumber(e.target.value) })} 
                      className="h-9 text-sm font-bold bg-amber-50/10 text-right border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Plazo (Meses)</Label>
                    <Input type="number" value={credito.plazo_meses} onChange={e => setCredito({ ...credito, plazo_meses: e.target.value })} className="h-9 text-sm font-bold text-center bg-white" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-[10px] uppercase text-slate-500 font-bold">Destino del Crédito</Label>
                    <Input value={credito.destino_credito} onChange={e => setCredito({ ...credito, destino_credito: e.target.value })} className="h-9 text-xs font-medium bg-white" />
                  </div>
                </div>

                {simulatedCuota > 0 && (
                  <div className="mt-6 p-6 bg-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24" />
                     </div>
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Cuota Mensual Proyectada</p>
                            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-[10px] font-black text-green-400 uppercase">
                               <TrendingUp className="w-3 h-3" /> {socioClasificacion}
                            </div>
                          </div>
                          <p className="text-5xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{formatCurrency(simulatedCuota)}</p>
                        </div>
                        <div className="flex gap-8 text-center border-l border-slate-700 pl-8">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Tasa Anual (TEA)</p>
                            <p className="text-xl font-bold text-green-500">{resolvedTea.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Tasa Mensual (TEM)</p>
                            <p className="text-xl font-bold text-green-500">{resolvedTem.toFixed(2)}%</p>
                          </div>
                        </div>
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>


            <div className="flex justify-end gap-4 pt-6 border-t border-dashed">
                <Button 
                    variant="outline"
                    disabled={isPending} 
                    onClick={() => handleSaveClick(true)} 
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 h-12 px-8 font-black uppercase text-sm tracking-widest transition-all gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> {isPending ? 'Saliendo...' : 'Guardar y salir'}
                </Button>

                <Button 
                    disabled={isPending} 
                    onClick={() => handleSaveClick(false)} 
                    className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 font-black uppercase text-sm tracking-widest shadow-lg hover:shadow-indigo-200 transition-all gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> {isPending ? 'Guardando...' : (initialData ? 'Guardar y avanzar' : 'Registrar y avanzar')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </div>
      ) : activeTab === 'evaluacion' ? (
        <PresupuestoFamiliar 
            solicitudId={initialData?.id || ''} 
            initialData={budgetData} 
            cuotaSolicitada={simulatedCuota} 
            socioIncome={parseFloat(editData.ingreso_bruto_mensual || 0)}
            socioCompany={editData.empresa_laboral || ''}
            onSaveSuccess={() => router.refresh()}
            onAdvance={() => setActiveTab('cualitativa')}
            isLocked={isLocked}
        />
      ) : activeTab === 'cualitativa' ? (
        <EvaluacionCualitativa 
            solicitudId={initialData?.id || ''}
            socioSnapshot={editData}
            conyugeData={conyuge}
            avalesData={avales}
            scoringConfig={scoringConfig}
            initialData={qualitativeState}
            onSave={handleSaveCualitativa}
            onAdvance={() => setActiveTab('resumen')}
            isLocked={isLocked}
        />
      ) : (
        <HojaResumen 
          solicitud={{
            ...initialData,
            monto_solicitado: credito.monto_solicitado,
            plazo_meses: credito.plazo_meses,
            tea: resolvedTea,
            tem: resolvedTem,
            cuota_mensual: simulatedCuota,
            clasificacion_override: socioClasificacion
          }}
          budgetData={budgetData}
          qualitativeData={{ ...qualitativeState, scoring: currentScoring }}
          socioSnapshot={editData}
          onNavigate={setActiveTab}
          onSaveResumen={handleSaveResumen}
          onFinalSubmit={handleFinalSubmit}
          isLocked={isLocked}
        />
        )}
      </div>
    </div>

    {/* DIALOG DE CONFIRMACIÓN (SCREEN ONLY) */}
    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-amber-100 shadow-2xl">
          <DialogHeader className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-black text-amber-900 uppercase tracking-tight">Datos modificados</DialogTitle>
            <DialogDescription className="text-center font-medium text-slate-600">
              Has realizado cambios en los datos actuales del socio. ¿Deseas aplicar estos cambios a su ficha maestra de forma permanente?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-2 max-h-[150px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
                {changedFields.map(f => (
                    <div key={f} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border text-[10px] font-bold text-slate-500 uppercase">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        <span className="truncate">{FIELD_LABELS[f] || f}</span>
                    </div>
                ))}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1 font-bold border-slate-300 hover:bg-slate-50" onClick={() => executeSave(false)}>NO ACTUALIZAR MAESTRO</Button>
            <Button className="flex-1 font-bold bg-amber-600 hover:bg-amber-700" onClick={() => executeSave(true)}>ACTUALIZAR MAESTRO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* El componente InstitutionalReport maneja toda la lógica de impresión de forma aislada */}
      <InstitutionalReport
        initialData={initialData}
        editData={editData}
        conyuge={conyuge}
        patrimonio={patrimonio}
        totalPatrimonio={totalPatrimonio}
        credito={credito}
        budgetData={budgetData}
        totalIngresos={totalIngresos}
        totalGastos={totalGastos}
        ingresosNetosGastos={ingresosNetosGastos}
        capacidadPrevia={capacidadPrevia}
        simulatedCuota={simulatedCuota}
        coberturaPorcentaje={coberturaPorcentaje}
        qualitativeState={qualitativeState}
        scoreCualitativo={scoreCualitativo}
        clasificacion={socioClasificacion}
        recomendacion={recomendacion}
        avales={avales}
      />

    </div>
  )
}
