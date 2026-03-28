# ARCHITECTURE & DEVELOPMENT PLAN: CREDIT RISK EVALUATION SYSTEM (ARISK)

## 1. PROJECT OVERVIEW
Sistema integral de gestión de créditos para Cooperativas, permitiendo el registro de socios, evaluación de riesgo mediante scoring, análisis de capacidad de pago y un flujo de aprobación jerárquico (RBAC).

## 2. TECH STACK
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS.
- **Backend/BaaS:** Supabase (Postgres, Auth, Storage).
- **Authentication:** Supabase Auth con Role-Based Access Control (RBAC).
- **Hosting:** VPS con Dokploy (Dockerized).
- **PDF Generation:** @react-pdf/renderer o puppeteer para réplica exacta de formularios.

## 3. DATABASE SCHEMA (SQL - Supabase)

```sql
-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLES FOR AUTH & ROLES
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ANALISTA', 'SUPERVISOR', 'APROBADOR');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'ANALISTA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE: SOCIOS (Master CRUD)
CREATE TABLE socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni TEXT UNIQUE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: SOLICITUDES DE CRÉDITO
CREATE TYPE solicitud_estado AS EN_UM ('BORRADOR', 'EN_REVISION', 'OBSERVADO', 'APROBADO', 'DENEGADO');

CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correlativo SERIAL,
  socio_id UUID REFERENCES socios(id),
  monto_solicitado DECIMAL(12,2) NOT NULL,
  plazo_meses INTEGER NOT NULL,
  tea DECIMAL(5,2),
  tem DECIMAL(5,2),
  cuota_mensual DECIMAL(12,2),
  destino_credito TEXT,
  estado solicitud_estado DEFAULT 'BORRADOR',
  analista_id UUID REFERENCES profiles(id),
  supervisor_id UUID REFERENCES profiles(id),
  observaciones_analista TEXT,
  observaciones_supervisor TEXT,
  observaciones_comite TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: EVALUACION SCORING & GARANTES
CREATE TABLE evaluaciones_riesgo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id),
  score_total INTEGER,
  clasificacion_interna TEXT, -- AA, A, B, C, D
  infocorp_status TEXT,
  sunat_status TEXT,
  -- Datos de Avales (JSONB para flexibilidad de múltiples avales como en Imagen 2)
  avales JSONB, 
  indicadores_socio_demo JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: PRESUPUESTO FAMILIAR (INGRESOS VS EGRESOS)
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id),
  ingresos_detalle JSONB, -- {ingreso_1: 5000, ingreso_2: 0...}
  gastos_detalle JSONB,   -- {alquiler: 0, transporte: 300, ropa: 500...}
  deudas_financieras JSONB,
  porcentaje_endeudamiento DECIMAL(5,2),
  semaforo_ahorro TEXT,
  semaforo_endeudamiento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analistas ven sus propias solicitudes" 
ON solicitudes FOR SELECT 
USING (auth.uid() = analista_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'APROBADOR', 'SUPER_ADMIN')));

4. PROJECT STRUCTURE (Next.js App Router)
/
├── app/
│   ├── (auth)/             # Login y Registro
│   ├── (dashboard)/        # Layout principal con Sidebar
│   │   ├── socios/         # CRUD Socios
│   │   ├── solicitudes/    # Listado y Nueva Solicitud (DNI search)
│   │   │   ├── [id]/       # Wizard de Evaluación (Forms 1, 2, 3, 4)
│   │   ├── aprobaciones/   # Bandeja exclusiva para Aprobadores
│   │   └── configuracion/  # Parámetros (TEA, Scoring) - Solo Admin
│   ├── api/                # Endpoints para PDF y cálculos pesados
├── components/
│   ├── ui/                 # Componentes Shadcn (Tablas, inputs)
│   ├── forms/              # Formularios replicando imágenes
│   │   ├── FormSolicitud.tsx
│   │   ├── FormScoring.tsx
│   │   ├── FormPresupuesto.tsx
│   │   └── FormCapacidadPago.tsx
│   ├── shared/             # Semáforos y gráficas
├── lib/
│   ├── utils/              # Lógica de cálculo de cuotas y scoring
│   ├── supabase/           # Cliente de base de datos
├── hooks/                  # UseSocioData, UseCreditCalculator
└── public/                 # Assets (Logo Cooperativa)

5. FUNCTIONAL FLOWS (Business Logic)
A. Registro y Validación de SocioEl sistema inicia pidiendo DNI.Si existe en socios, hereda: ingresos, aportes, clasificación.Si no existe, obliga al registro en el Módulo CRUD antes de proceder.B. Motor de Evaluación (Backend/Lib)Scoring Engine: Función que recibe edad, instruccion, vivienda y devuelve Score (0-215) y Resultado (Aprobar/Denegar).Financial Engine: Calcula el Semáforo de Endeudamiento:Si (Total_Deudas + Nueva_Cuota) / Ingresos_Netos > 0.40 $\rightarrow$ ROJO.C. Módulo de Aprobaciones (Workflow)Una solicitud en estado EN_REVISION aparece en la bandeja del Aprobador.El Aprobador visualiza un Dashboard de Resumen con la "Hoja de Resolución" (Imagen 4).Al hacer clic en Aprobar, se genera un correlativo_aprobacion y se estampa el nombre del Gerente en el campo de firma.6. DEPLOYMENT (Dokploy/VPS)Se incluye Dockerfile para Next.js.Configuración de variables de entorno (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE).Configuración de volúmenes para almacenamiento de documentos PDF generados.7. NEXT STEPS FOR IDEGenerar componentes de UI basados en Tailwind que imiten el estilo "tabular" de los formularios físicos (bordes azules delgados, fondos amarillos en inputs).Implementar la función de búsqueda por DNI con SWR o React Query para autocompletar formularios.Crear el componente Semaforo que cambie dinámicamente según los inputs del presupuesto.