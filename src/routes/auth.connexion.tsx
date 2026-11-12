import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/auth/connexion')({
  component: SignInPage,
})

function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)

    if (error) {
      setMessage('Adresse e-mail ou mot de passe incorrect.')
      return
    }

    window.location.assign('/pro')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-card">
          <span className="eyebrow eyebrow-dark">BON RETOUR</span>
          <h1>Connectez-vous à Zack</h1>
          <p className="auth-intro">Accédez à votre compte et à vos espaces professionnels.</p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="signin-email">Adresse e-mail</label>
            <input id="signin-email" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="signin-password">Mot de passe</label>
            <input id="signin-password" type="password" autoComplete="current-password" required
              value={password} onChange={(event) => setPassword(event.target.value)} />
            {message ? <p className="form-message" role="alert">{message}</p> : null}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
          <p className="auth-switch"><a href="/auth/mot-de-passe-oublie">Mot de passe oublié ?</a></p>
          <p className="auth-switch">Pas encore de compte ? <a href="/auth/inscription">Créer un compte</a></p>
        </section>
      </main>
    </div>
  )
}
