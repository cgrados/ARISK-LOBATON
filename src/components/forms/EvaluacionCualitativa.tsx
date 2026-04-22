'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, TrendingUp, HelpCircle, UserCheck, Users, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { calculateFullScoring } from '@/lib/scoring-logic'

interface ScoringRule {
  id: string
  name: string
  type: 'exact' | 'range'
  rules: any[]
}

const FODA_SUGGESTIONS = {
  fortalezas: [
    'Experiencia en el rubro (+ 3 años)',
    'Local propio / Posesión acreditada',
    'Clientela fidelizada en la zona',
    'Ubicación estratégica y flujo peatonal',
    'Capital propio para reinversión',
    'Diversificación de productos y servicios',
    'Sin morosidad en el sistema financiero',
    'Buen récord de pagos con proveedores',
    'Conocimiento técnico especializado',
    'Personal capacitado y de confianza'
  ],
  oportunidades: [
    'Crecimiento comercial de la zona',
    'Alianza con nuevos proveedores',
    'Temporada alta próxima (Campaña)',
    'Acceso a créditos preferenciales',
    'Ampliación física del local actual',
    'Baja competencia directa en el sector',
    'Digitalización de ventas (Redes)',
    'Proyectos de infraestructura cercanos',
    'Demanda insatisfecha identificada',
    'Estabilidad de precios de compra'
  ],
  debilidades: [
    'Falta de registros contables formales',
    'Dependencia de un solo proveedor',
    'Local alquilado (Contrato corto)',
    'Poca experiencia financiera/gestión',
    'Inventario desordenado/mal gestionado',
    'Nivel bajo de digitalización',
    'Stock crítico insuficiente',
    'Horario de atención limitado',
    'Falta de personal calificado de apoyo',
    'Escasa diferenciación de marca'
  ],
  amenazas: [
    'Competencia agresiva de grandes cadenas',
    'Inestabilidad económica / Inflación',
    'Alza de precios de insumos básicos',
    'Cambios en regulaciones municipales',
    'Inseguridad ciudadana en la zona',
    'Cambio en preferencias del consumidor',
    'Ingreso de nuevos competidores',
    'Fenómenos climáticos desfavorables',
    'Restricciones de circulación/acceso',
    'Incremento en tasas de interés'
  ]
}

export function EvaluacionCualitativa({ 
  solicitudId, 
  socioSnapshot, 
  conyugeData, 
  avalesData, 
  scoringConfig, 
  initialData, 
  onSave, 
  onAdvance,
  isLocked
}: { 
  solicitudId: string
  socioSnapshot: any
  conyugeData: any
  avalesData: any[]
  scoringConfig: any
  initialData?: any
  onSave: (data: any) => Promise<void>
  onAdvance?: () => void
  isLocked?: boolean
}) {
  const router = useRouter()
  const [foda, setFoda] = useState<any>(initialData?.foda || { fortalezas: '', oportunidades: '', debilidades: '', amenazas: '' })
  const [comentarioAnalista, setComentarioAnalista] = useState(initialData?.comentarioAnalista || '')
  const [referencias, setReferencias] = useState<any>(initialData?.referencias || { 
    clientes: { comment: '', phone: '' }, 
    proveedores: { comment: '', phone: '' }, 
    familiares: { comment: '', phone: '' }, 
    financieras: { comment: '', phone: '' } 
  })
  const [isSaving, setIsSaving] = useState(false)

  const rules: ScoringRule[] = scoringConfig?.variables || []
  const cutoffs = scoringConfig?.cutoffs || []

  const scoring = useMemo(() => calculateFullScoring(socioSnapshot, conyugeData, avalesData, scoringConfig), [socioSnapshot, conyugeData, avalesData, scoringConfig])
  const { titular, conyuge, avales } = scoring

  const getCutoffResult = (score: number) => {
    return cutoffs.find((c: any) => score >= c.min && score <= c.max) || { action: 'SIN DATOS', color: '#94a3b8' }
  }

  const generateAutoAnalysis = () => {
    const { fortalezas, oportunidades, debilidades, amenazas } = foda
    let text = "SÍNTESIS DE EVALUACIÓN:\n\n"
    
    if (fortalezas) text += `Se identifica un perfil con fortalezas clave en: ${fortalezas.toLowerCase()}. `
    if (debilidades) text += `A pesar de presentar debilidades como ${debilidades.toLowerCase()}, el negocio demuestra resiliencia operativa. `
    if (oportunidades) text += `Se proyecta un escenario favorable aprovechando ${oportunidades.toLowerCase()}. `
    if (amenazas) text += `Es vital monitorear factores externos como ${amenazas.toLowerCase()} para mitigar riesgos.\n\n`
    
    text += "CONCLUSIÓN: Se recomienda proceder con la operación bajo las condiciones propuestas."
    setComentarioAnalista(text)
  }

  const handleSave = async (isExit: boolean) => {
    setIsSaving(true)
    try {
      // Include the scoring object so it can be seen by the HojaResumen
      await onSave({ foda, comentarioAnalista, referencias, scoring })
      if (!isExit && onAdvance) onAdvance()
      else if (isExit) router.push('/dashboard/solicitudes')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const PersonScoringTable = ({ title, subtitle, details, total, icon: Icon }: { title: string; subtitle?: string; details: any[]; total: number; icon: any }) => (
    <div className="space-y-4">
      <p className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-600" /> {title} {subtitle && <span className="text-indigo-600 normal-case font-bold">— {subtitle}</span>}
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead className="bg-slate-50 font-black text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2 border-b border-r">Variable</th>
              <th className="px-3 py-2 border-b border-r">Dato</th>
              <th className="px-3 py-2 border-b text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {details.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-1 border-r font-medium text-slate-500">{r.name}</td>
                <td className="px-3 py-1 border-r font-bold">{r.value}</td>
                <td className="px-3 py-1 text-center font-black text-indigo-600">{r.score}</td>
              </tr>
            ))}
            <tr className="bg-indigo-50 font-black">
              <td colSpan={2} className="px-3 py-2 border-r text-right">TOTAL</td>
              <td className="px-3 py-2 text-center text-sm">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      <Card className="border-t-4 border-t-indigo-600 shadow-xl">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-center text-base font-black uppercase">Evaluación Scoring - Credit</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            <PersonScoringTable title="Titular" subtitle={socioSnapshot?.nombres_apellidos} details={titular.details} total={titular.total} icon={UserCheck} />
            {conyuge && <PersonScoringTable title="Cónyuge" subtitle={conyugeData?.nombres_apellidos || conyugeData?.nombre || socioSnapshot?.conyuge_nombre} details={conyuge.details} total={conyuge.total} icon={Users} />}
            {avales.map((av, i) => <PersonScoringTable key={i} title={`Aval ${i+1}`} subtitle={avalesData?.[i]?.nombres_apellidos || avalesData?.[i]?.nombre} details={av.details} total={av.total} icon={ShieldCheck} />)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-dashed">
            <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-dashed">
               <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Puntos de Corte</p>
               <div className="space-y-2">
                 {cutoffs.map((c: any, i: number) => (
                   <div key={i} className="flex justify-between items-center text-[10px]">
                     <span className="font-bold italic">{c.action} ({c.min}-{c.max})</span>
                     <div style={{ backgroundColor: c.color }} className="w-20 h-4 rounded" />
                   </div>
                 ))}
               </div>
            </div>
            <div className="p-4 bg-white border-2 border-indigo-100 rounded-xl flex flex-col items-center justify-center gap-2">
               <span className="text-[10px] font-black text-indigo-400 uppercase">Dictamen Final</span>
               <div style={{ backgroundColor: getCutoffResult(titular.total).color }} className="w-full py-3 text-center text-white font-black rounded-lg uppercase">
                 {getCutoffResult(titular.total).action}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 border-slate-200">
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> <span className="text-xs font-black uppercase">Análisis FODA</span></div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(FODA_SUGGESTIONS) as Array<keyof typeof FODA_SUGGESTIONS>).map(key => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase">{key}</Label>
                  <Select onValueChange={(val) => setFoda((p: any) => ({ ...p, [key]: (p[key] ? p[key] + ', ' : '') + val }))} disabled={isLocked}>
                    <SelectTrigger className="h-6 text-[9px] w-auto min-w-[140px] uppercase font-bold"><SelectValue placeholder="+ Sugerencias" /></SelectTrigger>
                    <SelectContent>
                      {FODA_SUGGESTIONS[key].map(s => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <textarea 
                  className="w-full h-24 p-3 text-xs border rounded-xl bg-slate-50" 
                  value={foda[key]} 
                  onChange={(e) => setFoda((p: any) => ({ ...p, [key]: e.target.value }))}
                  disabled={isLocked}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> <span className="text-xs font-black uppercase">Referencias</span></div>
          <CardContent className="p-6 space-y-4">
            {Object.keys(referencias).map(ref => (
              <div key={ref} className="space-y-2">
                <Label className="text-[10px] font-black uppercase">{ref}</Label>
                <div className="flex gap-2">
                  <Input className="h-8 w-24 text-[11px]" placeholder="Telf" value={referencias[ref].phone} onChange={(e) => setReferencias((p: any) => ({ ...p, [ref]: { ...p[ref], phone: e.target.value } }))} disabled={isLocked} />
                  <Input className="h-8 flex-1 text-[11px]" placeholder="Comentario" value={referencias[ref].comment} onChange={(e) => setReferencias((p: any) => ({ ...p, [ref]: { ...p[ref], comment: e.target.value } }))} disabled={isLocked} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <div className="bg-indigo-900 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> <span className="text-xs font-black uppercase">Análisis Final</span></div>
            <Button 
              variant="ghost" 
              className="h-6 text-[9px] text-indigo-200 hover:text-white hover:bg-indigo-800 font-bold px-2 border border-indigo-700" 
              onClick={generateAutoAnalysis}
              disabled={isLocked}
            >
              ✨ Auto-generar
            </Button>
          </div>
          <CardContent className="p-6">
            <textarea 
              className="w-full h-40 p-4 text-xs border rounded-xl bg-indigo-50/10 font-medium leading-relaxed" 
              placeholder="Dictamen analista..." 
              value={comentarioAnalista} 
              onChange={(e) => setComentarioAnalista(e.target.value)}
              disabled={isLocked}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 pt-8 no-print">
        <Button variant="outline" className="h-12 px-8 font-black uppercase text-xs" onClick={() => handleSave(true)} disabled={isSaving || isLocked}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Guardar y Salir
        </Button>
        <Button className="bg-indigo-600 h-12 px-10 font-black uppercase text-xs shadow-lg" onClick={() => handleSave(false)} disabled={isSaving || isLocked}>
          <ShieldCheck className="w-4 h-4 mr-2" /> Guardar y Avanzar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
