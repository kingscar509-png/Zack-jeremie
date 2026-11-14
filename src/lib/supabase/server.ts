import { createServerClient } from '@supabase/ssr'
import {
  getCookies,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server'
import type { Database } from '~/types/database.types'

export function createSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error('La configuration Supabase du serveur est incomplète.')
  }

  // Les réponses qui utilisent une session Supabase ne doivent pas être
  // mises en cache publiquement : elles peuvent contenir des données privées.
  setResponseHeader('Cache-Control', 'private, no-store')

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      // @supabase/ssr 0.8.x attend un seul argument dans setAll.
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options)
        })
      },
    },
  })
}
