"use client"

import React from 'react'

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
  scoringConfig
}) => {
  const correlativoStr = String(initialData?.correlativo || '000').padStart(3, '0')
 
  // Extract Thresholds from Config
  const thr = scoringConfig?.thresholds || {
    edeMaxModerado: 30,
    edeMaxCritico: 40,
    gastoMaxModerado: 70,
    gastoMaxCritico: 90
  }

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

  return (
    <div className="hidden print:block bg-white text-black w-full overflow-visible" id="institutional-report">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0.5cm; }
          .page-break { page-break-after: always; break-after: page; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; font-family: sans-serif; }
          
          /* Force hide ALL UI elements that are NOT the report during print */
          aside, header, nav, button, [role="navigation"], .no-print { display: none !important; opacity: 0 !important; visibility: hidden !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
          
          /* Remove layout constraints from the main content container during print */
          main, div.flex-col, div.w-full { 
            padding-left: 0 !important; 
            padding-right: 0 !important; 
            padding-top: 0 !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: 100% !important; 
            left: 0 !important;
            transform: none !important;
          }

          .card-report { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 6px; background: white; }
          .card-header-report { background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 3px 8px; font-weight: 800; font-size: 10px; text-transform: uppercase; color: #1e293b; }
          .card-content-report { padding: 6px 8px; }
          .label-report { font-size: 8px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 0px; line-height: 1.1; }
          .value-report { font-size: 12px; color: #0f172a; font-weight: 800; min-height: 14px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1px; line-height: 1.2; }
          table.report-table { width: 100%; border-collapse: collapse; font-size: 9px; }
          table.report-table th, table.report-table td { border: 1px solid #e2e8f0; padding: 3px 4px; }
          table.report-table thead th { background: #f1f5f9; font-weight: 800; text-align: left; }
          .blue-header { background: #1e40af; color: white; padding: 8px; text-align: center; font-weight: 900; }
        }
        @media screen {
          #institutional-report { display: none !important; opacity: 0 !important; }
        }
      `}} />

      {/* PÁGINA 1: SOLICITUD */}
      <div className="page-break p-6 bg-white">
        <div className="text-center mb-4">
          <h1 className="text-xl font-black text-slate-900 leading-none">COOPAC LOBATON RUC: 20118475870</h1>
          <h2 className="text-sm font-bold text-slate-700 mt-1 uppercase">MARISCAL LAS HERAS 375 - LINCE</h2>
          <div className="mt-3 inline-block border-2 border-black px-12 py-1">
            <h3 className="text-2xl font-black">SOLICITUD N° {correlativoStr}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* DATOS DEL SOCIO */}
          <div className="card-report">
            <div className="card-header-report text-blue-700">DATOS DEL SOCIO</div>
            <div className="card-content-report grid grid-cols-4 gap-x-3 gap-y-1">
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
               <div><p className="label-report">Aportes S/</p><p className="value-report font-black">{(parseFloat(editData.aportes_totales) || 0).toLocaleString()}</p></div>
               <div><p className="label-report">Clasif. Central</p><p className="value-report uppercase">{editData.clasificacion_central_riesgo || 'Normal'}</p></div>
               <div><p className="label-report">DNI</p><p className="value-report">{editData.dni}</p></div>
               <div><p className="label-report">Calif. Interna</p><p className="value-report uppercase">{editData.calificacion_interna || 'Normal'}</p></div>
            </div>
          </div>

          {/* ACTIVIDAD LABORAL */}
          <div className="card-report">
            <div className="card-header-report text-blue-700">ACTIVIDAD LABORAL</div>
            <div className="card-content-report grid grid-cols-2 gap-x-3 gap-y-1">
               <div className="col-span-2"><p className="label-report">Empresa</p><p className="value-report uppercase">{editData.empresa_laboral || 'INDEPENDIENTE'}</p></div>
               <div><p className="label-report">RUC</p><p className="value-report">{editData.ruc_empresa || editData.ruc || '-'}</p></div>
               <div><p className="label-report">Cargo</p><p className="value-report uppercase">{editData.cargo || '-'}</p></div>
               <div className="col-span-2"><p className="label-report">Dir. Negocio</p><p className="value-report uppercase">{editData.direccion_negocio || '-'}</p></div>
               <div><p className="label-report">Dist. Negocio</p><p className="value-report uppercase">{editData.distrito_negocio || '-'}</p></div>
               <div><p className="label-report">Ingreso S/</p><p className="value-report font-black">{(parseFloat(editData.ingreso_bruto_mensual) || 0).toLocaleString()}</p></div>
               <div><p className="label-report">Fec. Ingreso</p><p className="value-report">{editData.fecha_ingreso_laboral || editData.fecha_ingreso || '-'}</p></div>
               <div><p className="label-report">Tamaño Empresa</p><p className="value-report uppercase">{editData.tamano_empresa || '-'}</p></div>
               <div className="col-span-2"><p className="label-report">Actividad Económica</p><p className="value-report uppercase">{editData.actividad_economica || '-'}</p></div>
            </div>
          </div>
        </div>

        {/* DATOS DEL CÓNYUGE */}
        <div className="card-report mt-2 border-indigo-200">
           <div className="card-header-report bg-indigo-50 text-indigo-700">DATOS DEL CÓNYUGE</div>
           <div className="card-content-report grid grid-cols-6 gap-x-3 gap-y-1">
              <div className="col-span-3"><p className="label-report">Nombres y Apellidos</p><p className="value-report uppercase">{conyuge?.nombres_apellidos || '-'}</p></div>
              <div><p className="label-report">DNI</p><p className="value-report">{conyuge?.dni || '-'}</p></div>
              <div><p className="label-report">Ingresos S/</p><p className="value-report font-black">{(parseFloat(conyuge?.ingresos) || 0).toLocaleString()}</p></div>
              <div><p className="label-report">Central Riesgo</p><p className="value-report uppercase">{conyuge?.central_riesgo || 'Normal'}</p></div>
              <div className="col-span-2"><p className="label-report">Fec. Nacimiento</p><p className="value-report">{conyuge?.fecha_nacimiento || '-'}</p></div>
              <div className="col-span-2"><p className="label-report">Estado Civil</p><p className="value-report uppercase">{conyuge?.estado_civil || '-'}</p></div>
              <div className="col-span-2"><p className="label-report">Instrucción</p><p className="value-report uppercase">{conyuge?.instruccion || '-'}</p></div>
           </div>
        </div>

        {/* DECLARACIÓN PATRIMONIAL */}
        <div className="card-report mt-2 border-amber-200">
           <div className="card-header-report bg-amber-50 text-amber-700">DECLARACIÓN PATRIMONIAL</div>
           <div className="card-content-report">
              <table className="report-table">
                <thead><tr className="bg-amber-50"><th>TIPO DE BIEN / ORIGEN</th><th>¿HIPOTECADO?</th><th className="text-right">VALOR ESTIMADO S/</th></tr></thead>
                <tbody>
                  {(patrimonio || []).map((p, i) => (
                    <tr key={i}><td>{p.nombre}</td><td className="text-center">{p.hipotecado}</td><td className="text-right font-black">S/ {(parseFloat(p.valor)||0).toLocaleString()}</td></tr>
                  ))}
                  <tr className="bg-amber-100 font-black"><td colSpan={2} className="text-right uppercase">TOTAL PATRIMONIO:</td><td className="text-right">S/ {totalPatrimonio.toLocaleString()}</td></tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* REQUERIMIENTO DE CRÉDITO */}
        <div className="card-report mt-2 border-green-200">
           <div className="card-header-report bg-green-50 text-green-700">REQUERIMIENTO DE CRÉDITO</div>
           <div className="card-content-report">
              <div className="grid grid-cols-5 gap-3 mb-3">
                 <div><p className="label-report">Producto Financiero</p><p className="value-report uppercase">{credito.producto || '-'}</p></div>
                 <div><p className="label-report">Condición (Tasa)</p><p className="value-report uppercase">{credito.condicion_tasa || '-'}</p></div>
                 <div><p className="label-report">Monto Solicitado S/</p><p className="value-report font-black">{(parseFloat(credito.monto_solicitado)||0).toLocaleString()}</p></div>
                 <div><p className="label-report">Plazo (Meses)</p><p className="value-report font-black">{credito.plazo_meses}</p></div>
                 <div><p className="label-report">Destino del Crédito</p><p className="value-report uppercase">{credito.destino_credito || '-'}</p></div>
              </div>
              <div className="bg-slate-900 text-white px-6 py-4 rounded-xl flex justify-center items-center gap-16 border-t-2 border-green-500/50">
                 <div className="text-center">
                   <p className="text-[8px] font-black uppercase opacity-60 mb-0.5 tracking-widest">Tasa Anual (TEA)</p>
                   <p className="text-2xl font-black text-green-400">{(parseFloat(credito.tea)||0).toFixed(2)}%</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[8px] font-black uppercase opacity-60 mb-0.5 tracking-widest">Tasa Mensual (TEM)</p>
                   <p className="text-2xl font-black text-green-400">{(parseFloat(credito.tem) || (parseFloat(credito.tea)/12) || 0).toFixed(2)}%</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-32 flex justify-center">
          <div className="text-center">
            <div className="w-64 border-t border-black mb-1"></div>
            <p className="text-[10px] font-black uppercase italic">Firma del Socio</p>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: EVALUACIÓN FINANCIERA */}
      <div className="page-break p-8 bg-white">
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
                    {row.values.map((v:any, j:number) => <td key={j} className="text-right">S/ {v}</td>)}
                    <td className="text-right font-black bg-slate-50">S/ {row.values.reduce((a:number,b:number)=>a+b,0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-blue-100 font-black text-blue-900 uppercase">
                  <td>TOTAL INGRESOS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">S/ {(budgetData?.ingresos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0).toLocaleString()}</td>
                  ))}
                  <td className="text-right bg-blue-200">S/ {realTotalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                      {row.values.map((v:any, j:number) => <td key={j} className="text-right">S/ {v}</td>)}
                      <td className="text-right font-bold bg-slate-50">S/ {row.values.reduce((a:number,b:number)=>a+b,0).toLocaleString()}</td>
                    </tr>
                  ))}
                <tr className="bg-slate-200 font-black uppercase">
                  <td>TOTAL GASTOS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">S/ {(budgetData?.gastos_detalle?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0).toLocaleString()}</td>
                  ))}
                  <td className="text-right bg-slate-300">S/ {realTotalGastos.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div className="card-report mt-2 border-amber-600">
          <div className="card-header-report bg-amber-600 text-white uppercase">Gastos Financieros (Deudas)</div>
          <div className="card-content-report">
             <table className="report-table">
               <thead><tr className="bg-slate-50 uppercase"><th>Concepto</th><th>Mes 1</th><th>Mes 2</th><th>Mes 3</th><th>Mes 4</th><th>Mes 5</th><th>Mes 6</th><th className="bg-slate-200">Total</th></tr></thead>
               <tbody>
                  {(budgetData?.deudas_financieras || []).map((row:any, i:number) => (
                    <tr key={i}>
                      <td className="font-medium">{row.label}</td>
                      {row.values.map((v:any, j:number) => <td key={j} className="text-right">S/ {v}</td>)}
                      <td className="text-right font-bold bg-slate-50">S/ {row.values.reduce((a:number,b:number)=>a+b,0).toLocaleString()}</td>
                    </tr>
                  ))}
                <tr className="bg-amber-100 font-black uppercase text-amber-900">
                  <td>TOTAL DEUDAS MENSUAL</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right">S/ {(budgetData?.deudas_financieras?.reduce((sum:number, row:any) => sum + (parseFloat(row.values?.[i]) || 0), 0) || 0).toLocaleString()}</td>
                  ))}
                  <td className="text-right bg-amber-200">S/ {realTotalDeudas.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-indigo-50 font-black">
                  <td className="text-indigo-800">Cuota Crédito a Solicitar</td>
                  {Array(6).fill(0).map((_, i) => (
                    <td key={i} className="text-right text-indigo-900">S/ {simulatedCuota.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  ))}
                  <td className="text-right bg-indigo-100 text-indigo-900">S/ {(simulatedCuota * 6).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-slate-100 font-black">
                  <td colSpan={7} className="text-right uppercase">TOTAL DEUDAS + CUOTA (6 MESES):</td>
                  <td className="text-right">S/ {(realTotalDeudas + (simulatedCuota * 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
               </tbody>
             </table>
          </div>
        </div>

        <div className="mt-1 p-1.5 bg-blue-50 border-2 border-blue-100 rounded-xl flex justify-between items-center font-black">
           <span className="text-blue-900 uppercase text-[9px]">Disponible Bruto (Ingresos - Gastos):</span>
           <span className="text-blue-900 text-base">S/ + {(realTotalIngresos - realTotalGastos).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                    <p className="text-[7px] font-black text-slate-400 mb-1 uppercase">Mes {i+1}</p>
                    <p className={`text-[9px] font-bold ${ah.deposito >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ah.deposito >= 0 ? '+' : ''} {ah.deposito.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="h-px bg-slate-200 my-1"></div>
                    <p className="text-[10px] font-black text-slate-800">S/ {ah.fin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-2">
            <div className="p-4 border rounded-2xl bg-white space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 border-b pb-1">Resumen y Diagnóstico de Capacidad</p>
              <div className="grid grid-cols-3 gap-2">
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report">Sobrante Mensual</p>
                    <p className={`text-[11px] font-black ${monthlySobranteBruto > 0 ? 'text-green-600' : 'text-red-600'}`}>S/ {monthlySobranteBruto.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                 </div>
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report">% Gasto s/ Ingreso</p>
                    <p className="text-[11px] font-black">{realGastoSobreIngreso.toFixed(1)} %</p>
                 </div>
                 <div className="p-2 bg-slate-50 rounded border text-center">
                    <p className="label-report">% Endeudamiento</p>
                    <p className={`text-[11px] font-black ${realEndeudamiento > thr.edeMaxCritico ? 'text-red-600' : 'text-indigo-600'}`}>{realEndeudamiento.toFixed(1)} %</p>
                 </div>
              </div>
              <div className={`p-3 border rounded-xl ${realEndeudamiento > thr.edeMaxCritico ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                 <p className={`text-[7px] font-black flex items-center gap-1 ${realEndeudamiento > thr.edeMaxCritico ? 'text-red-800' : 'text-green-800'}`}>
                   {realEndeudamiento > thr.edeMaxCritico ? '⚠️ ATENCIÓN:' : '✅ CONCLUSIÓN AUTOMÁTICA:'}
                 </p>
                 <p className={`text-[8px] italic leading-tight mt-1 ${realEndeudamiento > thr.edeMaxCritico ? 'text-red-900' : 'text-green-900'}`}>
                   {realEndeudamiento > thr.edeMaxCritico 
                     ? `SOBREPASA LÍMITE: El nivel de endeudamiento supera el ${thr.edeMaxCritico}% recomendado, lo que implica un riesgo elevado para el socio.`
                     : "CAPACIDAD ÓPTIMA: El nivel de endeudamiento es saludable y permite la asunción de la nueva cuota sin comprometer la canasta básica."
                   }
                 </p>
              </div>
            </div>
           
           <div className="p-2.5 border rounded-2xl bg-white">
              <p className="text-[8px] font-black uppercase text-slate-400 text-center border-b pb-0.5 mb-2">Semáforos de Riesgo</p>
              <div className="flex justify-center gap-6 items-center">
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <p className="text-[7px] font-black uppercase text-slate-500">Ahorro</p>
                    <div style={{ width: '30px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realGastoSobreIngreso > thr.gastoMaxCritico ? '#ef4444' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: (realGastoSobreIngreso > thr.gastoMaxModerado && realGastoSobreIngreso <= thr.gastoMaxCritico) ? '#f59e0b' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realGastoSobreIngreso <= thr.gastoMaxModerado ? '#22c55e' : '#d1d5db' }}></div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <p className="text-[7px] font-black uppercase text-slate-500">Deuda</p>
                    <div style={{ width: '30px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realEndeudamiento > thr.edeMaxCritico ? '#ef4444' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: (realEndeudamiento > thr.edeMaxModerado && realEndeudamiento <= thr.edeMaxCritico) ? '#f59e0b' : '#d1d5db' }}></div>
                       <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: realEndeudamiento <= thr.edeMaxModerado ? '#22c55e' : '#d1d5db' }}></div>
                    </div>
                 </div>
              </div>
              <div className="mt-2 text-center">
                 {(() => {
                   const de = Number(realEndeudamiento) || 0;
                   const gi = Number(realGastoSobreIngreso) || 0;
                   const isCritical = gi > thr.gastoMaxCritico || de > thr.edeMaxCritico;
                   const isModerate = gi > thr.gastoMaxModerado || de > thr.edeMaxModerado;
                   
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
      <div className="page-break p-8 bg-white">
        <h2 className="text-xl font-black text-indigo-900 text-center mb-8 uppercase tracking-widest border-b-2 border-indigo-100 pb-2">EVALUACIÓN SCORING - CREDIT</h2>
        
        <div className="grid grid-cols-2 gap-12">
           <div className="card-report border-indigo-200">
              <div className="card-header-report bg-indigo-50 text-indigo-700 flex justify-between"><span>TITULAR</span><span className="opacity-50">👤</span></div>
              <div className="card-content-report">
                <table className="report-table">
                  <thead><tr className="uppercase bg-slate-50"><th>Variable</th><th>Dato</th><th className="text-right">Score</th></tr></thead>
                  <tbody>
                    {(qualitativeState?.scoring?.titular?.details || []).map((d:any, i:number) => (
                      <tr key={i}><td>{d.name}</td><td className="italic text-slate-500">{d.value}</td><td className="text-right font-bold text-indigo-600">{d.score}</td></tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold"><td colSpan={2} className="text-right uppercase">TOTAL</td><td className="text-right text-sm">{scoreCualitativo}</td></tr>
                  </tbody>
                </table>
              </div>
           </div>
           
           <div className={`card-report border-purple-200 ${!qualitativeState?.scoring?.conyuge ? 'opacity-40' : ''}`}>
              <div className="card-header-report bg-purple-50 text-purple-700 flex justify-between"><span>CÓNYUGE</span><span className="opacity-50">👥</span></div>
              <div className="card-content-report">
                <table className="report-table">
                  <thead><tr className="uppercase bg-slate-50"><th>Variable</th><th>Dato</th><th className="text-right">Score</th></tr></thead>
                  <tbody>
                    {qualitativeState?.scoring?.conyuge ? (
                      qualitativeState.scoring.conyuge.details.map((d:any, i:number) => (
                        <tr key={i}><td>{d.name}</td><td className="italic text-slate-500">{d.value}</td><td className="text-right font-bold text-purple-600">{d.score}</td></tr>
                      ))
                    ) : (
                      (qualitativeState?.scoring?.titular?.details || []).map((d:any, i:number) => (
                        <tr key={i}><td>{d.name}</td><td className="italic text-slate-300">-</td><td className="text-right text-slate-300">0</td></tr>
                      ))
                    )}
                    <tr className="bg-slate-50 font-extrabold"><td colSpan={2} className="text-right uppercase">TOTAL</td><td className="text-right text-sm">{qualitativeState?.scoring?.conyuge?.total || '000'}</td></tr>
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        <div className="mt-8 flex flex-col items-center bg-slate-50 p-6 rounded-3xl border border-slate-200">
           <div className="text-center mb-4">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Puntos de Corte</p>
              <div className="flex gap-6 text-[9px] font-bold">
                 <p className="text-red-500">DENEGAR (0-150)</p>
                 <p className="text-amber-500">REVISAR (151-180)</p>
                 <p className="text-green-500 font-black">APROBAR (181-999)</p>
              </div>
           </div>
           <div className="flex flex-col items-center">
              <p className="text-[8px] font-black uppercase text-indigo-600 mb-2">Dictamen Final</p>
              <div className={`px-12 py-3 rounded-xl font-black text-xl shadow-lg border-2 ${recomendacion === 'APROBADO' ? 'bg-green-500 text-white border-green-600' : 'bg-amber-500 text-white border-amber-600'}`}>
                 {recomendacion}
              </div>
           </div>
        </div>

        <div className="mt-6 card-report">
           <div className="card-header-report bg-slate-900 text-white uppercase italic tracking-widest">Análisis FODA</div>
           <div className="card-content-report grid grid-cols-2 gap-4">
              <div className="p-3 border-l-4 border-green-500 bg-green-50/50">
                 <p className="text-[8px] font-black text-green-700 uppercase mb-1">Fortalezas</p>
                 <p className="text-[9px] leading-tight italic">{qualitativeState?.foda?.fortalezas || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50/50">
                 <p className="text-[8px] font-black text-blue-700 uppercase mb-1">Oportunidades</p>
                 <p className="text-[9px] leading-tight italic">{qualitativeState?.foda?.oportunidades || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-amber-500 bg-amber-50/50">
                 <p className="text-[8px] font-black text-amber-700 uppercase mb-1">Debilidades</p>
                 <p className="text-[9px] leading-tight italic">{qualitativeState?.foda?.debilidades || 'No registradas'}</p>
              </div>
              <div className="p-3 border-l-4 border-red-500 bg-red-50/50">
                 <p className="text-[8px] font-black text-red-700 uppercase mb-1">Amenazas</p>
                 <p className="text-[9px] leading-tight italic">{qualitativeState?.foda?.amenazas || 'No registradas'}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
           {/* REFERENCIAS */}
           <div className="card-report">
              <div className="card-header-report bg-slate-800 text-white uppercase italic tracking-widest">Referencias Verificadas</div>
              <div className="card-content-report">
                 <table className="report-table">
                    <thead><tr className="bg-slate-50"><th>VARIABLE</th><th>TELÉFONO</th><th>COMENTARIO</th></tr></thead>
                    <tbody>
                       {Object.entries(qualitativeState?.referencias || {}).map(([key, data]: any) => (
                          <tr key={key}>
                             <td className="font-black uppercase text-[8px] text-slate-500">{key}</td>
                             <td className="font-bold">{data.phone || '-'}</td>
                             <td className="italic">{data.comment || '-'}</td>
                          </tr>
                       ))}
                       {Object.keys(qualitativeState?.referencias || {}).length === 0 && (
                          <tr><td colSpan={3} className="text-center italic opacity-50 py-4 tabular-nums">Sin referencias registradas</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ANALISIS FINAL */}
           <div className="card-report border-indigo-600">
              <div className="card-header-report bg-indigo-900 text-white uppercase italic tracking-widest">Análisis Final / Dictamen Analista</div>
              <div className="card-content-report min-h-[100px] bg-indigo-50/30 p-4">
                 <p className="text-[10px] leading-relaxed font-medium italic text-indigo-950">
                    {qualitativeState?.comentarioAnalista || 'El analista no ha ingresado un dictamen final detallado para esta evaluación.'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* PÁGINA 4: HOJA DE RESUMEN */}
      <div className="p-8 bg-white space-y-6">
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
               <p className="label-report">{m.label}</p>
               <p className="text-lg font-black text-indigo-700 leading-tight">{m.value}</p>
               <p className="text-[7px] font-bold opacity-40">{m.sub}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-2 gap-8 items-stretch">
           <div className="flex flex-col gap-4">
              <div className="card-report border-indigo-100 flex-1">
                 <div className="card-header-report text-indigo-800">Cálculo de Capacidad de Pago</div>
                 <div className="card-content-report space-y-2.5 p-4">
                    <div className="flex justify-between text-[10px] font-bold"><span>Ingresos promedio mensual:</span><span>S/ {(realTotalIngresos/6).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between text-[10px] font-bold text-red-500"><span>Gastos familiares mensual:</span><span>- S/ {(realTotalGastos/6).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between text-[10px] font-bold text-red-500"><span>Otros pagos de deudas:</span><span>- S/ {(realTotalDeudas/6).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    <div className="flex justify-between items-center mt-2 border-t pt-2">
                       <span className="font-black text-slate-800 text-[11px]">CAPACIDAD SOBRA (Previo):</span>
                       <span className="font-black text-lg text-slate-900">S/ {monthlySobranteBruto.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl mt-3 flex justify-between items-center border ${monthlyMargenFinal >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                       <span className={`text-[9px] font-black uppercase ${monthlyMargenFinal >= 0 ? 'text-green-800' : 'text-red-800'}`}>¿Cubre cuota proyectada?</span>
                       <span className={`font-black text-lg ${monthlyMargenFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{monthlyMargenFinal >= 0 ? 'SÍ CUBRE' : 'NO CUBRE'}</span>
                    </div>
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
                           <span className="text-[9px] font-black text-slate-500 uppercase">{row.l}</span>
                           <span className={`${cls} px-3 py-0.5 rounded-md text-[8px] font-black`}>{val}</span>
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
                   <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Límite Máximo Estimado</p>
                   <h3 className="text-3xl font-black tracking-tighter text-white">S/ {(monthlySobranteBruto * 60).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                   <p className="text-[7px] mt-0.5 opacity-50 italic leading-tight">
                      Monto máximo financiable basado en capacidad mensual de S/ {monthlySobranteBruto.toLocaleString(undefined, { maximumFractionDigits: 0 })} y un plazo referencial.
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

        <div className="mt-8 p-6 border-2 border-slate-100 rounded-[40px]">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Check List Expediente de Crédito</p>
           <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              {[
                'LIQUIDACIÓN DE PRÉSTAMO', 'PROPUESTA DE CRÉDITO', 'CRONOGRAMA DE PAGOS', 'ESTADO DE CUENTA TITULAR',
                'ESTADO DE CUENTA AVAL', 'PAGARÉ', 'CONTRATO MUTUO', 'CONTRATO DE ACUERDO DE PAGARÉ',
                'COPIA DNI TITULAR', 'CENTRAL DE RIESGO TITULAR', 'CENTRAL DE RIESGO AVAL', 'FOTO DE NEGOCIO',
                'FOTO DE DOMICILIO', 'RECIBO DE LUZ O AGUA'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[9px] font-black text-slate-700">
                  <div className="w-5 h-5 border-2 border-slate-900 rounded-lg flex items-center justify-center text-indigo-900">✓</div>
                  <span>{i+1}. {item}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
