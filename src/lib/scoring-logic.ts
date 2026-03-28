/**
 * Motor de Scoring compartido entre EvaluacionCualitativa y HojaResumen
 */

export interface ScoringRule {
  id: string
  name: string
  type: 'exact' | 'range'
  rules: any[]
}

export const calculateFullScoring = (tit: any, con: any, avs: any[], config: any) => {
    const rules: ScoringRule[] = config?.variables || []
    const cutoffs = config?.cutoffs || []

    const processData = (p: any) => {
      if (!p) return null
      const processed = { ...p }
      
      // Calcular Edad desde fecha de nacimiento
      if (p.fecha_nacimiento) {
        const birth = new Date(p.fecha_nacimiento)
        const now = new Date()
        let age = now.getFullYear() - birth.getFullYear()
        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
        processed.edad = age
      }

      // Calcular Antigüedad laboral
      if (p.fecha_ingreso_laboral) {
        const entry = new Date(p.fecha_ingreso_laboral)
        const now = new Date()
        let years = now.getFullYear() - entry.getFullYear()
        if (now.getMonth() < entry.getMonth() || (now.getMonth() === entry.getMonth() && now.getDate() < entry.getDate())) years--
        processed.antigüedad = Math.max(0, years)
      }

      // Normalización para coincidir con reglas
      if (processed.sexo === 'M') processed.sexo = 'Masculino'
      if (processed.sexo === 'F') processed.sexo = 'Femenino'
      
      if (processed.estado_civil === 'Soltero') processed.estado_civil = 'Soltero (a)'
      if (processed.estado_civil === 'Casado') processed.estado_civil = 'Casado (a)'
      if (processed.estado_civil === 'Viudo') processed.estado_civil = 'Viudo (a)'
      if (processed.estado_civil === 'Divorciado') processed.estado_civil = 'Divorciado (a)'
      
      if (processed.instruccion === 'SUPERIOR') processed.instruccion = 'Universitaria'
      if (processed.instruccion === 'SECUNDARIA COMPLETA') processed.instruccion = 'Secundaria'
      
      if (processed.clasificacion_central_riesgo === '100% Normal') processed.clasificacion_central_riesgo = 'Normal'
      else if (!processed.clasificacion_central_riesgo) processed.clasificacion_central_riesgo = p.riesgo || 'Normal'

      return processed
    }

    const getVarResult = (rule: ScoringRule, person: any) => {
      const map: Record<string, string> = { 
        v1:'edad', v2:'estado_civil', v3:'nro_dependientes', v4:'sexo', v5:'antigüedad', 
        v6:'condicion_vivienda', v7:'instruccion', v8:'profesion_oficio', v9:'departamento', 
        v10:'tipo_empresa', v11:'calificacion_interna', v12:'clasificacion_central_riesgo', v13:'actividad_economica' 
      }
      const val = person[map[rule.id] || rule.id]
      let score = 0
      
      if (rule.type === 'exact') {
        const match = rule.rules.find(r => 
          String(r.value).trim().toLowerCase() === String(val || '').trim().toLowerCase()
        )
        if (match) score = match.score
      } else {
        const num = parseFloat(val)
        if (!isNaN(num)) {
          const match = rule.rules.find(r => num >= (r.min || 0) && num <= (r.max || 9999))
          if (match) score = match.score
        }
      }
      
      let displayValue = (val === undefined || val === null || val === '') ? 'N/D' : String(val)
      if (rule.id === 'v1' && displayValue !== 'N/D') displayValue = `${displayValue} años`
      if (rule.id === 'v5' && displayValue !== 'N/D') displayValue = `${displayValue} años`
      
      return { name: rule.name, value: displayValue, score }
    }

    const runProcess = (p: any) => {
      const processed = processData(p)
      if (!processed) return { details: [], total: 0 }
      const details = rules.map(r => getVarResult(r, processed))
      return { details, total: details.reduce((s, r) => s + r.score, 0) }
    }

    return {
      titular: runProcess(tit),
      conyuge: con?.dni ? runProcess(con) : null,
      avales: (avs || []).map(a => ({ name: a.nombres_apellidos || 'Aval', ...runProcess(a) })),
      cutoffs
    }
}
