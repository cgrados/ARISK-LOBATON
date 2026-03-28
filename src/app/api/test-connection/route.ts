import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminClient()
    
    // Test database connection by checking the current time in the database
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      // If error is 42P01, it means connection works but table doesn't exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ 
          status: 'connected_but_no_tables', 
          message: 'Connection successful, but the profiles table is missing. Make sure to run the SQL migration schema in the Supabase Studio SQL editor.',
        })
      }
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Successfully connected to the Supabase VPS!', 
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ status: 'catch_error', message: error.message }, { status: 500 })
  }
}
