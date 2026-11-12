import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/auth/inscription')({
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setSuccess(false)
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('La connexion au service n’est pas configurée.')
      return
    }

    if (password.length < 10) {
      setMessage('Choisissez un mot de passe d’au moins 10 caractères.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    })
    setBusy(false)

    if (error) {
      setMessage('La création du compte a échoué. Vérifiez les informations ou réessayez plus tard.')
      return
    }

    setSuccess(true)
    setMessage('Compte créé. Si la confirmation par e-mail est activée, consultez votre boîte de réception.')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-card">
          <span className="eyebrow eyebrow-dark">REJOINDRE ZACK</span>
          <h1>Créer votre compte</h1>
          <p className="auth-intro">Un compte vous permet de gérer votre profil, vos favoris et vos activités.</p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="signup-name">Nom complet</label>
            <input id="signup-name" autoComplete="name" required maxLength={120}
              value={name} onChange={(event) => setName(event.target.value)} />
            <label htmlFor="signup-email">Adresse e-mail</label>
            <input id="signup-email" type="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="signup-password">Mot de passe</label>
            <input id="signup-password" type="password" autoComplete="new-password"
              minLength={10} required value={password}
              onChange={(event) => setPassword(event.target.value)} />
            {message ? <p className={success ? 'form-message form-success' : 'form-message'} role="status">{message}</p> : null}
            <button className="button button-primary auth-submit" type="submit" disabled={busy || success}>
              {busy ? 'Création…' : success ? 'Compte créé' : 'Créer mon compte'}
            </button>
          </form>
          <p className="auth-switch">Vous avez déjà un compte ? <a href="/auth/connexion">Se connecter</a></p>
        </section>
      </main>
    </div>
  )
}
