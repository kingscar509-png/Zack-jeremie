import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getCurrentAccount, createBusiness } from '~/features/auth/auth.functions'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'

export const Route = createFileRoute('/pro')({
  loader: () => getCurrentAccount(),
  component: ProfessionalPage,
})

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ProfessionalPage() {
  const account = Route.useLoaderData()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    const result = await createBusiness({
      data: {
        name,
        slug: makeSlug(name),
        category,
        description,
        address,
        neighborhood,
        city,
        phone,
        whatsapp,
        email,
      },
    })
    setBusy(false)
    setMessage(result.message)
    if (result.success) {
      window.setTimeout(() => window.location.reload(), 1800)
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    window.location.assign('/')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <div className="pro-heading">
          <div>
            <span className="eyebrow eyebrow-dark">ESPACE PROFESSIONNEL</span>
            <h1>Votre espace Zack</h1>
            <p className="muted">{account.user?.email ?? 'Compte non connecté'}</p>
          </div>
          {account.user ? <button className="button button-outline" type="button" onClick={signOut}>Déconnexion</button> : null}
        </div>

        {!account.user ? (
          <section className="detail-panel">
            <h2>Connectez-vous pour continuer</h2>
            <p>Vous devez être connecté pour gérer une entreprise ou en inscrire une nouvelle.</p>
            <a className="button button-primary" href="/auth/connexion">Se connecter</a>
          </section>
        ) : (
          <>
            <section className="detail-panel">
              <h2>Mes entreprises</h2>
              {account.businesses.length ? (
                <div className="workspace-list">
                  {account.businesses.map((membership) => {
                    const business = Array.isArray(membership.businesses)
                      ? membership.businesses[0]
                      : membership.businesses
                    return (
                      <article className="workspace-item" key={membership.business_id}>
                        <div>
                          <strong>{business?.name ?? 'Entreprise'}</strong>
                          <p className="muted">Rôle : {membership.role} · Statut : {business?.status ?? 'inconnu'}</p>
                        </div>
                        {business?.slug ? <a href={`/entreprises/${business.slug}`}>Voir la fiche</a> : null}
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="muted">Vous ne gérez encore aucune entreprise avec ce compte.</p>
              )}
            </section>

            <section className="detail-panel">
              <h2>Inscrire une entreprise</h2>
              <p className="muted">La fiche sera créée avec le statut « en attente ». Elle ne sera pas visible publiquement avant vérification.</p>
              <form className="auth-form business-form" onSubmit={submit}>
                <label htmlFor="business-name">Nom de l’entreprise *</label>
                <input id="business-name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
                <label htmlFor="business-category">Catégorie</label>
                <input id="business-category" maxLength={100} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ex. : Restaurant, commerce, santé…" />
                <label htmlFor="business-description">Description</label>
                <textarea id="business-description" rows={4} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} />
                <label htmlFor="business-address">Adresse</label>
                <input id="business-address" maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} />
                <label htmlFor="business-city">Ville / commune</label>
                <input id="business-city" maxLength={120} value={city} onChange={(event) => setCity(event.target.value)} />
                <label htmlFor="business-neighborhood">Quartier / localité</label>
                <input id="business-neighborhood" maxLength={120} value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
                <div className="form-columns">
                  <div><label htmlFor="business-phone">Téléphone</label><input id="business-phone" type="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
                  <div><label htmlFor="business-whatsapp">WhatsApp</label><input id="business-whatsapp" type="tel" maxLength={40} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} /></div>
                </div>
                <label htmlFor="business-email">E-mail professionnel</label>
                <input id="business-email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
                {message ? <p className="form-message" role="status">{message}</p> : null}
                <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                  {busy ? 'Envoi…' : 'Envoyer ma demande'}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
