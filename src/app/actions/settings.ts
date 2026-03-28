'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSystemSetting(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sys_settings').select('data').eq('id', id).single()

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      // Row not found
      return null
    }
    console.error(`Error fetching system setting ${id}:`, error)
    return null
  }

  return data.data
}

export async function saveSystemSetting(id: string, jsonData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Ensure user profiles exist internally on update if desired, though not strictly necessary here 
  // if we just save to sys_settings. sys_settings has an updated_by FK.
  
  const payload = {
    id,
    data: jsonData,
    updated_by: user?.id || null
  }

  // Upsert the setting
  const { error } = await supabase.from('sys_settings').upsert(payload, { onConflict: 'id' })

  if (error) {
    console.error(`Error saving system setting ${id}:`, error)
    throw new Error('No se pudo guardar la configuración: ' + error.message)
  }

  revalidatePath('/configuracion')
  return { success: true }
}
