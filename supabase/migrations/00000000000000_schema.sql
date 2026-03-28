-- ATENCIÓN: ESTO BORRARÁ LAS TABLAS ACTUALES Y LAS VOLVERÁ A CREAR LIMPIAS CON LA ESTRUCTURA FINAL
DROP TABLE IF EXISTS sys_settings CASCADE;
DROP TABLE IF EXISTS presupuestos CASCADE;
DROP TABLE IF EXISTS evaluaciones_riesgo CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS socios CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS solicitud_estado CASCADE;

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES FOR AUTH & ROLES
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ANALISTA', 'SUPERVISOR', 'APROBADOR');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'ANALISTA',
  modules_access JSONB DEFAULT '["dashboard"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE: SOCIOS (Master CRUD)
CREATE TABLE socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni TEXT UNIQUE NOT NULL,
  
  -- NUEVOS CAMPOS AÑADIDOS
  nro_cuenta TEXT,
  nombres TEXT,
  apellido_paterno TEXT,
  apellido_materno TEXT,
  calificacion_interna TEXT,
  clasificacion_central_riesgo TEXT,
  direccion_negocio TEXT,
  distrito_negocio TEXT,
  actividad_economica TEXT,
  ruc TEXT,
  estado_ruc TEXT,
  fecha_ingreso DATE,
  nro_cuenta_conyuge TEXT,
  
  nombres_apellidos TEXT NOT NULL,
  direccion TEXT,
  distrito TEXT,
  provincia TEXT,
  departamento TEXT,
  condicion_vivienda TEXT, -- Propia, Alquilada, Familiar
  instruccion TEXT,
  profesion_oficio TEXT,
  fecha_nacimiento DATE,
  sexo TEXT,
  estado_civil TEXT,
  nro_dependientes INTEGER,
  telefono TEXT,
  empresa_laboral TEXT,
  ruc_empresa TEXT,
  cargo TEXT,
  ingreso_bruto_mensual DECIMAL(12,2),
  fecha_ingreso_laboral DATE,
  aportes_totales DECIMAL(12,2) DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  registrado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: SOLICITUDES DE CRÉDITO
CREATE TYPE solicitud_estado AS ENUM ('BORRADOR', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'DENEGADO');

CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correlativo SERIAL,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  monto_solicitado DECIMAL(12,2) NOT NULL,
  plazo_meses INTEGER NOT NULL,
  producto TEXT,
  tea DECIMAL(5,2),
  tem DECIMAL(5,2),
  cuota_mensual DECIMAL(12,2),
  destino_credito TEXT,
  datos_patrimoniales JSONB DEFAULT '[]'::jsonb,
  datos_socio_snapshot JSONB DEFAULT '{}'::jsonb,
  datos_avales JSONB DEFAULT '[]'::jsonb,
  estado solicitud_estado DEFAULT 'BORRADOR',
  analista_id UUID REFERENCES profiles(id),
  supervisor_id UUID REFERENCES profiles(id),
  observaciones_analista TEXT,
  observaciones_supervisor TEXT,
  observaciones_comite TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: EVALUACION SCORING & GARANTES
CREATE TABLE evaluaciones_riesgo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  score_total INTEGER,
  clasificacion_interna TEXT, -- AA, A, B, C, D
  infocorp_status TEXT,
  sunat_status TEXT,
  -- Datos de Avales (JSONB para flexibilidad)
  avales JSONB, 
  indicadores_socio_demo JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: PRESUPUESTO FAMILIAR (INGRESOS VS EGRESOS)
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  ingresos_detalle JSONB, -- {ingreso_1: 5000, ingreso_2: 0...}
  gastos_detalle JSONB,   -- {alquiler: 0, transporte: 300, ropa: 500...}
  deudas_financieras JSONB,
  porcentaje_endeudamiento DECIMAL(5,2),
  semaforo_ahorro TEXT,
  semaforo_endeudamiento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: SYSTEM SETTINGS (Dynamic Configuration)
CREATE TABLE sys_settings (
  id VARCHAR PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- INITIAL SEED FOR SCORING RULES
INSERT INTO sys_settings (id, data) VALUES (
  'scoring_rules', 
  '{
    "variables": [
      {
        "id": "v1", "name": "Edad", "type": "range", 
        "rules": [{"min": 18, "max": 25, "score": 10}, {"min": 26, "max": 45, "score": 20}, {"min": 46, "max": 65, "score": 30}]
      },
      {
        "id": "v2", "name": "Estado Civil", "type": "exact", 
        "rules": [{"value": "Soltero (a)", "score": 15}, {"value": "Casado (a)", "score": 25}, {"value": "Conviviente", "score": 20}]
      },
      {
        "id": "v3", "name": "Nro de dependientes", "type": "range", 
        "rules": [{"min": 0, "max": 0, "score": 30}, {"min": 1, "max": 2, "score": 20}, {"min": 3, "max": 10, "score": 10}]
      },
      {
        "id": "v4", "name": "Sexo", "type": "exact", 
        "rules": [{"value": "Femenino", "score": 25}, {"value": "Masculino", "score": 15}]
      },
      {
        "id": "v5", "name": "Antigüedad Laboral (Años)", "type": "range", 
        "rules": [{"min": 0, "max": 1, "score": 10}, {"min": 2, "max": 3, "score": 20}, {"min": 4, "max": 50, "score": 30}]
      },
      {
        "id": "v6", "name": "Condición vivienda", "type": "exact", 
        "rules": [{"value": "Propia", "score": 30}, {"value": "Familiar", "score": 20}, {"value": "Alquilada", "score": 10}]
      },
      {
        "id": "v7", "name": "Instrucción", "type": "exact", 
        "rules": [{"value": "Secundaria", "score": 10}, {"value": "Técnico", "score": 20}, {"value": "Universitaria", "score": 30}]
      },
      {
        "id": "v8", "name": "Profesión", "type": "exact", 
        "rules": [{"value": "Comerciante", "score": 15}, {"value": "Independiente", "score": 15}, {"value": "Dependiente", "score": 25}]
      },
      {
        "id": "v9", "name": "Ubicación vivienda", "type": "exact", 
        "rules": [{"value": "Lima", "score": 20}, {"value": "Provincia", "score": 15}]
      },
      {
        "id": "v10", "name": "Tamaño empresa", "type": "exact", 
        "rules": [{"value": "Microempresa", "score": 10}, {"value": "Pequeña empresa", "score": 15}, {"value": "Mediana empresa", "score": 25}]
      },
      {
        "id": "v11", "name": "Clasificación interna", "type": "exact", 
        "rules": [{"value": "Normal", "score": 30}, {"value": "CPP", "score": 15}, {"value": "Deficiente", "score": 0}]
      },
      {
        "id": "v12", "name": "Clasificación Central de Riesgo", "type": "exact", 
        "rules": [{"value": "100% Normal", "score": 40}, {"value": "CPP", "score": 10}, {"value": "Deficiente", "score": -50}]
      },
      {
        "id": "v13", "name": "Actividad Económica", "type": "exact", 
        "rules": [{"value": "Comercio", "score": 20}, {"value": "Producción", "score": 25}, {"value": "Servicios", "score": 15}]
      }
    ],
    "cutoffs": [
      {"action": "DENEGAR", "color": "rgb(239, 68, 68)", "min": 0, "max": 150},
      {"action": "REVISAR", "color": "rgb(234, 179, 8)", "min": 151, "max": 180},
      {"action": "APROBAR", "color": "rgb(34, 197, 94)", "min": 181, "max": 9999}
    ]
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- SETTING UP TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER set_timestamp_socios
BEFORE UPDATE ON socios
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_solicitudes
BEFORE UPDATE ON solicitudes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_evaluaciones_riesgo
BEFORE UPDATE ON evaluaciones_riesgo
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_presupuestos
BEFORE UPDATE ON presupuestos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_sys_settings
BEFORE UPDATE ON sys_settings
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- RLS POLICIES (Row Level Security)
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analistas pueden seleccionar solicitudes" 
ON solicitudes FOR SELECT 
USING (auth.uid() = analista_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')));

CREATE POLICY "Analistas pueden insertar solicitudes" 
ON solicitudes FOR INSERT 
WITH CHECK (auth.uid() = analista_id);

CREATE POLICY "Analistas pueden actualizar solicitudes" 
ON solicitudes FOR UPDATE
USING (auth.uid() = analista_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')));

