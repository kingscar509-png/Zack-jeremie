import { createFileRoute } from '@tanstack/react-router'
import { getBusinessBySlug } from '~/features/home/home.server'
import { SiteHeader } from '~/components/layout/SiteHeader'

function safeHttpUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

export const Route = createFileRoute('/entreprises/$slug')({
  loader: ({ params }) => getBusinessBySlug({ data: params.slug }),
  component: BusinessPage,
})

function BusinessPage() {
  const { business, unavailable } = Route.useLoaderData()

  if (unavailable) {
    return <><SiteHeader /><main className="content-page"><p className="empty-note">Impossible de charger cette fiche pour le moment.</p></main></>
  }

  if (!business) {
    return <><SiteHeader /><main className="content-page"><h1>Entreprise introuvable</h1><a href="/recherche">Retour à la recherche</a></main></>
  }

  const website = safeHttpUrl(business.website)\n  const coverUrl = safeHttpUrl(business.cover_url)\n  const address = [business.street, business.neighborhood, business.city, business.address]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <a className="back-link" href="/recherche">← Retour à l’annuaire</a>
        {coverUrl ? (
          <img className="business-cover-image" src={coverUrl} alt={`Couverture de ${business.name}`} />
        ) : null}
        <div className="business-profile">
          <div className="business-avatar business-avatar-large">
            {business.logo_url
              ? <img src={business.logo_url} alt={`Logo de ${business.name}`} />
              : <span>{business.name.slice(0, 1).toUpperCase()}</span>}
          </div>
          <div>
            <span className="verified-label">Entreprise vérifiée</span>
            <h1>{business.name}</h1>
            {business.category ? <p className="muted">{business.category}</p> : null}
          </div>
        </div>

        {business.description ? <section className="detail-panel"><h2>À propos</h2><p>{business.description}</p></section> : null}
        <section className="detail-panel">
          <h2>Coordonnées</h2>
          {address ? <p>{address}</p> : null}
          {business.phone ? <p>Téléphone : <a href={`tel:${business.phone}`}>{business.phone}</a></p> : null}
          {business.whatsapp ? <p>WhatsApp : <a href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">{business.whatsapp}</a></p> : null}
          {business.email ? <p>Email : <a href={`mailto:${business.email}`}>{business.email}</a></p> : null}
          {website ? <p>Site web : <a href={website} target="_blank" rel="noreferrer">{website}</a></p> : null}
          {!address && !business.phone && !business.whatsapp && !business.email && !website
            ? <p className="muted">Aucune coordonnée publique renseignée.</p>
            : null}
        </section>
      </main>
    </div>
  )
}
