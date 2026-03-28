'use client'

import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // Map the database data back to human-readable headers
    const exportData = data.map(socio => ({
      "N° Cuenta": socio.nro_cuenta || '',
      "Nombres": socio.nombres || '',
      "Apellido Paterno": socio.apellido_paterno || '',
      "Apellido Materno": socio.apellido_materno || '',
      "Aporte": socio.aportes_totales || 0,
      "Ingresos Mensuales": socio.ingreso_bruto_mensual || 0,
      "CALIFICACIÓN INTERNA": socio.calificacion_interna || '',
      "Clasificación Central Riesgo": socio.clasificacion_central_riesgo || '',
      "DNI": socio.dni,
      "Estado Civil": socio.estado_civil || '',
      "Sexo": socio.sexo || '',
      "Dirección Domicilio": socio.direccion || '',
      "Distrito": socio.distrito || '',
      "Provincia": socio.provincia || '',
      "Departamento": socio.departamento || '',
      "Condición de Vivienda": socio.condicion_vivienda || '',
      "Grado de instrucción": socio.instruccion || '',
      "Fecha de Nac.": socio.fecha_nacimiento || '',
      "Celular": socio.telefono || '',
      "Actividad economica": socio.actividad_economica || '',
      "Profesión / Oficio": socio.profesion_oficio || '',
      "Empresa / Trabajo Dir.": socio.empresa_laboral || '',
      "Dirección del Negocio": socio.direccion_negocio || '',
      "Distrito Negocio": socio.distrito_negocio || '',
      "RUC de la empresa": socio.ruc_empresa || socio.ruc || '',
      "Estado de RUC": socio.estado_ruc || '',
      "Cargo en Empresa": socio.cargo || '',
      "Fecha de Ingreso": socio.fecha_ingreso || '',
      "N° Cuenta conyuge": socio.nro_cuenta_conyuge || '',
      "Registrado por": socio.registrado_por || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Socios")
    XLSX.writeFile(workbook, "Base_Socios_ARISK.xlsx")
  }

  return (
    <Button variant="outline" onClick={handleExport} className="border-green-200 hover:bg-green-50 text-green-700">
      <Download className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  )
}
