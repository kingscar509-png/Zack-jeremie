import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/auth/mot-de-passe-oublie')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('La connexion au service n’est pas configurée.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reinitialiser`,
    })
    setBusy(false)

    setMessage(error
      ? 'Impossible d’envoyer le lien. Vérifiez l’adresse ou réessayez plus tard.'
      : 'Si cette adresse correspond à un compte, un lien de réinitialisation sera envoyé.')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-card">
          <span className="eyebrow eyebrow-dark">RÉCUPÉRATION</span>
          <h1>Mot de passe oublié ?</h1>
          <p className="auth-intro">Indiquez l’adresse e-mail associée à votre compte.</p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="reset-email">Adresse e-mail</label>
            <input id="reset-email" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} />
            {message ? <p className="form-message" role="status">{message}</p> : null}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
          <p className="auth-switch"><a href="/auth/connexion">Retour à la connexion</a></p>
        </section>
      </main>
    </div>
  )
}
