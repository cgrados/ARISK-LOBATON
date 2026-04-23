import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verifyLogin() {
  const email = 'cmgrados@gmail.com';
  const password = '123456';
  
  console.log(`Intentando login para: ${email} con la clave proporcionada...`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('ERROR DE LOGIN:', error.message);
  } else {
    console.log('LOGIN EXITOSO!');
    console.log('USER ID:', data.user.id);
  }
}

verifyLogin();
