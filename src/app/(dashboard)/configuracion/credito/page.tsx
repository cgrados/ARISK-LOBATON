import { getSystemSetting } from '@/app/actions/settings'
import { CreditConfigForm } from '@/components/forms/CreditConfigForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionCreditoPage() {
  const creditConditions = await getSystemSetting('credit_conditions')

  // The database seed guarantees data, but we provide a structural fallback just in case
  const defaultData = creditConditions || {
    categories: [],
    products: [],
    special: [{ name: '', tea: 0, tem: 0 }, { name: '', description: '' }],
    moratoria: { tea: 0, tem: 0 }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xs md:max-w-7xl mx-auto w-full pb-10 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Condiciones de Crédito</h1>
        <p className="text-muted-foreground mt-1">
          Ajuste las Tasas Efectivas (TEA y TEM) para cada producto de crédito según el perfil o clasificación interna del socio.
        </p>
      </div>

      <CreditConfigForm initialData={defaultData} />
    </div>
  )
}
