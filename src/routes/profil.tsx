import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getCurrentAccount } from '~/features/auth/auth.functions'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/profil')({
  loader: () => getCurrentAccount(),
  component: ProfilePage,
})

function ProfilePage() {
  const account = Route.useLoaderData()
  const [fullName, setFullName] = useState(account.profile?.full_name ?? '')
  const [phone, setPhone] = useState(account.profile?.phone ?? '')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (!account.user) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('La connexion au service n’est pas configurée.')
      return
    }

    setBusy(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: account.user.id,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      setMessage(error
        ? 'Le profil n’a pas pu être enregistré. Vérifiez vos droits ou réessayez.'
        : 'Votre profil a été mis à jour.')
    } catch {
      setMessage('Une erreur temporaire a empêché l’enregistrement. Réessayez dans quelques instants.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <span className="eyebrow eyebrow-dark">MON COMPTE</span>
        <h1>Mon profil</h1>
        {account.unavailable && !account.user ? (
          <section className="detail-panel">
            <p role="alert">Le service de compte est momentanément indisponible. Réessayez dans quelques instants.</p>
          </section>
        ) : !account.user ? (
          <section className="detail-panel">
            <p>Connectez-vous pour consulter et modifier votre profil.</p>
            <a className="button button-primary" href="/auth/connexion">Se connecter</a>
          </section>
        ) : (
          <section className="detail-panel">
            {account.unavailable ? <p className="form-message" role="status">Certaines données du compte n’ont pas pu être chargées. Vos informations de connexion restent reconnues ; réessayez pour actualiser les données.</p> : null}
            <p className="muted">Adresse e-mail : {account.user.email ?? 'Non renseignée'}</p>
            <form className="auth-form business-form" onSubmit={submit}>
              <label htmlFor="profile-name">Nom complet</label>
              <input id="profile-name" maxLength={120} value={fullName}
                onChange={(event) => setFullName(event.target.value)} />
              <label htmlFor="profile-phone">Téléphone</label>
              <input id="profile-phone" type="tel" maxLength={40} value={phone}
                onChange={(event) => setPhone(event.target.value)} />
              {message ? <p className="form-message" role="status">{message}</p> : null}
              <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                {busy ? 'Enregistrement…' : 'Enregistrer mon profil'}
              </button>
            </form>
            <p className="auth-switch"><a href="/pro">Accéder à mon espace professionnel</a></p>
          </section>
        )}
      </main>
    </div>
  )
}
