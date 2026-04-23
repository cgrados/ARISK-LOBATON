'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  console.log('Server Action: Intentando login para:', email)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Server Action Error:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  console.log('Server Action: Login exitoso')
  revalidatePath('/', 'layout')
  return redirect('/dashboard')
}

