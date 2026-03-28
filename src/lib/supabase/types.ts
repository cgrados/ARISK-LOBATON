export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'SUPER_ADMIN' | 'ANALISTA' | 'SUPERVISOR' | 'APROBADOR'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'SUPER_ADMIN' | 'ANALISTA' | 'SUPERVISOR' | 'APROBADOR'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'SUPER_ADMIN' | 'ANALISTA' | 'SUPERVISOR' | 'APROBADOR'
          created_at?: string
        }
      }
      socios: {
        Row: {
          id: string
          dni: string
          nro_cuenta: string | null
          nombres_apellidos: string
          nombres: string | null
          apellido_paterno: string | null
          apellido_materno: string | null
          direccion: string | null
          distrito: string | null
          provincia: string | null
          departamento: string | null
          condicion_vivienda: string | null
          instruccion: string | null
          profesion_oficio: string | null
          fecha_nacimiento: string | null
          sexo: string | null
          estado_civil: string | null
          nro_dependientes: number | null
          telefono: string | null
          empresa_laboral: string | null
          ruc_empresa: string | null
          cargo: string | null
          ingreso_bruto_mensual: number | null
          fecha_ingreso_laboral: string | null
          actividad_economica: string | null
          direccion_negocio: string | null
          distrito_negocio: string | null
          ruc: string | null
          estado_ruc: string | null
          fecha_ingreso: string | null
          nro_cuenta_conyuge: string | null
          calificacion_interna: string | null
          clasificacion_central_riesgo: string | null
          aportes_totales: number
          created_by: string | null
          updated_by: string | null
          registrado_por: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dni: string
          nro_cuenta?: string | null
          nombres_apellidos: string
          nombres?: string | null
          apellido_paterno?: string | null
          apellido_materno?: string | null
          direccion?: string | null
          distrito?: string | null
          provincia?: string | null
          departamento?: string | null
          condicion_vivienda?: string | null
          instruccion?: string | null
          profesion_oficio?: string | null
          fecha_nacimiento?: string | null
          sexo?: string | null
          estado_civil?: string | null
          nro_dependientes?: number | null
          telefono?: string | null
          empresa_laboral?: string | null
          ruc_empresa?: string | null
          cargo?: string | null
          ingreso_bruto_mensual?: number | null
          fecha_ingreso_laboral?: string | null
          actividad_economica?: string | null
          direccion_negocio?: string | null
          distrito_negocio?: string | null
          ruc?: string | null
          estado_ruc?: string | null
          fecha_ingreso?: string | null
          nro_cuenta_conyuge?: string | null
          calificacion_interna?: string | null
          clasificacion_central_riesgo?: string | null
          aportes_totales?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dni?: string
          nro_cuenta?: string | null
          nombres_apellidos?: string
          nombres?: string | null
          apellido_paterno?: string | null
          apellido_materno?: string | null
          direccion?: string | null
          distrito?: string | null
          provincia?: string | null
          departamento?: string | null
          condicion_vivienda?: string | null
          instruccion?: string | null
          profesion_oficio?: string | null
          fecha_nacimiento?: string | null
          sexo?: string | null
          estado_civil?: string | null
          nro_dependientes?: number | null
          telefono?: string | null
          empresa_laboral?: string | null
          ruc_empresa?: string | null
          cargo?: string | null
          ingreso_bruto_mensual?: number | null
          fecha_ingreso_laboral?: string | null
          actividad_economica?: string | null
          direccion_negocio?: string | null
          distrito_negocio?: string | null
          ruc?: string | null
          estado_ruc?: string | null
          fecha_ingreso?: string | null
          nro_cuenta_conyuge?: string | null
          calificacion_interna?: string | null
          clasificacion_central_riesgo?: string | null
          aportes_totales?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      solicitudes: {
        Row: {
          id: string
          correlativo: number
          socio_id: string | null
          monto_solicitado: number
          plazo_meses: number
          tea: number | null
          tem: number | null
          cuota_mensual: number | null
          destino_credito: string | null
          estado: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO' | 'DENEGADO'
          analista_id: string | null
          supervisor_id: string | null
          observaciones_analista: string | null
          observaciones_supervisor: string | null
          observaciones_comite: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          correlativo?: number
          socio_id?: string | null
          monto_solicitado: number
          plazo_meses: number
          tea?: number | null
          tem?: number | null
          cuota_mensual?: number | null
          destino_credito?: string | null
          estado?: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO' | 'DENEGADO'
          analista_id?: string | null
          supervisor_id?: string | null
          observaciones_analista?: string | null
          observaciones_supervisor?: string | null
          observaciones_comite?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          correlativo?: number
          socio_id?: string | null
          monto_solicitado?: number
          plazo_meses?: number
          tea?: number | null
          tem?: number | null
          cuota_mensual?: number | null
          destino_credito?: string | null
          estado?: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO' | 'DENEGADO'
          analista_id?: string | null
          supervisor_id?: string | null
          observaciones_analista?: string | null
          observaciones_supervisor?: string | null
          observaciones_comite?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evaluaciones_riesgo: {
        Row: {
          id: string
          solicitud_id: string | null
          score_total: number | null
          clasificacion_interna: string | null
          infocorp_status: string | null
          sunat_status: string | null
          avales: Json | null
          indicadores_socio_demo: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solicitud_id?: string | null
          score_total?: number | null
          clasificacion_interna?: string | null
          infocorp_status?: string | null
          sunat_status?: string | null
          avales?: Json | null
          indicadores_socio_demo?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solicitud_id?: string | null
          score_total?: number | null
          clasificacion_interna?: string | null
          infocorp_status?: string | null
          sunat_status?: string | null
          avales?: Json | null
          indicadores_socio_demo?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      presupuestos: {
        Row: {
          id: string
          solicitud_id: string | null
          ingresos_detalle: Json | null
          gastos_detalle: Json | null
          deudas_financieras: Json | null
          porcentaje_endeudamiento: number | null
          semaforo_ahorro: string | null
          semaforo_endeudamiento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          solicitud_id?: string | null
          ingresos_detalle?: Json | null
          gastos_detalle?: Json | null
          deudas_financieras?: Json | null
          porcentaje_endeudamiento?: number | null
          semaforo_ahorro?: string | null
          semaforo_endeudamiento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          solicitud_id?: string | null
          ingresos_detalle?: Json | null
          gastos_detalle?: Json | null
          deudas_financieras?: Json | null
          porcentaje_endeudamiento?: number | null
          semaforo_ahorro?: string | null
          semaforo_endeudamiento?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sys_settings: {
        Row: {
          id: string
          data: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id: string
          data?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          data?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ANALISTA' | 'SUPERVISOR' | 'APROBADOR'
      solicitud_estado: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO' | 'DENEGADO'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
