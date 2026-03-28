'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Helper for admin bypassing RLS
function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getAllUsers() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'SUPER_ADMIN') return []

  const { data, error } = await supabase.from('profiles').select('*').order('full_name')
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function createSystemUser(data: { 
  email: string, 
  full_name: string, 
  role: string, 
  password: string, 
  modules: string[], 
  dni?: string, 
  direccion?: string, 
  telefono?: string, 
  agencia?: string,
  ver_todos_socios?: boolean
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'SUPER_ADMIN') throw new Error('Acceso denegado: Solo administradores pueden crear usuarios.')

  const adminAuth = getAdminSupabase()

  // Create Auth User
  const { data: newUser, error: authError } = await adminAuth.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) throw new Error('Error al crear credenciales de usuario: ' + authError.message)

  // Upsert profile
  const { error: profileError } = await adminAuth.from('profiles').upsert({
    id: newUser.user.id,
    full_name: data.full_name,
    role: data.role,
    modules_access: data.modules,
    dni: data.dni,
    direccion: data.direccion,
    telefono: data.telefono,
    agencia: data.agencia,
    ver_todos_socios: data.ver_todos_socios || false
  })

  if (profileError) throw new Error('Error al asignar perfil: ' + profileError.message)

  revalidatePath('/usuarios')
  return { success: true }
}

export async function updateUserAccess(userId: string, data: { 
  full_name: string, 
  role: string, 
  modules: string[], 
  dni?: string, 
  direccion?: string, 
  telefono?: string, 
  agencia?: string,
  ver_todos_socios?: boolean
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'SUPER_ADMIN') throw new Error('Acceso denegado')

  const adminAuth = getAdminSupabase()
  const { error } = await adminAuth.from('profiles').update({
    full_name: data.full_name,
    role: data.role,
    modules_access: data.modules,
    dni: data.dni,
    direccion: data.direccion,
    telefono: data.telefono,
    agencia: data.agencia,
    ver_todos_socios: data.ver_todos_socios
  }).eq('id', userId)

  if (error) throw new Error('Error al actualizar acceso: ' + error.message)

  revalidatePath('/usuarios')
  return { success: true }
}
