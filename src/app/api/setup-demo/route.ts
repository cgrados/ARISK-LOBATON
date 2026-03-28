import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()

    let userId = ''
    
    // 1. Obtener/Crear el Usuario
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === 'cmgrados@gmail.com')
    
    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: 'cmgrados@gmail.com',
        password: '123456',
        email_confirm: true,
        user_metadata: { full_name: 'Carlos Grados' }
      })
      if (userError || !newUser.user) throw new Error(`Error Auth: ${userError?.message}`)
      userId = newUser.user.id
    }

    // 2. Limpiar registros de prueba anteriores (opcional, pero ayuda a no llenar la tabla de basura)
    await supabase.from('solicitudes').delete().like('destino_credito', 'Capital de Trabajo Prueba%')
    await supabase.from('socios').delete().like('dni', '8100%')

    // Listas para datos muy realistas
    const nombresReales = ['Carlos Alberto', 'Maria Fernanda', 'Luis Enrique', 'Ana Lucia', 'Jorge Miguel', 'Carmen Rosa', 'Pedro Pablo', 'Elena Margarita', 'Jose Antonio', 'Lucia Beatriz', 'Miguel Angel', 'Rosa Maria', 'Ricardo Manuel', 'Patricia Elena', 'Fernando Luis', 'Silvia Isabel', 'Roberto Carlos', 'Diana Rocio', 'Victor Hugo', 'Teresa De Jesus']
    const apellidosPaternos = ['Grados', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Mendoza', 'Torres', 'Ramirez', 'Diaz', 'Flores', 'Castro', 'Vargas', 'Rojas', 'Chuquilin', 'Tafur', 'Mejia', 'Salazar', 'Chavez', 'Quispe', 'Mamani']
    const apellidosMaternos = ['Vargas', 'Rojas', 'Chuquilin', 'Tafur', 'Castro', 'Mejia', 'Salazar', 'Chavez', 'Quispe', 'Mamani', 'Grados', 'Perez', 'Garcia', 'Sanchez', 'Romero', 'Mendoza', 'Torres', 'Ramirez', 'Diaz', 'Flores']
    const distritos = ['Miraflores', 'San Isidro', 'Santiago de Surco', 'La Molina', 'San Borja', 'Jesus Maria', 'Lince', 'Magdalena del Mar', 'Pueblo Libre', 'San Miguel', 'Barranco', 'Surquillo', 'Breña', 'Los Olivos', 'San Martin de Porres', 'Chorrillos', 'Ate', 'Comas', 'San Juan de Lurigancho', 'Callao']
    const profesiones = ['Ingeniero Civil', 'Doctora en Medicina', 'Profesor de Secundaria', 'Abogado Corporativo', 'Contador Publico', 'Arquitecto', 'Administradora de Empresas', 'Enfermera Licenciada', 'Desarrollador de Software', 'Chef Profesional', 'Veterinario', 'Odontologo', 'Psicologo', 'Nutricionista', 'Periodista', 'Policia', 'Electricista Automotriz', 'Mecanico', 'Topografo', 'Piloto']
    const actividades = ['Construccion y Diseño', 'Servicios de Salud Integrales', 'Educacion Particular', 'Consultoria Legal Especializada', 'Asesoria Financiera', 'Estudio de Arquitectura', 'Venta al por Mayor', 'Atencion Domiciliaria', 'Consultoria TI', 'Restaurante y Gastronomia', 'Clinica Veterinaria', 'Centro Odontologico', 'Consultorio Psicologico', 'Centro Nutricional', 'Agencia de Noticias', 'Seguridad Privada', 'Taller Automotriz', 'Taller Mecanico', 'Estudio Topografico', 'Transporte Aereo']
    const empresas = ['Inmobiliaria Los Andes S.A.C.', 'Clinica San Pablo', 'Colegio Saco Oliveros', 'Estudio Juridico Rodrigo', 'PwC Peru', 'Graña y Montero', 'Supermercados Peruanos S.A.', 'Hospital Cayetano Heredia', 'Globant Peru', 'Restaurante Central', 'Veterinaria Pet Center', 'Multident', 'Centro Psicologico', 'Nutriforma', 'Agencia Andina', 'Prosegur', 'Autorex', 'Mecanica Express', 'Geoservice', 'LATAM Airlines']
    const cargos = ['Gerente de Proyectos', 'Medico Jefe', 'Coordinador Academico', 'Socio Principal', 'Auditor Senior', 'Arquitecto Residente', 'Jefe de Ventas', 'Supervisora de Area', 'Tech Lead', 'Chef Ejecutivo', 'Director Medico', 'Especialista', 'Psicologo Clinico', 'Nutricionista Jefe', 'Editor Jefe', 'Supervisor', 'Jefe de Taller', 'Mecanico Principal', 'Jefe de Topografia', 'Piloto Cómandiante']
    
    // 3. Crear 20 socios de prueba COMPLETAMENTE POBLADOS Y REALISTAS
    const sociosMocks = Array.from({ length: 20 }).map((_, i) => {
      const idx = i % 20
      const nombre = nombresReales[idx]
      const apellidoP = apellidosPaternos[idx]
      const apellidoM = apellidosMaternos[idx]
      const distrito = distritos[idx]

      return {
        dni: `810000${i.toString().padStart(2, '0')}`,
        nro_cuenta: `104-500-${623456 + i}`,
        nombres: nombre,
        apellido_paterno: apellidoP,
        apellido_materno: apellidoM,
        nombres_apellidos: `${nombre} ${apellidoP} ${apellidoM}`,
        fecha_nacimiento: `19${65 + i}-0${(i % 9) + 1}-1${(i % 8) + 1}`,
        sexo: i % 2 === 0 ? 'M' : 'F',
        estado_civil: ['Casado', 'Soltero', 'Divorciado', 'Viudo'][i % 4],
        nro_dependientes: i % 4,
        telefono: `99${8001234 + i}`,
        instruccion: ['Universitario Completo', 'Tecnico', 'Secundaria'][i % 3],
        nro_cuenta_conyuge: i % 2 === 0 ? `104-500-${987654 - i}` : 'No Aplica',
        direccion: `Av. Los Robles ${200 + i * 15}, Dpto ${101 + i}`,
        distrito: distrito,
        provincia: 'Lima',
        departamento: 'Lima',
        condicion_vivienda: ['Propia Pagada', 'Hipotecada', 'Alquilada'][i % 3],
        actividad_economica: actividades[idx],
        profesion_oficio: profesiones[idx],
        empresa_laboral: empresas[idx],
        direccion_negocio: `Centro Comercial Nivel ${i % 5 + 1}, Local ${i + 3}`,
        distrito_negocio: distritos[(i + 3) % 20],
        ruc: `10810000${i.toString().padStart(2, '0')}5`,
        ruc_empresa: `10810000${i.toString().padStart(2, '0')}5`,
        estado_ruc: 'Activo / Habido',
        cargo: cargos[idx],
        ingreso_bruto_mensual: 4000 + (i * 850),
        aportes_totales: 300 + (i * 150),
        fecha_ingreso: `201${i % 8 + 1}-0${(i % 9) + 1}-15`,
        calificacion_interna: ['Normal (Riesgo Bajo)', 'Normal (Con Observación)', 'CPP (Cliente Potencial)'][i % 3],
        created_by: userId
      }
    })

    // Insertar socios
    const insertedSociosIds = []
    
    for (const socio of sociosMocks) {
      const { data: exist } = await supabase.from('socios').select('id').eq('dni', socio.dni).single()
      if (!exist) {
        const { data: insert, error } = await supabase.from('socios').insert(socio).select('id').single()
        if (error) console.error('Error insertando socio:', error.message)
        if (insert) insertedSociosIds.push(insert.id)
      } else {
        await supabase.from('socios').update(socio).eq('id', exist.id)
        insertedSociosIds.push(exist.id)
      }
    }

    // Crear 20 Solicitudes de prueba
    for (let i = 0; i < insertedSociosIds.length; i++) {
        const sId = insertedSociosIds[i]
        const { data: existSol } = await supabase.from('solicitudes').select('id').eq('socio_id', sId).single()
        
        if (!existSol) {
            await supabase.from('solicitudes').insert({
                socio_id: sId,
                monto_solicitado: 10000 + (i * 2500),
                plazo_meses: 12 + (i % 5) * 6,
                tea: 14.5 + (i % 4),
                estado: ['BORRADOR', 'EN_REVISION', 'APROBADO', 'OBSERVADO', 'DENEGADO'][i % 5] as any,
                destino_credito: 'Capital de Trabajo Prueba Real',
                analista_id: userId
            })
        }
    }

    return NextResponse.json({ 
      status: 'success', 
      message: '20 Registros de Socios (Reales Peruanos) completamente poblados creados exitosamente.' 
    })

  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
