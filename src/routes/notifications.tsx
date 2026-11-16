import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getMyNotifications } from '~/features/notifications/notifications.functions'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/notifications')({
  loader: () => getMyNotifications(),
  component: NotificationsPage,
})

function NotificationsPage() {
  const initial = Route.useLoaderData()
  const [readIds, setReadIds] = useState<string[]>([])
  const [message, setMessage] = useState('')

  async function markRead(id: string) {
    if (!initial.user) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('Le service est momentanément indisponible.')
      return
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', initial.user.id)

    if (error) {
      setMessage('Cette notification n’a pas pu être marquée comme lue.')
      return
    }

    setReadIds((current) => current.includes(id) ? current : [...current, id])
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <span className="eyebrow eyebrow-dark">MON COMPTE</span>
        <h1>Notifications</h1>
        {!initial.user ? (
          <section className="detail-panel">
            <p>Connectez-vous pour consulter vos notifications.</p>
            <a className="button button-primary" href="/auth/connexion">Se connecter</a>
          </section>
        ) : initial.unavailable ? (
          <p className="empty-note">Les notifications sont momentanément indisponibles.</p>
        ) : initial.notifications.length ? (
          <div className="notification-list">
            {initial.notifications.map((notification) => {
              const isRead = Boolean(notification.read_at) || readIds.includes(notification.id)
              return (
                <article className={isRead ? 'notification-item is-read' : 'notification-item'} key={notification.id}>
                  <div className="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <time dateTime={notification.created_at}>
                      {new Date(notification.created_at).toLocaleString('fr-FR')}
                    </time>
                  </div>
                  {!isRead ? (
                    <button className="button button-outline" type="button" onClick={() => markRead(notification.id)}>
                      Marquer comme lue
                    </button>
                  ) : <span className="read-label">Lue</span>}
                </article>
              )
            })}
          </div>
        ) : (
          <p className="empty-note">Vous n’avez aucune notification pour le moment.</p>
        )}
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </main>
    </div>
  )
}
