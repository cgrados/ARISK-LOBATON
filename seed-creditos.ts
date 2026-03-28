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
  id: 'credit_conditions',
  data: {
    categories: ["Premium A-1", "Premium A-2", "SOCIO A", "SOCIO B", "SOCIO C", "SOCIO D"],
    products: [
      {
        name: "CRÉDITO ORDINARIO",
        rates: {
          "Premium A-1": { tea: 27.57, tem: 2.05 }, "Premium A-2": { tea: 34.49, tem: 2.50 },
          "SOCIO A": { tea: 40.10, tem: 2.85 }, "SOCIO B": { tea: 42.58, tem: 3.00 },
          "SOCIO C": { tea: 45.93, tem: 3.20 }, "SOCIO D": { tea: 51.11, tem: 3.50 }
        }
      },
      {
        name: "CRÉDITO LINEA DE CRÉDITO",
        rates: {
          "Premium A-1": { tea: 27.57, tem: 2.05 }, "Premium A-2": { tea: 34.49, tem: 2.50 },
          "SOCIO A": { tea: 40.10, tem: 2.85 }, "SOCIO B": { tea: 42.58, tem: 3.00 },
          "SOCIO C": { tea: 45.93, tem: 3.20 }, "SOCIO D": { tea: 51.11, tem: 3.50 }
        }
      },
      {
        name: "CRÉDITO PROMOCIONAL",
        rates: {
          "Premium A-1": { tea: 27.57, tem: 2.05 }, "Premium A-2": { tea: 34.49, tem: 2.50 },
          "SOCIO A": { tea: 40.10, tem: 2.85 }, "SOCIO B": { tea: 42.58, tem: 3.00 },
          "SOCIO C": { tea: 45.93, tem: 3.20 }, "SOCIO D": { tea: 51.11, tem: 3.50 }
        }
      },
      {
        name: "CRÉDITO A SOLA FIRMA",
        rates: {
          "Premium A-1": { tea: 19.56, tem: 1.50 }, "Premium A-2": { tea: 23.14, tem: 1.75 },
          "SOCIO A": { tea: 23.14, tem: 1.75 }, "SOCIO B": { tea: 23.14, tem: 1.75 },
          "SOCIO C": { tea: 23.14, tem: 1.75 }, "SOCIO D": { tea: 23.14, tem: 1.75 }
        }
      },
      {
        name: "CRÉDITO MICROCASH",
        rates: {
          "Premium A-1": { tea: 40.10, tem: 2.85 }, "Premium A-2": { tea: 42.58, tem: 3.00 },
          "SOCIO A": { tea: 47.64, tem: 3.30 }, "SOCIO B": { tea: 51.11, tem: 3.50 },
          "SOCIO C": { tea: 56.45, tem: 3.80 }, "SOCIO D": { tea: 60.10, tem: 4.00 }
        }
      },
      {
        name: "CRÉDITO DE EMERGENCIA",
        rates: {
          "Premium A-1": { tea: 15.02, tem: 1.17 }, "Premium A-2": { tea: 15.02, tem: 1.17 },
          "SOCIO A": { tea: 15.02, tem: 1.17 }, "SOCIO B": { tea: 15.02, tem: 1.17 },
          "SOCIO C": { tea: 15.02, tem: 1.17 }, "SOCIO D": { tea: 15.02, tem: 1.17 }
        }
      }
    ],
    special: [
      { name: "Con Garantía Hipotecaria", tea: 21.70, tem: 1.65 },
      { name: "Con Garantía DPF", description: "Se establece 4.0% adicional a la tasa de interes pasiva del DPF." }
    ],
    moratoria: { tea: 79.59, tem: 5.00 }
  }
}

async function run() {
  console.log('Insertando configuración de crédito matrix...')
  const { error } = await supabase.from('sys_settings').upsert(payload, { onConflict: 'id' })
  if (error) {
    console.error('Error insertando condiciones crédito:', error.message)
    process.exit(1)
  }
  console.log('Condiciones insertadas exitosamente!')
}

run()
