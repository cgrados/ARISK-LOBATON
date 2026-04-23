import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkUser() {
  const email = 'cmgrados@gmail.com';
  console.log(`Verificando usuario: ${email}`);

  // 1. Check Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error al listar usuarios:', authError);
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    console.log('USUARIO NO ENCONTRADO EN AUTH');
  } else {
    console.log(`USUARIO ENCONTRADO EN AUTH. ID: ${user.id}`);
  }

  // 2. Check Profile
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('ERROR AL BUSCAR PERFIL:', profileError);
    } else {
      console.log('PERFIL ENCONTRADO:', profile);
    }
  }
}

checkUser();
