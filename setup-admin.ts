import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  const email = 'cmgrados@gmail.com';
  const password = '123456';
  const allModules = ["dashboard", "socios", "solicitudes", "aprobaciones", "configuraciones", "usuarios"];

  console.log(`Buscando al usuario ${email} en auth.users...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error al listar usuarios:', listError);
    return;
  }

  let user = users.find(u => u.email === email);
  let userId: string;

  if (!user) {
    console.log(`Usuario no encontrado. Creándolo...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error('Error al crear usuario:', createError);
      return;
    }
    user = newUser.user;
    userId = user.id;
    console.log(`Usuario creado exitosamente con ID: ${userId}`);
  } else {
    userId = user.id;
    console.log(`Usuario encontrado con ID: ${userId}. Actualizando contraseña...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    });

    if (updateError) {
      console.error('Error al actualizar contraseña:', updateError);
      return;
    }
    console.log('Contraseña actualizada correctamente.');
  }

  console.log(`Actualizando perfil para el rol SUPER_ADMIN...`);

  try {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: 'Administrador Principal',
      role: 'SUPER_ADMIN'
    });

    if (profileError) {
      console.error('Error de Supabase al actualizar el perfil:', profileError);
      process.exit(1);
    }

    console.log(`¡Proceso completado! Usuario ${email} está listo para ingresar con la clave proporcionada.`);
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

setupAdmin();
