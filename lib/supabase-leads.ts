import { createClient } from '@supabase/supabase-js'

// Cliente con service role para insertar leads desde server-side (API routes)
export function createLeadsClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const ORG_ID = 'a0000000-0000-0000-0000-000000000001'
