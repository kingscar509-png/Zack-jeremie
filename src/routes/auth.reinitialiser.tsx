import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import { SiteHeader } from '~/components/layout/SiteHeader'

export const Route = createFileRoute('/auth/reinitialiser')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (password.length < 10) {
      setMessage('Le mot de passe doit contenir au moins 10 caractères.')
      return
    }
    if (password !== confirm) {
      setMessage('Les deux mots de passe ne correspondent pas.')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('La connexion au service n’est pas configurée.')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setMessage('Le lien est invalide ou expiré. Demandez un nouveau lien.')
      return
    }

    setSuccess(true)
    setMessage('Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-card">
          <span className="eyebrow eyebrow-dark">SÉCURITÉ DU COMPTE</span>
          <h1>Créer un nouveau mot de passe</h1>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input id="new-password" type="password" autoComplete="new-password"
              minLength={10} required value={password}
              onChange={(event) => setPassword(event.target.value)} />
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input id="confirm-password" type="password" autoComplete="new-password"
              minLength={10} required value={confirm}
              onChange={(event) => setConfirm(event.target.value)} />
            {message ? <p className={success ? 'form-message form-success' : 'form-message'} role="status">{message}</p> : null}
            <button className="button button-primary auth-submit" type="submit" disabled={busy || success}>
              {busy ? 'Modification…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
          {success ? <p className="auth-switch"><a href="/auth/connexion">Se connecter</a></p> : null}
        </section>
      </main>
    </div>
  )
}
