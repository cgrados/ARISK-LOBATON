'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function ensureProfile(user: any, supabase: any) {
  if (!user) return
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.email || 'Admin User',
      role: 'SUPER_ADMIN'
    })
  }
}

export async function getSocios() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('role, ver_todos_socios').eq('id', user.id).single()
  
  let query = supabase.from('socios').select('*').order('created_at', { ascending: false })
  
  // Si no es Super Admin Y no tiene permiso de ver todos, filtrar por creador
  if (profile?.role !== 'SUPER_ADMIN' && !profile?.ver_todos_socios) {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching socios:', error)
    return []
  }
  return data
}

export async function createSocio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await ensureProfile(user, supabase)
  
  const nombres = formData.get('nombres') as string || ''
  const apellido_paterno = formData.get('apellido_paterno') as string || ''
  const apellido_materno = formData.get('apellido_materno') as string || ''
  const nombres_apellidos = `${nombres} ${apellido_paterno} ${apellido_materno}`.trim()

  const socio = {
    dni: formData.get('dni') as string,
    nro_cuenta: formData.get('nro_cuenta') as string,
    nombres,
    apellido_paterno,
    apellido_materno,
    nombres_apellidos,
    direccion: formData.get('direccion') as string,
    distrito: formData.get('distrito') as string,
    provincia: formData.get('provincia') as string,
    departamento: formData.get('departamento') as string,
    condicion_vivienda: formData.get('condicion_vivienda') as string,
    instruccion: formData.get('instruccion') as string,
    profesion_oficio: formData.get('profesion_oficio') as string,
    actividad_economica: formData.get('actividad_economica') as string,
    direccion_negocio: formData.get('direccion_negocio') as string,
    distrito_negocio: formData.get('distrito_negocio') as string,
    ruc: formData.get('ruc') as string,
    ruc_empresa: formData.get('ruc') as string,
    estado_ruc: formData.get('estado_ruc') as string,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string || null,
    sexo: formData.get('sexo') as string,
    estado_civil: formData.get('estado_civil') as string,
    nro_dependientes: parseInt(formData.get('nro_dependientes') as string) || 0,
    telefono: formData.get('telefono') as string,
    empresa_laboral: formData.get('empresa_laboral') as string,
    cargo: formData.get('cargo') as string,
    ingreso_bruto_mensual: parseFloat(formData.get('ingreso_bruto_mensual') as string) || 0,
    fecha_ingreso_laboral: formData.get('fecha_ingreso_laboral') as string || null,
    fecha_ingreso: formData.get('fecha_ingreso') as string || null,
    nro_cuenta_conyuge: formData.get('nro_cuenta_conyuge') as string,
    calificacion_interna: formData.get('calificacion_interna') as string,
    clasificacion_central_riesgo: formData.get('clasificacion_central_riesgo') as string,
    tipo_empresa: formData.get('tipo_empresa') as string,
    aportes_totales: parseFloat(formData.get('aportes_totales') as string) || 0,
    created_by: user?.id || null,
    registrado_por: user?.email || 'Sistema',
  }

  const { error } = await supabase.from('socios').insert(socio)

  if (error) {
    console.error('Error creating socio:', error)
    throw new Error('No se pudo crear el socio')
  }

  revalidatePath('/socios')
  return { success: true }
}

export async function deleteSocio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('socios').delete().eq('id', id)
  if (error) throw new Error('Error al eliminar socio')
  revalidatePath('/socios')
}

export async function getSocio(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('socios').select('*').eq('id', id).single()
  if (error || !data) return null
  return data
}

export async function updateSocio(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await ensureProfile(user, supabase)
  
  const nombres = formData.get('nombres') as string || ''
  const apellido_paterno = formData.get('apellido_paterno') as string || ''
  const apellido_materno = formData.get('apellido_materno') as string || ''
  const nombres_apellidos = `${nombres} ${apellido_paterno} ${apellido_materno}`.trim()

  const socio = {
    dni: formData.get('dni') as string,
    nro_cuenta: formData.get('nro_cuenta') as string,
    nombres,
    apellido_paterno,
    apellido_materno,
    nombres_apellidos,
    direccion: formData.get('direccion') as string,
    distrito: formData.get('distrito') as string,
    provincia: formData.get('provincia') as string,
    departamento: formData.get('departamento') as string,
    condicion_vivienda: formData.get('condicion_vivienda') as string,
    instruccion: formData.get('instruccion') as string,
    profesion_oficio: formData.get('profesion_oficio') as string,
    actividad_economica: formData.get('actividad_economica') as string,
    direccion_negocio: formData.get('direccion_negocio') as string,
    distrito_negocio: formData.get('distrito_negocio') as string,
    ruc: formData.get('ruc') as string,
    ruc_empresa: formData.get('ruc') as string,
    estado_ruc: formData.get('estado_ruc') as string,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string || null,
    sexo: formData.get('sexo') as string,
    estado_civil: formData.get('estado_civil') as string,
    nro_dependientes: parseInt(formData.get('nro_dependientes') as string) || 0,
    telefono: formData.get('telefono') as string,
    empresa_laboral: formData.get('empresa_laboral') as string,
    cargo: formData.get('cargo') as string,
    ingreso_bruto_mensual: parseFloat(formData.get('ingreso_bruto_mensual') as string) || 0,
    fecha_ingreso_laboral: formData.get('fecha_ingreso_laboral') as string || null,
    fecha_ingreso: formData.get('fecha_ingreso') as string || null,
    nro_cuenta_conyuge: formData.get('nro_cuenta_conyuge') as string,
    calificacion_interna: formData.get('calificacion_interna') as string,
    clasificacion_central_riesgo: formData.get('clasificacion_central_riesgo') as string,
    tipo_empresa: formData.get('tipo_empresa') as string,
    aportes_totales: parseFloat(formData.get('aportes_totales') as string) || 0,
    updated_by: user?.id || null,
    registrado_por: user?.email || 'Sistema',
  }

  const { error } = await supabase.from('socios').update(socio).eq('id', id)

  if (error) {
    console.error('Error updating socio:', error)
    throw new Error('No se pudo actualizar el socio')
  }

  revalidatePath('/socios')
  return { success: true }
}

export async function bulkUpsertSocios(sociosArray: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await ensureProfile(user, supabase)

  const mappedWithAudit = sociosArray.map(s => ({
    ...s,
    updated_by: user?.id || null,
    created_by: s.created_by || user?.id || null,
    registrado_por: s.registrado_por || user?.email || 'Sistema'
  }))

  // onConflict: 'dni' enables upsert matching by DNI, creating new ones and updating existing
  const { error } = await supabase.from('socios').upsert(mappedWithAudit, { onConflict: 'dni' })

  if (error) {
    console.error('Error in bulk upsert:', error)
    throw new Error('Error en carga masiva: ' + error.message)
  }

  revalidatePath('/socios')
  return { success: true }
}

export async function transferSocios(sourceUserId: string, targetUserId: string, targetUserEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role !== 'SUPER_ADMIN') {
    throw new Error('No autorizado para transferir carteras. Solo Super Admin.')
  }

  const { error } = await supabase.from('socios')
    .update({ 
      created_by: targetUserId, 
      registrado_por: targetUserEmail,
      updated_by: user.id
    })
    .eq('created_by', sourceUserId)

  if (error) throw new Error('Error al transferir la cartera: ' + error.message)
  
  revalidatePath('/socios')
  return { success: true }
}
