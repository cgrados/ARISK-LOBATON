'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { bulkUpsertSocios } from '@/app/actions/socios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function UploadExcelDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Utility to parse literal strings, DD/MM/YYYY, or Excel numeric dates safely to YYYY-MM-DD
      const parseDateStr = (val: any) => {
        if (!val) return null;
        if (typeof val === 'number') {
          const date = new Date(Math.round((val - 25569) * 86400 * 1000));
          if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
          return null;
        }
        const str = String(val).trim();
        let parsed = new Date(str);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        
        const parts = str.includes('/') ? str.split('/') : str.split('-');
        if (parts.length === 3) {
          parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        }
        return null;
      }

      // Normalize headers matching spreadsheet columns to DB array
      const mappedSocios = jsonData.map((row: any) => {
        const dni = String(row.DNI || row.dni || '')
        const nombres = String(row.Nombres || row.nombres || '')
        const apellidoP = String(row['Apellido Paterno'] || row.apellido_paterno || '')
        const apellidoM = String(row['Apellido Materno'] || row.apellido_materno || '')
        const nombresApellidos = `${nombres} ${apellidoP} ${apellidoM}`.trim()
        
        const importedRuc = String(row.RUC || row['RUC DE LA EMPRESA'] || row['RUC de la empresa'] || row['RUC Empresa'] || row.ruc || row.ruc_empresa || '')

        return {
          dni,
          nro_cuenta: String(row['N°Cuenta'] || row['N° Cuenta'] || row.nro_cuenta || ''),
          nombres: nombres,
          apellido_paterno: apellidoP,
          apellido_materno: apellidoM,
          nombres_apellidos: nombresApellidos || undefined,
          aportes_totales: parseFloat(row.Aporte || row.aportes_totales) || 0,
          ingreso_bruto_mensual: parseFloat(row['Ingresos Mensuales'] || row.ingreso_bruto_mensual) || 0,
          calificacion_interna: String(row['CALIFICACIÓN INTERNA'] || row.calificacion_interna || ''),
          clasificacion_central_riesgo: String(row['Clasificación Central Riesgo'] || row['Clasificacion Central Riesgos'] || row.clasificacion_central_riesgo || ''),
          estado_civil: String(row['Estado Civil'] || row.estado_civil || ''),
          sexo: String(row.Sexo || row.sexo || ''),
          direccion: String(row['Dirección Domicilio'] || row.direccion || ''),
          distrito: String(row.Distrito || row.distrito || ''),
          provincia: String(row.Provincia || row.provincia || ''),
          departamento: String(row.Departamento || row.departamento || ''),
          condicion_vivienda: String(row['Condición de Vivienda'] || row['Condicion de Vivienda'] || row.condicion_vivienda || ''),
          instruccion: String(row['Grado de instrucción'] || row['Grado de instruccion'] || row.instruccion || ''),
          fecha_nacimiento: parseDateStr(row['Fecha de Nac.'] || row.fecha_nacimiento),
          telefono: String(row.Celular || row.telefono || ''),
          actividad_economica: String(row['Actividad economica'] || row.actividad_economica || ''),
          profesion_oficio: String(row['Profesión / Oficio'] || row['Profesion / Oficio'] || row.profesion_oficio || ''),
          empresa_laboral: String(row['Empresa / Trabajo Dir.'] || row['Empresa'] || row.empresa_laboral || ''),
          direccion_negocio: String(row['Dirección del Negocio'] || row.direccion_negocio || ''),
          distrito_negocio: String(row['Distrito Negocio'] || row.distrito_negocio || ''),
          ruc: importedRuc,
          ruc_empresa: importedRuc,
          estado_ruc: String(row['Estado de RUC'] || row.estado_ruc || ''),
          cargo: String(row['Cargo en Empresa'] || row.cargo || ''),
          fecha_ingreso: parseDateStr(row['Fecha de Ingreso'] || row.fecha_ingreso),
          nro_cuenta_conyuge: String(row['N°Cuenta conyuge'] || row['N° Cuenta conyuge'] || row.nro_cuenta_conyuge || '')
        }
      }).filter(s => s.dni) // Asegurarse de que tienen DNI, ya que es la llave única!

      if (mappedSocios.length === 0) {
        alert('No se encontraron registros válidos o falta la columna DNI en el Excel.')
        setIsLoading(false)
        return
      }

      const response = await bulkUpsertSocios(mappedSocios)
      if (response.success) {
        alert(`¡Carga completada! Se procesaron ${mappedSocios.length} socios exitosamente.`)
        setIsOpen(false)
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Hubo un error al procesar el archivo Excel.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="text-blue-700 bg-white border-blue-200 hover:bg-blue-50" />}>
        <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
        Carga Masiva Excel
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Socios desde Excel</DialogTitle>
          <DialogDescription>
            Sube un archivo .xlsx con los datos de los socios. Si el DNI ya existe, sus datos se actualizarán. Si es nuevo, se creará.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md bg-slate-50">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="excel">Archivo Excel (.xlsx)</Label>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-blue-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Procesando archivo...</span>
              </div>
            ) : (
              <Input id="excel" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
