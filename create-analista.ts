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

async function createAnalista() {
  const email = 'analista@gmail.com';
  const password = '654321';
  
  // Modulos a los que el analista tendrá acceso
  const modules = ["dashboard", "socios"]; // Acceso limitado

  console.log(`Creando al usuario ${email} en auth.users...`);
  
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (authError) {
    console.error('Error al crear credenciales:', authError);
    return;
  }

  console.log(`Usuario creado. ID: ${newUser.user.id}. Actualizando su perfil...`);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: newUser.user.id,
    full_name: 'Analista de Prueba',
    role: 'ANALISTA',
    modules_access: modules,
    dni: '12345678',
    agencia: 'Agencia Central'
  });

  if (profileError) {
    console.error('Error al actualizar el perfil:', profileError);
    return;
  }

  console.log('¡Usuario Analista creado y configurado exitosamente!');
}

createAnalista();
