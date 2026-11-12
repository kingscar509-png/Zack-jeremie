import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '~/types/database.types'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return null

  browserClient ??= createBrowserClient<Database>(url, key)
  return browserClient
}
