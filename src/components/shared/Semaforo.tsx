import { cn } from "@/lib/utils"

interface SemaforoProps {
  tipo: 'ahorro' | 'endeudamiento'
  valor: number // Porcentaje (ej. 0.40 para 40%)
}

export function Semaforo({ tipo, valor }: SemaforoProps) {
  let colorClass = "bg-gray-300"
  let label = "Neutro"

  if (tipo === 'endeudamiento') {
    if (valor <= 0.3) {
      colorClass = "bg-green-500"
      label = "Saludable"
    } else if (valor <= 0.4) {
      colorClass = "bg-yellow-500"
      label = "Precaución"
    } else {
      colorClass = "bg-red-500"
      label = "Riesgo Alto"
    }
  } else if (tipo === 'ahorro') {
    if (valor >= 0.2) {
      colorClass = "bg-green-500"
      label = "Óptimo"
    } else if (valor >= 0.1) {
      colorClass = "bg-yellow-500"
      label = "Regular"
    } else {
      colorClass = "bg-red-500"
      label = "Deficiente"
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-slate-50">
      <h4 className="text-sm font-semibold text-slate-600 capitalize">
        Semáforo de {tipo}
      </h4>
      <div className={cn("h-16 w-16 rounded-full shadow-inner border-4 border-white", colorClass)} />
      <span className="text-sm font-medium">{label} ({(valor * 100).toFixed(0)}%)</span>
    </div>
  )
}
