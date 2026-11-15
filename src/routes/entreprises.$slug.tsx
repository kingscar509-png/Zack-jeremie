import { createFileRoute } from '@tanstack/react-router'
import { getBusinessBySlug } from '~/features/home/home.functions'
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

function safePhone(value: string | null) {
  if (!value) return null
  const normalized = value.replace(/[^0-9+]/g, '')
  return /^\+?\d{6,15}$/.test(normalized) ? normalized : null
}

function safeEmail(value: string | null) {
  if (!value || value.length > 254) return null
  return /^[^\s@/?#]+@[^\s@/?#]+\.[^\s@/?#]+$/.test(value) ? value : null
}

export const Route = createFileRoute('/entreprises/$slug')({
  loader: ({ params }) => getBusinessBySlug({ data: params.slug }),
  component: BusinessPage,
})

function BusinessPage() {
  const { business, products, services, catalogUnavailable, unavailable } = Route.useLoaderData()

  if (unavailable) {
    return <><SiteHeader /><main className="content-page"><p className="empty-note">Impossible de charger cette fiche pour le moment.</p></main></>
  }

  if (!business) {
    return <><SiteHeader /><main className="content-page"><h1>Entreprise introuvable</h1><a href="/recherche">Retour à la recherche</a></main></>
  }

  const website = safeHttpUrl(business.website)
  const phone = safePhone(business.phone)
  const whatsapp = safePhone(business.whatsapp)
  const email = safeEmail(business.email)
  const coverUrl = safeHttpUrl(business.cover_url)
  const logoUrl = safeHttpUrl(business.logo_url)
  const address = [business.street, business.neighborhood, business.city, business.address]
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
            {logoUrl
              ? <img src={logoUrl} alt={`Logo de ${business.name}`} />
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
          <h2>Produits</h2>
          {catalogUnavailable ? (
            <p className="muted">Le catalogue est momentanément indisponible.</p>
          ) : products.length ? (
            <div className="workspace-list">
              {products.map((product) => {
                const imageUrl = safeHttpUrl(product.image_url)
                return (
                  <article className="workspace-item" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      {product.description ? <p>{product.description}</p> : null}
                      {imageUrl ? <img className="business-avatar" src={imageUrl} alt={product.name} /> : null}
                      {product.price !== null
                        ? <p className="muted">{product.price.toLocaleString('fr-HT')} {product.currency}</p>
                        : <p className="muted">Prix sur demande</p>}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="muted">Aucun produit disponible pour le moment.</p>
          )}
        </section>

        <section className="detail-panel">
          <h2>Services</h2>
          {catalogUnavailable ? (
            <p className="muted">Le catalogue est momentanément indisponible.</p>
          ) : services.length ? (
            <div className="workspace-list">
              {services.map((service) => (
                <article className="workspace-item" key={service.id}>
                  <div>
                    <strong>{service.name}</strong>
                    {service.description ? <p>{service.description}</p> : null}
                    {service.duration ? <p className="muted">Durée : {service.duration}</p> : null}
                    {service.price !== null
                      ? <p className="muted">{service.price.toLocaleString('fr-HT')} {service.currency}</p>
                      : <p className="muted">Prix sur demande</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Aucun service disponible pour le moment.</p>
          )}
        </section>

        <section className="detail-panel">
          <h2>Coordonnées</h2>
          {address ? <p>{address}</p> : null}
          {business.phone ? <p>Téléphone : {phone ? <a href={`tel:${phone}`}>{business.phone}</a> : business.phone}</p> : null}
          {business.whatsapp ? <p>WhatsApp : {whatsapp ? <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">{business.whatsapp}</a> : business.whatsapp}</p> : null}
          {business.email ? <p>Email : {email ? <a href={`mailto:${email}`}>{business.email}</a> : business.email}</p> : null}
          {website ? <p>Site web : <a href={website} target="_blank" rel="noreferrer">{website}</a></p> : null}
          {!address && !business.phone && !business.whatsapp && !business.email && !website
            ? <p className="muted">Aucune coordonnée publique renseignée.</p>
            : null}
        </section>
      </main>
    </div>
  )
}
