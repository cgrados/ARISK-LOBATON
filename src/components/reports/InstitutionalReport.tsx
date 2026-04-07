"use client"

import React from 'react'
import { formatCurrency } from '@/lib/utils/format'


interface InstitutionalReportProps {
  initialData: any
  editData: any
  conyuge: any
  patrimonio: any[]
  credito: any
  budgetData: any
  totalIngresos: number
  totalGastos: number
  ingresosNetosGastos: number
  capacidadPrevia: number
  simulatedCuota: number
  coberturaPorcentaje: number
  scoreCualitativo: number
  clasificacion: string
  recomendacion: string
  qualitativeState: any
  totalPatrimonio: number
  scoringConfig?: any
  avales: any[]
}


export const InstitutionalReport: React.FC<InstitutionalReportProps> = ({
  initialData,
  editData,
  conyuge,
  patrimonio,
  credito,
  budgetData,
  totalIngresos,
  totalGastos,
  ingresosNetosGastos,
  capacidadPrevia,
  simulatedCuota,
  coberturaPorcentaje,
  scoreCualitativo,
  clasificacion,
  recomendacion,
  qualitativeState,
  totalPatrimonio,
  scoringConfig,
  avales
}) => {

  const correlativoStr = String(initialData?.correlativo || '000').padStart(3, '0')
  const formattedDate = initialData?.created_at 
    ? new Date(initialData.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-PE');
 
  // Extract Thresholds from Config
  const defaultThr = {
    edeMaxModerado: 35,
    edeMaxCritico: 45,
    gastoMaxModerado: 75,
    gastoMaxCritico: 90
  }
  const thr = { ...defaultThr, ...(scoringConfig?.thresholds || {}) }


  // Helper calculation for grand totals (6 months)
  const realTotalIngresos = budgetData?.ingresos_detalle?.reduce((sum: number, row: any) => sum + row.values.reduce((a:number,b:number)=>a+b, 0),0) || 0;
  const realTotalGastos = budgetData?.gastos_detalle?.reduce((sum: number, row: any) => sum + row.values.reduce((a:number,b:number)=>a+b, 0),0) || 0;
  const realTotalDeudas = budgetData?.deudas_financieras?.reduce((sum: number, row: any) => sum + row.values.reduce((a:number,b:number)=>a+b, 0),0) || 0;
  
  const monthlyIngresos = realTotalIngresos / 6;
  const monthlyGastos = realTotalGastos / 6;
  const monthlyDeudas = realTotalDeudas / 6;
  const monthlyCuota = simulatedCuota;

  const monthlySobranteBruto = monthlyIngresos - monthlyGastos - monthlyDeudas;
  const monthlyMargenFinal = monthlySobranteBruto - monthlyCuota;

  const realGastoSobreIngreso = monthlyIngresos > 0 ? (monthlyGastos / monthlyIngresos) * 100 : 0;
  const realEndeudamiento = monthlyIngresos > 0 ? ((monthlyDeudas + monthlyCuota) / monthlyIngresos) * 100 : 0;

  // Sync Scoring Profiles with Evaluation Logic
  const scoringProfiles = [];
  if (qualitativeState?.scoring?.titular) scoringProfiles.push({ label: 'TITULAR', data: qualitativeState.scoring.titular, icon: '👤', color: 'indigo' });
  if (qualitativeState?.scoring?.conyuge) scoringProfiles.push({ label: 'CÓNYUGE', data: qualitativeState.scoring.conyuge, icon: '👥', color: 'purple' });
  if (qualitativeState?.scoring?.avales && Array.isArray(qualitativeState.scoring.avales)) {
    qualitativeState.scoring.avales.forEach((av: any, i: number) => {
      scoringProfiles.push({ label: `AVAL ${i + 1}`, data: av, icon: '🛡️', color: 'emerald' });
    });
  }

  return (
    <div className="hidden print:block bg-white text-black w-full overflow-visible" id="institutional-report">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Hide EVERYTHING that is not the report or its parent path */
          aside, header, nav, button, [role="navigation"], .no-print, .print\:hidden, .print-hidden {
             display: none !important;
          }
          
          html, body, main, [role="main"], div#root, .ml-72, .h-screen, .overflow-hidden, .overflow-y-auto { 
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            background: white !important;
          }

          /* Precision margins 3cm V, 2.5cm H */
          .page-break { 
            padding-top: 3cm !important;
            padding-bottom: 3cm !important;
            padding-left: 2.5cm !important;
            padding-right: 2.5cm !important;
            width: 100% !important;
            min-height: 29.7cm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            display: block !important;
            background: white !important;
            position: relative !important;
          }


          
          #institutional-report { 
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 9999 !important;
          }

          .card-report { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: white; }
          .card-header-report { border-bottom: 1px solid #cbd5e1; padding: 2px 8px; font-weight: 800; font-size: 10px; text-transform: uppercase; color: #1e293b; }
          .card-content-report { padding: 4px 8px; }
          .label-report { font-size: 8px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 0px; line-height: 1.1; }
          .value-report { font-size: 11pt; color: #0f172a; font-weight: 800; min-height: 16px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1px; line-height: 1.1; }
          table.report-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
          table.report-table th { font-size: 7.5pt; text-transform: uppercase; padding: 2px 4px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; }
          table.report-table td { font-size: 11pt; padding: 2px 6px; border: 1px solid #f1f5f9; font-weight: 800; color: #0f172a; }
          .blue-header { background: #1e40af; color: white; padding: 10px; text-align: center; font-weight: 900; }
          .page-financial table.report-table td { padding: 3px 6px; font-size: 10pt; }
          .page-financial .card-content-report { padding: 10px 12px; }
          .page-solicitud .label-report { font-size: 8.5pt; margin-bottom: 1px; }
          .page-solicitud .value-report { font-size: 11pt; min-height: 17px; padding-bottom: 1px; }
          .page-solicitud table.report-table td { padding: 3px 6px; font-size: 11pt; }
          .page-evaluation table.report-table td { padding: 2px 4px; font-size: 8pt; }
          .page-evaluation .card-content-report { padding: 4px 6px; }
        }
        @media screen {
          #institutional-report { display: none !important; opacity: 0 !important; }
        }
      `}} />

      {/* PÁGINA 1: SOLICITUD */}
      <div className="page-break bg-white page-solicitud">
        <div className="flex items-center justify-between mb-6 border-b-2 border-slate-900 pb-4">
          <div className="w-1/4">
            <img src="/arisk-logo.png" alt="ARISK Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="w-2/4 text-center">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">COOPAC LOBATON RUC: 20118475870</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1">Mariscal Las Heras 375 - Lince</p>
          </div>
          <div className="w-1/4 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Fecha de Solicitud</p>
            <p className="text-sm font-black text-slate-900">{formattedDate}</p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border-4 border-slate-900 p-4 rounded-xl transform -rotate-1 shadow-lg bg-white max-w-sm w-full text-center">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">SOLICITUD N° {correlativoStr}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* DATOS DEL SOCIO */}
          <div className="card-report border-slate-200 shadow-sm">
            <div className="card-header-report bg-slate-50 text-blue-700">DATOS DEL SOCIO</div>
            <div className="card-content-report p-4 grid grid-cols-4 gap-x-4 gap-y-2">
               <div className="col-span-3"><p className="label-report">Nombres y Apellidos</p><p className="value-report uppercase">{editData.nombres_apellidos}</p></div>
               <div><p className="label-report">Cuenta</p><p className="value-report">{editData.nro_cuenta || '-'}</p></div>
               <div className="col-span-4"><p className="label-report">Dirección</p><p className="value-report uppercase">{editData.direccion}</p></div>
               <div><p className="label-report">Distrito</p><p className="value-report uppercase">{editData.distrito}</p></div>
               <div><p className="label-report">Provincia</p><p className="value-report uppercase">{editData.provincia || 'Lima'}</p></div>
               <div><p className="label-report">Departamento</p><p className="value-report uppercase">{editData.departamento || 'Lima'}</p></div>
               <div><p className="label-report">Teléfono</p><p className="value-report">{editData.telefono}</p></div>
               <div><p className="label-report">Estado Civil</p><p className="value-report uppercase">{editData.estado_civil}</p></div>
               <div><p className="label-report">Sexo</p><p className="value-report uppercase">{editData.sexo || '-'}</p></div>
               <div><p className="label-report">Fec. Nac.</p><p className="value-report">{editData.fecha_nacimiento || '-'}</p></div>
               <div><p className="label-report">Instrucción</p><p className="value-report uppercase">{editData.instruccion || '-'}</p></div>
               <div><p className="label-report">Profesión</p><p className="value-report uppercase">{editData.profesion_oficio || '-'}</p></div>
               <div><p className="label-report">Dependientes</p><p className="value-report">{editData.nro_dependientes ?? '-'}</p></div>
               <div><p className="label-report">Aportes</p><p className="value-report font-black">{formatCurrency(parseFloat(editData.aportes_totales) || 0)}</p></div>
               <div><p className="label-report">Clasif. Central</p><p className="value-report uppercase">{editData.clasificacion_central_riesgo || 'Normal'}</p></div>
               <div><p className="label-report">DNI</p><p className="value-report">{editData.dni}</p></div>
               <div><p className="label-report">Calif. Interna</p><p className="value-report uppercase">{editData.calificacion_interna || 'Normal'}</p></div>

            </div>
          </div>

          {/* ACTIVIDAD LABORAL */}
          <div className="card-report border-slate-200 shadow-sm">
            <div className="card-header-report bg-slate-50 text-blue-700">ACTIVIDAD LABORAL</div>
            <div className="card-content-report p-4 grid grid-cols-2 gap-x-4 gap-y-2">
               <div className="col-span-2"><p className="label-report">Empresa</p><p className="value-report uppercase">{editData.empresa_laboral || 'INDEPENDIENTE'}</p></div>
               <div><p className="label-report">RUC</p><p className="value-report">{editData.ruc_empresa || editData.ruc || '-'}</p></div>
               <div><p className="label-report">Cargo</p><p className="value-report uppercase">{editData.cargo || '-'}</p></div>
               <div className="col-span-2"><p className="label-report">Dir. Negocio</p><p className="value-report uppercase">{editData.direccion_negocio || '-'}</p></div>
               <div><p className="label-report">Dist. Negocio</p><p className="value-report uppercase">{editData.distrito_negocio || '-'}</p></div>
               <div><p className="label-report">Ingreso Mensual</p><p className="value-report font-black">{formatCurrency(parseFloat(editData.ingreso_bruto_mensual) || 0)}</p></div>

               <div><p className="label-report">Fec. Ingreso</p><p className="value-report">{editData.fecha_ingreso_laboral || editData.fecha_ingreso || '-'}</p></div>
               <div><p className="label-report">Tamaño Empresa</p><p className="value-report uppercase">{editData.tamano_empresa || '-'}</p></div>
               <div className="col-span-2"><p className="label-report">Actividad Económica</p><p className="value-report uppercase">{editData.actividad_economica || '-'}</p></div>
            </div>
          </div>
        </div>

        {/* DATOS DEL CÓNYUGE - Solo si existe */}
        {conyuge?.nombres_apellidos && (
          <div className="card-report mt-4 border-indigo-200 shadow-sm">
             <div className="card-header-report bg-indigo-50 text-indigo-700">DATOS DEL CÓNYUGE</div>
             <div className="card-content-report p-4 grid grid-cols-6 gap-x-4 gap-y-2">
                <div className="col-span-3"><p className="label-report">Nombres y Apellidos</p><p className="value-report uppercase">{conyuge?.nombres_apellidos || '-'}</p></div>
                <div><p className="label-report">DNI</p><p className="value-report">{conyuge?.dni || '-'}</p></div>
                <div><p className="label-report">Ingresos</p><p className="value-report font-black">{formatCurrency(parseFloat(conyuge?.ingresos) || 0)}</p></div>
                <div><p className="label-report">Central Riesgo</p><p className="value-report uppercase">{conyuge?.central_riesgo || 'Normal'}</p></div>
                <div className="col-span-2"><p className="label-report">Fec. Nacimiento</p><p className="value-report">{conyuge?.fecha_nacimiento || '-'}</p></div>
                <div className="col-span-2"><p className="label-report">Estado Civil</p><p className="value-report uppercase">{conyuge?.estado_civil || '-'}</p></div>
                <div className="col-span-2"><p className="label-report">Instrucción</p><p className="value-report uppercase">{conyuge?.instruccion || '-'}</p></div>
             </div>
          </div>
        )}

        {/* DATOS DE LOS AVALES / GARANTES - Solo si existen */}
        {avales && avales.length > 0 && (
          <div className="card-report mt-4 border-indigo-200 shadow-sm">
            <div className="card-header-report bg-indigo-900 text-white">DATOS DE LOS AVALES / GARANTES</div>
            <div className="card-content-report p-0">
              <table className="report-table">
                <thead>
                  <tr className="bg-slate-100 italic">
                    <th className="w-1/3">Nombres y Apellidos</th>
                    <th>DNI</th>
                    <th>Teléfono</th>
                    <th className="text-right">Ingresos S/</th>
                  </tr>
                </thead>
                <tbody>
                  {avales.map((av, idx) => (
                    <tr key={idx}>
                      <td className="uppercase font-bold">{av.nombres_apellidos}</td>
                      <td>{av.dni}</td>
                      <td>{av.telefono || '-'}</td>
                      <td className="text-right font-black">{formatCurrency(parseFloat(av.ingresos) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* DECLARACIÓN PATRIMONIAL */}
        <div className="card-report mt-4 border-amber-200 shadow-sm">
           <div className="card-header-report bg-amber-50 text-amber-700">DECLARACIÓN PATRIMONIAL</div>
           <div className="card-content-report p-0">
              <table className="report-table">
                <thead><tr className="bg-amber-50"><th>TIPO DE BIEN / ORIGEN</th><th>¿HIPOTECADO?</th><th className="text-right">VALOR ESTIMADO S/</th></tr></thead>
                <tbody>
                  {(patrimonio || []).map((p, i) => (
                    <tr key={i}><td>{p.nombre}</td><td className="text-center">{p.hipotecado}</td><td className="text-right font-black">{formatCurrency(parseFloat(p.valor)||0)}</td></tr>
                  ))}
                  <tr className="bg-amber-100 font-black"><td colSpan={2} className="text-right uppercase">TOTAL PATRIMONIO:</td><td className="text-right">{formatCurrency(totalPatrimonio)}</td></tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* REQUERIMIENTO DE CRÉDITO */}
        <div className="card-report mt-6 border-green-200 shadow-sm">
           <div className="card-header-report bg-green-50 text-green-700">REQUERIMIENTO DE CRÉDITO</div>
           <div className="card-content-report p-4">
              <div className="grid grid-cols-5 gap-4 mb-4">
                 <div><p className="label-report">Producto Financiero</p><p className="value-report uppercase">{credito.producto || '-'}</p></div>
                 <div><p className="label-report">Condición (Tasa)</p><div className="value-report font-black text-indigo-700 flex flex-col leading-tight"><span className="text-[10pt]">TEA: {(parseFloat(credito.tea)||0).toFixed(2)}%</span><span className="text-[10pt]">TEM: {(parseFloat(credito.tem) || (parseFloat(credito.tea)/12) || 0).toFixed(2)}%</span></div></div>
                 <div><p className="label-report">Monto Solicitado</p><p className="value-report font-black">{formatCurrency(parseFloat(credito.monto_solicitado)||0)}</p></div>
                 <div><p className="label-report">Plazo (Meses)</p><p className="value-report font-black">{credito.plazo_meses}</p></div>
                 <div><p className="label-report">Destino del Crédito</p><p className="value-report uppercase">{credito.destino_credito || '-'}</p></div>
              </div>
           </div>
        </div>

        <div className="mt-32 flex justify-center flex-col items-center">
          <div className="w-72 border-t-2 border-black mb-1"></div>
          <p className="text-[10px] font-black uppercase italic tracking-widest">Firma del Socio</p>
        </div>
      </div>

      {/* PÁGINA 2: EVALUACIÓN FINANCIERA */}
      <div className="page-break bg-white page-financial">

        <h2 className="text-xl font-black text-indigo-900 border-b-2 border-indigo-600 pb-2 mb-4 uppercase italic">EVALUACIÓN FINANCIERA (6 MESES)</h2>
        
        <div className="card-report">
          <div className="card-header-report bg-blue-600 text-white">Ingresos Mensuales / Origen del Ingreso</div>
          <div className="card-content-report">
            <table className="report-table">
              <thead><tr className="bg-slate-50 uppercase"><th>Concepto</th><th>Mes 1</th><th>Mes 2</th><th>Mes 3</th><th>Mes 4</th><th>Mes 5</th><th>Mes 6</th><th className="bg-slate-200">Total</th></tr></thead>
              <tbody>
                  {(budgetData?.ingresos_detalle || []).map((row:any, i:number) => (
                  <tr key={i}>
                    <td className="font-bold uppercase">{row.label}</td>
                    {row.values.map((v:any, j:number) => <td key={j} className="text-right">{formatCurrency(v)}</td>)}
                    <td className="text-right font-black bg-slate-50">{formatCurrency(row.values.reduce((a:number,b:number)=>a+b,0))}</td>
                  </tr>
                ))}
                <tr className="bg-blue-100 font-black text-blue-900 uppercase">
                  <td>TOTAL INGRESOS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">{formatCurrency(budgetData?.ingresos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0)}</td>
                  ))}
                  <td className="text-right bg-blue-200">{formatCurrency(realTotalIngresos)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-report mt-2">
          <div className="card-header-report bg-slate-700 text-white uppercase">Gastos Familiares Detallados</div>
          <div className="card-content-report">
             <table className="report-table">
               <thead><tr className="bg-slate-50 uppercase"><th>Concepto</th><th>Mes 1</th><th>Mes 2</th><th>Mes 3</th><th>Mes 4</th><th>Mes 5</th><th>Mes 6</th><th className="bg-slate-200">Total</th></tr></thead>
               <tbody>
                     {(budgetData?.gastos_detalle || []).map((row:any, i:number) => (
                    <tr key={i}>
                      <td className="font-medium">{row.label}</td>
                      {row.values.map((v:any, j:number) => <td key={j} className="text-right">{formatCurrency(v)}</td>)}
                      <td className="text-right font-bold bg-slate-50">{formatCurrency(row.values.reduce((a:number,b:number)=>a+b,0))}</td>
                    </tr>
                  ))}
                <tr className="bg-slate-200 font-black uppercase">
                  <td>TOTAL GASTOS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">{formatCurrency(budgetData?.gastos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0)}</td>
                  ))}
                  <td className="text-right bg-slate-300">{formatCurrency(realTotalGastos)}</td>
                </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div className="card-report mt-4 border-slate-900">
          <div className="card-header-report bg-amber-600 text-white uppercase">Gastos Financieros (Deudas)</div>
          <div className="card-content-report">
             <table className="report-table">
               <thead><tr className="bg-slate-50 uppercase"><th>Concepto</th><th>Mes 1</th><th>Mes 2</th><th>Mes 3</th><th>Mes 4</th><th>Mes 5</th><th>Mes 6</th><th className="bg-slate-200">Total</th></tr></thead>
               <tbody>
                  {(budgetData?.deudas_financieras || []).map((row:any, i:number) => (
                    <tr key={i}>
                      <td className="font-medium">{row.label}</td>
                      {row.values.map((v:any, j:number) => <td key={j} className="text-right">{formatCurrency(v)}</td>)}
                      <td className="text-right font-bold bg-slate-50">{formatCurrency(row.values.reduce((a:number,b:number)=>a+b,0))}</td>
                    </tr>
                  ))}
                <tr className="bg-amber-100 font-black uppercase text-amber-900">
                  <td>TOTAL DEUDAS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">{formatCurrency(budgetData?.deudas_financieras?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0)}</td>
                  ))}
                  <td className="text-right bg-amber-200">{formatCurrency(realTotalDeudas)}</td>
                </tr>
                <tr className="bg-indigo-50 font-black">
                  <td className="text-indigo-800">Cuota Crédito a Solicitar</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right text-indigo-900">{formatCurrency(simulatedCuota)}</td>
                  ))}
                  <td className="text-right bg-indigo-100 text-indigo-900">{formatCurrency(simulatedCuota * 6)}</td>
                </tr>
                <tr className="bg-slate-100 font-black">
                  <td colSpan={7} className="text-right uppercase">TOTAL DEUDAS + CUOTA (6 MESES):</td>
                  <td className="text-right">{formatCurrency(realTotalDeudas + (simulatedCuota * 6))}</td>
                </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div className="mt-3 p-2 bg-blue-50 border-2 border-blue-100 rounded-xl flex justify-between items-center font-black">
           <span className="text-blue-900 uppercase text-[9px]">Disponible Bruto (Ingresos - Gastos):</span>
           <span className="text-blue-900 text-base">{formatCurrency(realTotalIngresos - realTotalGastos)}</span>
        </div>

        {/* PROYECCIÓN DE AHORROS */}
        <div className="mt-4 card-report border-indigo-800">
          <div className="card-header-report bg-indigo-800 text-white uppercase">Proyección de Ahorros / Saldo Final Acumulado</div>
          <div className="card-content-report">
            <div className="grid grid-cols-6 gap-2">
              {(() => {
                const ahorroInicial = budgetData?.ahorro_inicial || 0;
                const progress = [];
                let current = ahorroInicial;
                for (let i = 0; i < 6; i++) {
                  const monthlyIngresos = budgetData?.ingresos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0;
                  const monthlyGastos = budgetData?.gastos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0;
                  const monthlyDeudas = (budgetData?.deudas_financieras?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0) + simulatedCuota;
                  
                  const deposito = monthlyIngresos - monthlyGastos - monthlyDeudas;
                  const fin = current + deposito;
                  progress.push({ deposito, fin });
                  current = fin;
                }

                return progress.map((ah, i) => (
                  <div key={i} className="bg-slate-50 p-2 rounded-lg border text-center">
                    <p className="text-[7.5pt] font-black text-slate-400 mb-1 uppercase">Mes {i+1}</p>
                    <p className={`font-bold ${ah.deposito >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontSize: '11pt' }}>
                      {ah.deposito >= 0 ? '+' : ''} {formatCurrency(ah.deposito)}
                    </p>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <p className="font-black text-slate-800" style={{ fontSize: '11pt' }}>{formatCurrency(ah.fin)}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-6 mt-3">
            <div className="p-3 border rounded-2xl bg-white space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 border-b pb-1">Resumen y Diagnóstico de Capacidad</p>
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report uppercase font-bold text-slate-400" style={{ fontSize: '8pt' }}>Sobrante Mensual</p>
                    <p className={`font-black ${monthlySobranteBruto > 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontSize: '11pt' }}>{formatCurrency(monthlySobranteBruto)}</p>
                 </div>
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report uppercase font-bold text-slate-400" style={{ fontSize: '8pt' }}>% Gasto s/ Ingreso</p>
                    <p className="font-black" style={{ fontSize: '11pt' }}>{realGastoSobreIngreso.toFixed(1)} %</p>
                 </div>
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report uppercase font-bold text-slate-400" style={{ fontSize: '8pt' }}>% Endeudamiento</p>
                    <p className={`font-black ${realEndeudamiento > (thr.edeMaxCritico || 45) ? 'text-red-600' : 'text-indigo-600'}`} style={{ fontSize: '11pt' }}>{realEndeudamiento.toFixed(1)} %</p>
                 </div>
              </div>
              {(() => {
                const de = Number(realEndeudamiento) || 0;
                const gi = Number(realGastoSobreIngreso) || 0;
                const isCritical = gi > (thr.gastoMaxCritico || 85) || de > (thr.edeMaxCritico || 45);
                const isModerate = gi > (thr.gastoMaxModerado || 75) || de > (thr.edeMaxModerado || 35);
                return (
                  <div className={`p-3 border rounded-xl ${isCritical ? 'bg-red-50 border-red-100' : isModerate ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                    <p className={`text-[7px] font-black flex items-center gap-1 ${isCritical ? 'text-red-800' : isModerate ? 'text-amber-800' : 'text-green-800'}`}>
                      {isCritical ? '⚠️ ATENCIÓN:' : isModerate ? '⚠️ ADVERTENCIA:' : '✅ CONCLUSIÓN AUTOMÁTICA:'}
                    </p>
                    <p className={`italic leading-tight mt-1 ${isCritical ? 'text-red-900 font-black uppercase' : isModerate ? 'text-amber-900 font-bold' : 'text-green-900 font-bold'}`} style={{ fontSize: '11.5pt' }}>
                      {isCritical 
                        ? `SOBREPASA LÍMITE CRÍTICO: El nivel de endeudamiento y/o gastos superan los parámetros de seguridad permitidos, lo que implica un riesgo elevado.`
                        : isModerate
                        ? "CAPACIDAD LIMITADA: El socio presenta un nivel de endeudamiento moderado que requiere seguimiento cercano de su capacidad de pago."
                        : "CAPACIDAD ÓPTIMA: El nivel de endeudamiento es saludable y permite la asunción de la nueva cuota sin comprometer la canasta básica familiar."
                      }
                    </p>
                  </div>
                );
              })()}
            </div>
           
           <div className="p-2 border rounded-2xl bg-white flex flex-col justify-center">
              <p className="text-[8px] font-black uppercase text-slate-400 text-center border-b pb-0.5 mb-2">Semáforos de Riesgo</p>
              <div className="flex justify-center gap-6 items-center">
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <p className="text-[7px] font-black uppercase text-slate-500">Ahorro</p>
                    <div style={{ width: '30px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realGastoSobreIngreso > (thr.gastoMaxCritico || 85) ? '#ef4444' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: (realGastoSobreIngreso > (thr.gastoMaxModerado || 75) && realGastoSobreIngreso <= (thr.gastoMaxCritico || 85)) ? '#f59e0b' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realGastoSobreIngreso <= (thr.gastoMaxModerado || 75) ? '#22c55e' : '#d1d5db' }}></div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <p className="text-[7px] font-black uppercase text-slate-500">Deuda</p>
                    <div style={{ width: '30px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realEndeudamiento > (thr.edeMaxCritico || 45) ? '#ef4444' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: (realEndeudamiento > (thr.edeMaxModerado || 35) && realEndeudamiento <= (thr.edeMaxCritico || 45)) ? '#f59e0b' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realEndeudamiento <= (thr.edeMaxModerado || 35) ? '#22c55e' : '#d1d5db' }}></div>
                    </div>
                 </div>
              </div>
              <div className="mt-2 text-center">
                 {(() => {
                   const de = Number(realEndeudamiento) || 0;
                   const gi = Number(realGastoSobreIngreso) || 0;
                   const isCritical = gi > (thr.gastoMaxCritico || 85) || de > (thr.edeMaxCritico || 45);
                   const isModerate = gi > (thr.gastoMaxModerado || 75) || de > (thr.edeMaxModerado || 35);
                   
                   if (isCritical) return (
                     <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #fecaca' }}>
                       Riesgo Crítico
                     </span>
                   );
                   if (isModerate) return (
                     <span style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '3px 10px', borderRadius: '20px', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #fef3c7' }}>
                       Riesgo Moderado
                     </span>
                   );
                   return (
                     <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #dcfce7' }}>
                       Riesgo Bajo
                     </span>
                   );
                 })()}
              </div>
           </div>
        </div>
      </div>

      {/* PÁGINA 3: CUALITATIVA */}
      <div className="page-break bg-white page-evaluation">
        <div className="flex justify-between items-center bg-indigo-50/30 p-4 rounded-3xl border border-indigo-100 mb-4 no-print-shadow">
           <div>
              <h2 className="text-xl font-black text-indigo-900 uppercase tracking-tighter">EVALUACIÓN SCORING - CREDIT</h2>
              <div className="flex gap-4 text-[7px] font-black mt-1">
                  <p className="text-slate-400 mr-2 uppercase tracking-widest">Puntos de Corte:</p>
                  <p className="text-red-500">DENEGAR (0-150)</p>
                  <p className="text-amber-500">REVISAR (151-180)</p>
                  <p className="text-green-500">APROBAR (181-999)</p>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <p className="text-[7.5pt] font-black uppercase text-indigo-400 leading-none mb-1">Dictamen Final</p>
              <div className={`px-10 py-2 rounded-2xl font-black text-xl shadow-xl border-2 tracking-tighter ${recomendacion === 'APROBADO' ? 'bg-green-500 text-white border-green-400' : recomendacion === 'OBSERVADO' ? 'bg-amber-500 text-white border-amber-400' : 'bg-red-500 text-white border-red-400'}`}>
                 {recomendacion}
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            {scoringProfiles.map((profile, idx) => (
              <div key={idx} className="card-report" style={{ borderColor: profile.color === 'indigo' ? '#c7d2fe' : (profile.color === 'purple' ? '#e9d5ff' : '#a7f3d0') }}>
                 <div className="card-header-report flex justify-between" style={{ backgroundColor: profile.color === 'indigo' ? '#eef2ff' : (profile.color === 'purple' ? '#f5f3ff' : '#ecfdf5'), color: profile.color === 'indigo' ? '#4338ca' : (profile.color === 'purple' ? '#7e22ce' : '#047857') }}>
                   <span>{profile.label}</span>
                   <span className="opacity-50">{profile.icon}</span>
                 </div>
                 <div className="card-content-report">
                   <table className="report-table">
                     <thead><tr className="uppercase bg-slate-50"><th>Variable</th><th>Dato</th><th className="text-right">Score</th></tr></thead>
                     <tbody>
                       {(profile.data?.details || []).map((d:any, i:number) => (
                         <tr key={i}>
                           <td>{d.name}</td>
                           <td className="italic text-slate-500">{d.value}</td>
                           <td className="text-right font-bold" style={{ color: profile.color === 'indigo' ? '#4f46e5' : (profile.color === 'purple' ? '#9333ea' : '#10b981') }}>{d.score}</td>
                         </tr>
                       ))}
                       <tr className="bg-slate-50 font-extrabold">
                         <td colSpan={2} className="text-right uppercase">TOTAL {profile.label}</td>
                         <td className="text-right text-sm">{profile.data?.total || '0'}</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
              </div>
            ))}
        </div>



        <div className="mt-2 card-report">
           <div className="card-header-report bg-slate-900 text-white uppercase italic tracking-widest py-2">Análisis FODA</div>
           <div className="card-content-report grid grid-cols-2 gap-3 p-3">
              <div className="p-3 border-l-4 border-green-500 bg-green-50/50 rounded-r-lg">
                 <p className="text-[9.5pt] font-black text-green-700 uppercase mb-1">Fortalezas</p>
                 <p className="leading-tight italic" style={{ fontSize: '9.5pt' }}>{qualitativeState?.foda?.fortalezas || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg">
                 <p className="text-[9.5pt] font-black text-blue-700 uppercase mb-1">Oportunidades</p>
                 <p className="leading-tight italic" style={{ fontSize: '9.5pt' }}>{qualitativeState?.foda?.oportunidades || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-lg">
                 <p className="text-[9.5pt] font-black text-amber-700 uppercase mb-1">Debilidades</p>
                 <p className="leading-tight italic" style={{ fontSize: '9.5pt' }}>{qualitativeState?.foda?.debilidades || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-red-500 bg-red-50/50 rounded-r-lg">
                 <p className="text-[9.5pt] font-black text-red-700 uppercase mb-1">Amenazas</p>
                 <p className="leading-tight italic" style={{ fontSize: '9.5pt' }}>{qualitativeState?.foda?.amenazas || 'No registradas'}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
           {/* REFERENCIAS */}
           <div className="card-report h-full">
              <div className="card-header-report bg-slate-800 text-white uppercase italic tracking-widest py-2">Referencias Verificadas</div>
              <div className="card-content-report p-0">
                 <table className="report-table">
                    <thead><tr className="bg-slate-50 text-[8pt]"><th>VARIABLE</th><th>TELÉFONO</th><th>COMENTARIO</th></tr></thead>
                    <tbody>
                       {Object.entries(qualitativeState?.referencias || {}).map(([key, data]: any) => (
                          <tr key={key}>
                             <td className="font-black uppercase text-slate-500" style={{ fontSize: '9.5pt' }}>{key}</td>
                             <td className="font-bold" style={{ fontSize: '9.5pt' }}>{data.phone || '-'}</td>
                             <td className="italic" style={{ fontSize: '9.5pt' }}>{data.comment || '-'}</td>
                          </tr>
                       ))}
                       {Object.keys(qualitativeState?.referencias || {}).length === 0 && (
                          <tr><td colSpan={3} className="text-center italic opacity-50 py-4 tabular-nums" style={{ fontSize: '9.5pt' }}>Sin referencias registradas</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ANALISIS FINAL */}
           <div className="card-report border-indigo-600 h-full">
              <div className="card-header-report bg-indigo-900 text-white uppercase italic tracking-widest py-2">Análisis Final / Dictamen Analista</div>
              <div className="card-content-report min-h-[90px] bg-indigo-50/30 p-4">
                 <p className="leading-relaxed font-medium italic text-indigo-950" style={{ fontSize: '9.5pt' }}>
                    {qualitativeState?.comentarioAnalista || 'El analista no ha ingresado un dictamen final detallado para esta evaluación.'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* PÁGINA 4: HOJA DE RESUMEN */}
      <div className="page-break bg-white space-y-6">


        <div className="flex justify-between items-center border-b-2 border-indigo-900 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Hoja de Resumen de Evaluación</h2>
            <p className="text-[8px] font-bold text-slate-400">Consolidado de resultados y dictamen final del analista</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[8px] font-black border border-indigo-100 uppercase">ESTADO: {initialData?.estado}</span>
            <p className="text-[6.5px] mt-1 font-bold italic uppercase">SOCIO: {editData.nombres_apellidos}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
           {[
             { label: 'Monto Solicitado', value: `S/ ${(parseFloat(credito.monto_solicitado)||0).toLocaleString()}`, sub: `Plazo: ${credito.plazo_meses} Meses` },
             { label: 'TEA Aplicada', value: `${(parseFloat(credito.tea)||0).toFixed(2)}%`, sub: `TEM: ${(parseFloat(credito.tea)/12).toFixed(2)}%` },
             { label: 'Cuota Mensual', value: `S/ ${simulatedCuota.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: '-' },
             { label: 'Pago Diario (Est.)', value: `S/ ${(simulatedCuota/30).toFixed(2)}`, sub: '-' }
           ].map((m, i) => (
             <div key={i} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
               <p className="label-report uppercase font-bold text-slate-400" style={{ fontSize: '8.5pt' }}>{m.label}</p>
               <p className="font-black text-indigo-700 leading-tight" style={{ fontSize: '11pt' }}>{m.value}</p>
               <p className="font-bold opacity-40" style={{ fontSize: '7pt' }}>{m.sub}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-2 gap-8 items-stretch">
           <div className="flex flex-col gap-4">
              <div className="card-report border-indigo-100 flex-1">
                 <div className="card-header-report text-indigo-800">Cálculo de Capacidad de Pago</div>
                 <div className="card-content-report space-y-2.5 p-4">
                    <div className="flex justify-between font-bold" style={{ fontSize: '11pt' }}><span>Ingresos promedio mensual:</span><span>{formatCurrency(realTotalIngresos/6)}</span></div>
                    <div className="flex justify-between font-bold text-red-500" style={{ fontSize: '11pt' }}><span>Gastos familiares mensual:</span><span>- {formatCurrency(realTotalGastos/6)}</span></div>
                    <div className="flex justify-between font-bold text-red-500" style={{ fontSize: '11pt' }}><span>Otros pagos de deudas:</span><span>- {formatCurrency(realTotalDeudas/6)}</span></div>
                    <div className="flex justify-between items-center mt-2 border-t pt-2">
                       <span className="font-black text-slate-800" style={{ fontSize: '11pt' }}>CAPACIDAD SOBRA (Previo):</span>
                       <span className="font-black text-lg text-slate-900">{formatCurrency(monthlySobranteBruto)}</span>
                    </div>
                 </div>
                 <div className={`p-2.5 rounded-xl mt-3 flex justify-between items-center border ${monthlyMargenFinal >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <span className={`font-black uppercase ${monthlyMargenFinal >= 0 ? 'text-green-800' : 'text-red-800'}`} style={{ fontSize: '11pt' }}>¿Cubre cuota proyectada?</span>
                    <span className={`font-black text-lg ${monthlyMargenFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{monthlyMargenFinal >= 0 ? 'SÍ CUBRE' : 'NO CUBRE'}</span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-4">
              <div className="card-report flex-1 border-slate-200">
                 <div className="card-header-report text-green-700">Matriz de Decisión Final</div>
                 <div className="card-content-report space-y-2.5">
                    {[
                      { l: 'CUMPLE CLASIFICACIÓN RIESGO', v: (sc: string) => sc !== 'Pérdida' && sc !== 'Dudoso' ? 'CUMPLE ✅' : 'NO CUMPLE ❌', color: (v: string) => v.includes('✅') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600' },
                      { l: 'CAPACIDAD DE PAGO MENSUAL', v: monthlyMargenFinal >= 0 ? 'CUMPLE ✅' : 'NO CUMPLE ❌', color: (v: string) => v.includes('✅') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600' },
                      { l: 'EVALUACIÓN CUALITATIVA', v: scoreCualitativo >= 180 ? 'CUMPLE ✅' : 'NO CUMPLE ❌', color: (v: string) => v.includes('✅') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600' },
                      { l: 'APORTES DISPONIBLES', v: 'CUMPLE ✅', color: (v: string) => 'bg-green-100 text-green-600' }
                    ].map((row, i) => {
                       const val = typeof row.v === 'function' ? row.v(clasificacion) : row.v;
                       const cls = typeof row.color === 'function' ? row.color(val) : row.color;
                       return (
                        <div key={i} className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-xl">
                           <span className="font-black text-slate-500 uppercase" style={{ fontSize: '9pt' }}>{row.l}</span>
                           <span className={`${cls} px-3 py-0.5 rounded-md font-black`} style={{ fontSize: '11pt' }}>{val}</span>
                        </div>
                       );
                    })}
                    <div className={`mt-3 p-3 text-white text-center rounded-2xl shadow-lg flex flex-col justify-center items-center ${recomendacion === 'APROBADO' ? 'bg-green-500 shadow-green-100' : recomendacion === 'OBSERVADO' ? 'bg-amber-500 shadow-amber-100' : 'bg-red-500 shadow-red-100'}`}>
                       <div className="w-full flex flex-col items-center text-center">
                          <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mb-0.5">Dictamen Sugerido</p>
                          <h5 className="text-xl font-black leading-tight uppercase">{recomendacion}</h5>
                          <p className="text-[6px] mt-0.5 opacity-80 uppercase font-bold tracking-tighter">BASADO EN LOS PARÁMETROS DE RIESGO</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* LÍMITE MÁXIMO BANNER - NUEVO DISEÑO */}
        <div className="mt-3 p-4 bg-indigo-900 text-white rounded-2xl shadow-xl relative overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-4 relative z-10 w-2/3">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                   <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Límite Máximo Estimado</p>
                   <h3 className="text-2xl font-black tracking-tighter text-white">{formatCurrency(monthlySobranteBruto * 60)}</h3>
                   <p className="text-[7px] mt-0.5 opacity-50 italic leading-tight">
                      Monto máximo financiable basado en capacidad mensual de {formatCurrency(monthlySobranteBruto)} y un plazo referencial.
                   </p>
                </div>

            </div>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="no-print bg-white text-indigo-900 px-4 py-1.5 rounded-xl font-black text-[8px] uppercase flex items-center gap-1.5 shadow-xl border border-white/50 cursor-not-allowed opacity-80">
                   Imprimir <span>→</span>
                </div>
            </div>

            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-48 h-full bg-white/5 skew-x-[-20deg] translate-x-12"></div>
            <div className="absolute bottom-4 right-4 text-white/5">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h2v4zm4 0h-2V7h2v10z"/>
                 </svg>
             </div>
         </div>

         <div className="grid grid-cols-2 gap-8 items-start mt-6">
           <div className="p-6 border-2 border-slate-100 rounded-[40px] flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Check List Expediente de Crédito</p>
              <div className="grid grid-cols-1 gap-y-2.5">
                 {[
                   { id: 'liquidacion', label: 'LIQUIDACIÓN DE PRÉSTAMO' },
                   { id: 'propuesta', label: 'PROPUESTA DE CRÉDITO' },
                   { id: 'cronograma', label: 'CRONOGRAMA DE PAGOS' },
                   { id: 'estado_titular', label: 'ESTADO DE CUENTA TITULAR' },
                   { id: 'estado_aval', label: 'ESTADO DE CUENTA AVAL' },
                   { id: 'pagare', label: 'PAGARÉ' },
                   { id: 'contrato_mutuo', label: 'CONTRATO MUTUO' },
                   { id: 'acuerdo_incompleto', label: 'CONTRATO DE ACUERDO DE PAGARÉ' },
                   { id: 'copia_dni', label: 'COPIA DNI TITULAR / AVAL' },
                   { id: 'central_titular', label: 'CENTRAL DE RIESGO TITULAR' },
                   { id: 'central_avales', label: 'CENTRAL DE RIESGO AVAL' },
                   { id: 'foto_negocio', label: 'FOTO DE NEGOCIO' },
                   { id: 'foto_domicilio', label: 'FOTO DE DOMICILIO' },
                   { id: 'recibo_servicios', label: 'RECIBO DE LUZ O AGUA' }
                 ].map((item, i) => {
                   const isChecked = initialData?.datos_resumen?.checklist?.[item.id]
                   return (
                     <div key={i} className="flex items-center gap-3 font-black text-slate-700" style={{ fontSize: '11pt' }}>
                       <div className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center ${isChecked ? 'border-slate-900 text-indigo-900 bg-slate-50' : 'border-slate-200 text-transparent'}`}>✓</div>
                       <span className={isChecked ? 'opacity-100' : 'opacity-40 font-bold'}>{i+1}. {item.label}</span>
                     </div>
                   )
                 })}
              </div>
           </div>

           {initialData?.datos_resumen?.excepcion && (
             <div className="p-6 border-2 border-amber-200 bg-amber-50/20 rounded-[40px] flex-1 h-full min-h-[300px]">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 bg-amber-100 rounded-lg">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                   </div>
                   <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Solicitud de Excepción</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm min-h-[220px]">
                   <p className="font-bold text-amber-900 leading-relaxed italic uppercase italic" style={{ fontSize: '11pt' }}>
                      "{initialData.datos_resumen.excepcion}"
                   </p>
                </div>
                <p className="mt-4 text-[7px] font-black text-amber-400 uppercase text-center italic">
                   * Justificación obligatoria por falta de documentos en el expediente.
                </p>
             </div>
           )}
         </div>


          <div className="mt-10 border-t border-slate-100 pt-6 text-center">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">DOCUMENTO DE EVALUACIÓN DIGITAL ARISK EXPERT v1.0</p>
          </div>
        </div>
     </div>
   )
}

