"use client"

import React, { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Printer, FileText, AlertCircle, CheckCircle2, History, ArrowRight } from 'lucide-react'
import { getSolicitudByNumero, getPresupuesto, getRecentSolicitudes } from '@/app/actions/solicitudes'
import { getSystemSetting } from '@/app/actions/settings'
import { InstitutionalReport } from '@/components/reports/InstitutionalReport'

export default function ReporteriaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [presupuesto, setPresupuesto] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [recentList, setRecentList] = useState<any[]>([])
  const [scoringConfig, setScoringConfig] = useState<any>(null)

  useEffect(() => {
    const loadRecent = async () => {
      const data = await getRecentSolicitudes(10)
      setRecentList(data)
    }
    const loadConfig = async () => {
      const config = await getSystemSetting('scoring_rules')
      setScoringConfig(config)
    }
    loadRecent()
    loadConfig()
  }, [])


  const handleSearch = (termToSearch?: string) => {

    const term = termToSearch || searchTerm
    if (!term) return
    setError(null)
    setSolicitud(null)
    setPresupuesto(null)

    const numbersOnly = term.match(/\d+/)
    const cleanedTerm = numbersOnly ? numbersOnly[0].padStart(3, '0') : term

    startTransition(async () => {
      try {
        const data = await getSolicitudByNumero(cleanedTerm)
        if (data) {
          setSolicitud(data)
          const p = await getPresupuesto(data.id)
          setPresupuesto(p)
          const updatedRecentList = recentList.filter(item => item.numero_solicitud !== data.numero_solicitud)
          setRecentList([data, ...updatedRecentList].slice(0, 10))
        } else {
          setError(`No se encontró ninguna solicitud con el número "${cleanedTerm}". Intente solo con los dígitos (ej. 006).`)
        }
      } catch (err) {
        setError('Ocurrió un error al buscar la solicitud.')
      }
    })
  }

  const editData = solicitud?.datos_socio_snapshot || {}
  const conyuge = solicitud?.datos_conyuge || {}
  const patrimonio = solicitud?.datos_patrimoniales || []
  const credito = {
     monto_solicitado: solicitud?.monto_solicitado || 0,
     plazo_meses: solicitud?.plazo_meses || 0,
     destino_credito: solicitud?.destino_credito || '',
     producto: solicitud?.producto || '',
     tea: solicitud?.tea || 0,
     tem: solicitud?.tem || 0,
     condicion_tasa: solicitud?.condicion_tasa || ''
  }
  const budgetData = presupuesto || {}
  
  const totalIngresos = budgetData?.ingresos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const totalGastos = budgetData?.gastos_detalle?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const deudasFinancieras = budgetData?.deudas_financieras?.reduce((sum: number, row: any) => sum + (parseFloat(row.values?.[0]) || 0), 0) || 0
  const ingresosNetosGastos = totalIngresos - totalGastos
  const capacidadPrevia = ingresosNetosGastos - deudasFinancieras
  const simulatedCuota = solicitud?.cuota_mensual || 0
  const coberturaPorcentaje = simulatedCuota > 0 ? (capacidadPrevia / simulatedCuota) * 100 : 0
  const qualitativeState = solicitud?.datos_cualitativos || {}
  const scoreCualitativo = qualitativeState?.scoring?.titular?.total || 0
  const clasificacion = solicitud?.clasificacion_override || 'Normal'
  const totalPatrimonio = patrimonio.reduce((sum: number, item: any) => sum + (parseFloat(item.valor) || 0), 0)

  useEffect(() => {
    if (typeof window !== 'undefined' && solicitud) {
      const originalTitle = document.title;
      const handleBeforePrint = () => {
        const name = editData.nombres_apellidos?.replace(/\s+/g, '_') || 'SOCIO';
        const num = solicitud.numero_solicitud || String(solicitud.correlativo || '').padStart(3, '0');
        document.title = `REPORTE_ARISK_${num}_${name}`;
      };

      const handleAfterPrint = () => {
        document.title = originalTitle;
      };
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [solicitud, editData]);

  let recomendacion = 'APROBADO'

  if (capacidadPrevia < simulatedCuota || (capacidadPrevia / simulatedCuota) < 1.1 || scoreCualitativo <= 180) {
    recomendacion = 'OBSERVADO'
  }
  if (capacidadPrevia < simulatedCuota * 0.8 || scoreCualitativo <= 150) {
    recomendacion = 'DESAPROBADO'
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20 p-4 print:p-0 print:m-0 print:max-w-none print:block print:h-auto">
      {/* 
          ESTRATEGIA DE ISOLACIÓN PARA IMPRESIÓN:
          Todo lo que sea UI de la plataforma se envuelve en 'no-print' / 'print:hidden'.
          Solo el componente <InstitutionalReport /> queda fuera para ser impreso de forma pura.
      */}
      <div className="no-print print:hidden flex flex-col gap-6">
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic">
            <FileText className="w-8 h-8 text-blue-600" /> MÓDULO DE REPORTERÍA
          </h1>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest pl-1">Búsqueda y Visualización de Solicitudes</p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-50 overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Ingrese el Número de Solicitud (ej. SOL-001)" 
                  className="pl-10 h-12 bg-white/80 border-slate-200 text-lg font-bold tracking-tight focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={() => handleSearch()} 
                disabled={isPending || !searchTerm}
                className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isPending ? 'Buscando...' : 'BUSCAR'}
              </Button>
            </div>

            {!solicitud && !error && recentList.length > 0 && (
              <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Solicitudes Recientes</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {recentList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearch(String(item.correlativo))}
                      className="group flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all text-left w-full"
                    >
                      <div className="flex items-center gap-3 min-w-[80px]">
                        <div className={`w-2 h-2 rounded-full ${item.estado === 'APROBADO' ? 'bg-green-500' : 'bg-amber-500'} shrink-0`} />
                        <span className="text-xs font-black text-blue-600">Nº {String(item.correlativo).padStart(3, '0')}</span>
                      </div>
                      <p className="text-[12px] font-bold text-slate-700 truncate grow uppercase">{item.socios?.nombres_apellidos}</p>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="text-[11px] font-black text-slate-900 border-l pl-4 border-slate-100">{formatCurrency(item.monto_solicitado || 0)}</span>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.estado === 'APROBADO' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'} hidden sm:block`}>
                          {item.estado}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {solicitud && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-xl border-l-8 border-l-blue-600">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 font-black px-3 py-1 text-xs uppercase tracking-widest">
                    SOLICITUD: {solicitud.numero_solicitud || String(solicitud.correlativo || '').padStart(3, '0')}
                  </Badge>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${solicitud.estado === 'APROBADO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {solicitud.estado}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">{editData.nombres_apellidos}</h2>
                <p className="text-slate-500 text-sm font-medium">SOCIO CUENTA: <span className="font-bold text-slate-700">{editData.nro_cuenta}</span></p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Button 
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-xl font-black uppercase text-sm tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
                >
                  <Printer className="w-5 h-5" /> GENERAR IMPRESIÓN PDF
                </Button>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Analista Responsable</p>
                  <p className="font-black text-blue-900 uppercase text-xs">{solicitud.analista?.full_name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-none ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50 border-b py-3">
                  <CardTitle className="text-xs font-black uppercase text-slate-600">Evaluación Financiera</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold"><span>Total Ingresos:</span><span className="text-green-600">{formatCurrency(totalIngresos)}</span></div>
                     <div className="flex justify-between text-xs font-bold"><span>Total Gastos:</span><span className="text-red-500">{formatCurrency(totalGastos)}</span></div>
                     <div className="flex justify-between text-xs font-bold border-t pt-1"><span>Sobra Libre:</span><span className="text-blue-700">{formatCurrency(capacidadPrevia)}</span></div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                     <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Monto Solicitado</p>
                     <p className="text-2xl font-black text-blue-900 tracking-tighter">{formatCurrency(parseFloat(credito.monto_solicitado) || 0)} <span className="text-sm font-medium text-slate-400">/ {credito.plazo_meses} Meses</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-none ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50 border-b py-3">
                  <CardTitle className="text-xs font-black uppercase text-slate-600">Análisis de Riesgos</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-500">Scoring:</span>
                      <span className={`text-lg font-black ${scoreCualitativo >= 180 ? 'text-green-600' : 'text-amber-600'}`}>{scoreCualitativo} Ptos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-500">Cobertura:</span>
                      <span className={`text-lg font-black ${coberturaPorcentaje >= 120 ? 'text-green-600' : 'text-red-600'}`}>{coberturaPorcentaje.toFixed(1)}%</span>
                    </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-slate-900 text-white border-none ring-4 ring-slate-800">
                <CardContent className="p-6 flex flex-col justify-center items-center h-full text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Dictamen de Sistema</p>
                  <div className="flex items-center gap-3 mb-4">
                    {recomendacion === 'APROBADO' ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <AlertCircle className="w-8 h-8 text-amber-400" />}
                    <h3 className={`text-3xl font-black tracking-tighter ${recomendacion === 'APROBADO' ? 'text-green-400' : 'text-amber-400'}`}>
                      {recomendacion}
                    </h3>
                  </div>
                  <div className="h-0.5 w-12 bg-white/20 mb-4 rounded-full"></div>
                  <p className="text-[9px] font-bold italic opacity-40 uppercase">Recomendación generada por el motor ARISK v0.3</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center gap-4 text-center shadow-inner">
               <Printer className="w-12 h-12 text-blue-300" />
               <div>
                 <h4 className="font-black text-blue-900 uppercase">Vista de Reportería General</h4>
                 <p className="text-slate-500 text-sm italic max-w-md">Para visualizar el detalle completo de 4 páginas y los bloques de firma, utilice la función de <strong className="text-blue-700">Impresión PDF</strong>.</p>
               </div>
            </div>
          </div>
        )}

        {!solicitud && !isPending && (
          <div className="mt-20 flex flex-col items-center justify-center opacity-30 grayscale print:hidden">
            <FileText className="w-32 h-32 mb-4" />
            <p className="text-xl font-black uppercase tracking-[10px]">CONSULTA DE REPORTES</p>
          </div>
        )}
      </div>

      {solicitud && (
        <InstitutionalReport 
          initialData={solicitud}
          editData={editData}
          conyuge={conyuge}
          patrimonio={patrimonio}
          credito={credito}
          budgetData={budgetData}
          totalIngresos={totalIngresos}
          totalGastos={totalGastos}
          ingresosNetosGastos={ingresosNetosGastos}
          capacidadPrevia={capacidadPrevia}
          simulatedCuota={simulatedCuota}
          coberturaPorcentaje={coberturaPorcentaje}
          scoreCualitativo={scoreCualitativo}
          clasificacion={clasificacion}
          recomendacion={recomendacion}
          qualitativeState={qualitativeState}
          totalPatrimonio={totalPatrimonio}
          scoringConfig={scoringConfig}
          avales={solicitud?.datos_avales || []}
        />
      )}
    </div>
  )
}

