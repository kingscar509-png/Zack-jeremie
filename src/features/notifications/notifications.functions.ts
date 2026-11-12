import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServerClient } from '~/lib/supabase/server'

export const getMyNotifications = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, notifications: [], unavailable: false }
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, notification_type, entity_type, entity_id, created_at, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Zack notifications query failed.')
      return { user: { id: user.id }, notifications: [], unavailable: true }
    }

    return {
      user: { id: user.id },
      notifications: data ?? [],
      unavailable: false,
    }
  },
)
