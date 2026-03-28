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

async function setAdminAccess() {
  const email = 'cmgrados@gmail.com';
  const allModules = ["dashboard", "socios", "solicitudes", "aprobaciones", "configuraciones", "usuarios"];

  console.log(`Buscando al usuario ${email} en auth.users...`);
  
  // Buscar en la tabla users gestionada por Supabase Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error al listar usuarios:', authError);
    return;
  }

  const targetUser = users.find(u => u.email === email);
  
  if (!targetUser) {
    console.error(`No pude encontrar al usuario con email: ${email} en el sistema.`);
    return;
  }

  console.log(`Usuario encontrado. ID: ${targetUser.id}. Actualizando su perfil...`);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: targetUser.id,
    full_name: 'Administrador Principal',
    role: 'SUPER_ADMIN',
    modules_access: allModules
  });

  if (profileError) {
    console.error('Error al actualizar el perfil:', profileError);
    return;
  }

  console.log('¡Acceso total concedido exitosamente a cmgrados@gmail.com!');
}

setAdminAccess();
