import { getSystemSetting } from '@/app/actions/settings'
import { ScoringConfigForm } from '@/components/forms/ScoringConfigForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const scoringRules = await getSystemSetting('scoring_rules')

  // Fallback defaults if the DB is completely empty (though the seed handles this)
  const defaultData = scoringRules || {
    variables: [],
    cutoffs: [
      { action: 'DENEGAR', color: 'rgb(239, 68, 68)', min: 0, max: 150 },
      { action: 'REVISAR', color: 'rgb(234, 179, 8)', min: 151, max: 180 },
      { action: 'APROBAR', color: 'rgb(34, 197, 94)', min: 181, max: 9999 }
    ],
    thresholds: {
      edeMaxModerado: 30,
      edeMaxCritico: 40,
      gastoMaxModerado: 70,
      gastoMaxCritico: 90
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración del Motor de Evaluación</h1>
        <p className="text-muted-foreground mt-1">
          Ajuste los indicadores demográficos, crediticios y los puntos de corte del semáforo para las solicitudes.
        </p>
      </div>

      <ScoringConfigForm initialData={defaultData} />
    </div>
  )
}
