import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: faltan credenciales de Supabase en .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const payload = {
  id: 'scoring_rules',
  data: {
    variables: [
      {
        id: "v1", name: "Edad", type: "range", 
        rules: [{min: 18, max: 25, score: 10}, {min: 26, max: 45, score: 20}, {min: 46, max: 65, score: 30}]
      },
      {
        id: "v2", name: "Estado Civil", type: "exact", 
        rules: [{value: "Soltero (a)", score: 15}, {value: "Casado (a)", score: 25}, {value: "Conviviente", score: 20}]
      },
      {
        id: "v3", name: "Nro de dependientes", type: "range", 
        rules: [{min: 0, max: 0, score: 30}, {min: 1, max: 2, score: 20}, {min: 3, max: 10, score: 10}]
      },
      {
        id: "v4", name: "Sexo", type: "exact", 
        rules: [{value: "Femenino", score: 25}, {value: "Masculino", score: 15}]
      },
      {
        id: "v5", name: "Antigüedad Laboral (Años)", type: "range", 
        rules: [{min: 0, max: 1, score: 10}, {min: 2, max: 3, score: 20}, {min: 4, max: 50, score: 30}]
      },
      {
        id: "v6", name: "Condición vivienda", type: "exact", 
        rules: [{value: "Propia", score: 30}, {value: "Familiar", score: 20}, {value: "Alquilada", score: 10}]
      },
      {
        id: "v7", name: "Instrucción", type: "exact", 
        rules: [{value: "Secundaria", score: 10}, {value: "Técnico", score: 20}, {value: "Universitaria", score: 30}]
      },
      {
        id: "v8", name: "Profesión", type: "exact", 
        rules: [{value: "Comerciante", score: 15}, {value: "Independiente", score: 15}, {value: "Dependiente", score: 25}]
      },
      {
        id: "v9", name: "Ubicación vivienda", "type": "exact", 
        rules: [{value: "Lima", score: 20}, {value: "Provincia", score: 15}]
      },
      {
        id: "v10", name: "Tamaño empresa", type: "exact", 
        rules: [{value: "Microempresa", score: 10}, {value: "Pequeña empresa", score: 15}, {value: "Mediana empresa", score: 25}]
      },
      {
        id: "v11", name: "Clasificación interna", type: "exact", 
        rules: [{value: "Normal", score: 30}, {value: "CPP", score: 15}, {value: "Deficiente", score: 0}]
      },
      {
        id: "v12", name: "Clasificación Central de Riesgo", "type": "exact", 
        rules: [{value: "100% Normal", score: 40}, {value: "CPP", score: 10}, {value: "Deficiente", score: -50}]
      },
      {
        id: "v13", name: "Actividad Económica", type: "exact", 
        rules: [{value: "Comercio", score: 20}, {value: "Producción", score: 25}, {value: "Servicios", score: 15}]
      }
    ],
    cutoffs: [
      {action: "DENEGAR", color: "rgb(239, 68, 68)", min: 0, max: 150},
      {action: "REVISAR", color: "rgb(234, 179, 8)", min: 151, max: 180},
      {action: "APROBAR", color: "rgb(34, 197, 94)", min: 181, max: 9999}
    ]
  }
}

async function run() {
  console.log('Insertando configuración de scoring con V13...')
  const { error } = await supabase.from('sys_settings').upsert(payload, { onConflict: 'id' })
  if (error) {
    console.error('Error insertando configuración:', error.message)
    process.exit(1)
  }
  console.log('Configuración insertada exitosamente con Actividad!')
}

run()
