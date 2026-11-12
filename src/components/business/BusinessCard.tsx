type BusinessCardData = {
  id: string
  name: string
  slug: string
  category: string | null
  city: string | null
  neighborhood: string | null
  logo_url: string | null
  description: string | null
}

function safeImageUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function BusinessCard({ business }: { business: BusinessCardData }) {
  const location = [business.neighborhood, business.city].filter(Boolean).join(', ')
  const logoUrl = safeImageUrl(business.logo_url)

  return (
    <a className="business-card" href={`/entreprises/${encodeURIComponent(business.slug)}`}>
      <div className="business-card-top">
        <div className="business-avatar">
          {logoUrl
            ? <img src={logoUrl} alt="" loading="lazy" />
            : <span>{business.name.slice(0, 1).toUpperCase()}</span>}
        </div>
        <div className="business-card-title">
          <strong>{business.name}</strong>
          {business.category ? <span>{business.category}</span> : null}
        </div>
        <span className="verified-dot" aria-label="Entreprise vérifiée">✓</span>
      </div>
      {business.description ? <p>{business.description}</p> : null}
      <div className="business-card-location">
        <span aria-hidden="true">⌖</span>
        {location || 'Haïti'}
      </div>
    </a>
  )
}
