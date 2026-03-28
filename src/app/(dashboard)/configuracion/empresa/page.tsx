import { getSystemSetting } from '@/app/actions/settings'
import { CompanyConfigForm } from '@/components/forms/CompanyConfigForm'

export const dynamic = 'force-dynamic'

export default async function EmpresaConfiguracionPage() {
  const companyInfo = await getSystemSetting('company_info')

  const defaultData = companyInfo || {
    razon_social: '',
    ruc: '',
    representante_legal: '',
    direccion_principal: '',
    agencias: [],
    oficinas: []
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Datos de la Institución</h1>
        <p className="text-muted-foreground mt-1">
          Aquí se registra y mantiene actualizada la información matriz de la empresa para uso en contratos y reportes.
        </p>
      </div>

      <CompanyConfigForm initialData={defaultData} />
    </div>
  )
}
