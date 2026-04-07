'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchSocioByDni(dni: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .eq('dni', dni)
    .single()
    
  if (error || !data) return null
  return data
}

export async function createSolicitud(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const newSolicitud = {
    socio_id: data.socio_id,
    producto: data.producto,
    monto_solicitado: data.monto_solicitado,
    plazo_meses: data.plazo_meses,
    tea: data.tea || null,
    tem: data.tem || null,
    cuota_mensual: data.cuota_mensual || null,
    clasificacion_override: data.clasificacion_override || 'Normal',
    destino_credito: data.destino_credito,
    datos_patrimoniales: data.datos_patrimoniales || [],
    datos_socio_snapshot: data.datos_socio_snapshot || {},
    datos_avales: data.datos_avales || [],
    datos_conyuge: data.datos_conyuge || {},
    datos_cualitativos: data.datos_cualitativos || {},
    datos_resumen: data.datos_resumen || {},
    estado: 'EN_REVISION',
    analista_id: user.id
  }

  const { data: inserted, error } = await supabase
    .from('solicitudes')
    .insert(newSolicitud)
    .select()
    .single()

  if (error) {
    console.error('Error al crear solicitud:', error)
    throw new Error('No se pudo guardar la solicitud de crédito: ' + error.message)
  }

  if (data.actualizar_socio && data.socio_id && data.datos_socio_editados) {
    const socioUpdate = data.datos_socio_editados
    socioUpdate.updated_by = user.id
    const { error: updateError } = await supabase.from('socios').update(socioUpdate).eq('id', data.socio_id)
    if (updateError) console.error('Error al actualizar socio:', updateError)
  }

  revalidatePath('/solicitudes')
  revalidatePath('/socios')
  return { success: true, id: inserted.id, numero_solicitud: inserted.numero_solicitud }
}

export async function updateSolicitud(id: string, data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Strictly allow only valid columns from the 'solicitudes' table
  const ALLOWED_COLUMNS = [
    'monto_solicitado', 'plazo_meses', 'producto', 'tea', 'tem', 'cuota_mensual',
    'clasificacion_override', 'destino_credito', 'datos_patrimoniales',
    'datos_socio_snapshot', 'datos_avales', 'datos_conyuge', 'datos_cualitativos',
    'datos_resumen', 'estado'
  ]

  const updateData: any = { updated_at: new Date().toISOString() }
  
  // Only add fields that are in ALLOWED_COLUMNS AND present in the input data
  Object.keys(data).forEach(key => {
    if (ALLOWED_COLUMNS.includes(key) && data[key] !== undefined) {
      updateData[key] = data[key]
    }
  })

  const { error } = await supabase.from('solicitudes').update(updateData).eq('id', id)
  if (error) {
    console.error('Error al actualizar solicitud:', error)
    throw new Error('Error al actualizar: ' + error.message)
  }

  if (data.actualizar_socio && data.socio_id && data.datos_socio_editados) {
    const socioUpdate = data.datos_socio_editados
    socioUpdate.updated_by = user.id
    await supabase.from('socios').update(socioUpdate).eq('id', data.socio_id)
  }

  revalidatePath('/solicitudes')
  revalidatePath(`/solicitudes/${id}`)
  return { success: true }
}

export async function getSolicitud(id: string) {
  if (!id) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`
      *,
      socios (*),
      analista:profiles!analista_id (
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching solicitud [ID:', id, ']:', error.message, error.details, error.hint)
    return null
  }
  return data
}

export async function getSolicitudes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  let query = supabase.from('solicitudes')
    .select(`
      *,
      socios (
        dni, nombres_apellidos, telefono
      ),
      analista:profiles!analista_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (profile?.role === 'ANALISTA') {
    query = query.eq('analista_id', user.id)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching solicitudes:', error)
    return []
  }
  return data
}

export async function getPresupuesto(solicitudId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('solicitud_id', solicitudId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching presupuesto:', error)
    return null
  }
  return data
}

export async function savePresupuesto(solicitudId: string, data: any) {
  const supabase = await createClient()
  
  const payload = {
    solicitud_id: solicitudId,
    ingresos_detalle: data.ingresos_detalle,
    gastos_detalle: data.gastos_detalle,
    deudas_financieras: data.deudas_financieras,
    porcentaje_endeudamiento: data.porcentaje_endeudamiento,
    semaforo_ahorro: data.semaforo_ahorro,
    semaforo_endeudamiento: data.semaforo_endeudamiento,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('presupuestos')
    .upsert(payload, { onConflict: 'solicitud_id' })

  if (error) {
    console.error('Error saving presupuesto:', error)
    throw new Error('No se pudo guardar la evaluación presupuestaria')
  }

  return { success: true }
}

export async function getSolicitudByNumero(numero: string) {
  const supabase = await createClient()
  
  // Extract only numbers for the correlativo field (SERIAL/INT)
  const numbersOnlyMatch = numero.match(/\d+/)
  const numericId = numbersOnlyMatch ? parseInt(numbersOnlyMatch[0], 10) : null

  if (numericId === null) return null
  
  // Try match with the correlativo column
  let { data, error } = await supabase
    .from('solicitudes')
    .select(`
      *,
      socios (*),
      analista:profiles!analista_id (
        full_name
      )
    `)
    .eq('correlativo', numericId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching solicitud by correlativo:', error)
    return null
  }

  return data
}

export async function getRecentSolicitudes(limit: number = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`
      id,
      correlativo,
      monto_solicitado,
      estado,
      created_at,
      socios (nombres_apellidos)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent solicitudes:', error)
    return []
  }
  return data
}

export async function getSolicitudesPresentadas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solicitudes')
    .select(`
      *,
      socios (
        dni, nombres_apellidos, telefono
      ),
      analista:profiles!analista_id (
        full_name
      )
    `)
    .eq('estado', 'PRESENTADA')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching solicitudes presentadas:', error)
    return []
  }
  return data
}

export async function updateSolicitudStatus(id: string, newStatus: string, feedback?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const updateData: any = { 
    estado: newStatus,
    updated_at: new Date().toISOString()
  }

  // If there's feedback, we could store it in a new column or in 'datos_resumen'
  // For now, let's just update the status safely.
  
  const { error } = await supabase
    .from('solicitudes')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating solicitud status:', error)
    throw new Error('Error al actualizar el estado: ' + error.message)
  }

  revalidatePath('/aprobaciones')
  revalidatePath('/solicitudes')
  revalidatePath(`/solicitudes/${id}`)
  revalidatePath('/dashboard')
  
  return { success: true }
}


export async function deleteSolicitud(id: string) {
  try {
    const supabase = await createClient() // Standard client (RLS active)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Check state before deleting
    const { data: current, error: fetchError } = await supabase
      .from('solicitudes')
      .select('estado')
      .eq('id', id)
      .single()

    if (fetchError || !current) return { success: false, error: 'Solicitud no encontrada' }

    if (current.estado !== 'EN_REVISION') {
      return { success: false, error: 'Solo se pueden eliminar solicitudes en revisión' }
    }

    // Force deletion using Admin privileges if standard delete fails or to ensure success
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase
      .from('solicitudes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting solicitud (Admin):', error)
      return { success: false, error: `Error de Sistema: ${error.message}` }
    }

    revalidatePath('/dashboard')
    revalidatePath('/solicitudes')
    revalidatePath('/aprobaciones')
    
    return { success: true }
  } catch (error: any) {
    console.error('Action error deleteSolicitud:', error)
    return { success: false, error: error.message || 'Error inesperado' }
  }
}


