import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { searchBusinesses } from '~/features/home/home.functions'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { BusinessCard } from '~/components/business/BusinessCard'

const searchSchema = z.object({
  q: z.string().trim().max(100).optional().catch(''),
  city: z.string().trim().max(100).optional().catch(''),
  category: z.string().trim().max(100).optional().catch(''),
})

export const Route = createFileRoute('/recherche')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    query: search.q ?? '',
    city: search.city ?? '',
    category: search.category ?? '',
  }),
  loader: ({ deps }) => searchBusinesses({
    data: {
      query: deps.query,
      city: deps.city,
      category: deps.category,
    },
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q = '', city = '', category = '' } = Route.useSearch()
  const { businesses, unavailable } = Route.useLoaderData()
  const hasFilters = Boolean(q || city || category)

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <span className="eyebrow eyebrow-dark">ANNUAIRE NATIONAL</span>
        <h1>Rechercher en Haïti</h1>
        <form className="page-search" action="/recherche" method="get">
          <label className="sr-only" htmlFor="search-query">Entreprise ou activité</label>
          <input id="search-query" name="q" type="search" defaultValue={q}
            placeholder="Nom ou activité…" maxLength={100} />
          <label className="sr-only" htmlFor="search-city">Ville ou commune</label>
          <input id="search-city" name="city" type="search" defaultValue={city}
            placeholder="Ville ou commune…" maxLength={100} />
          <label className="sr-only" htmlFor="search-category">Catégorie</label>
          <input id="search-category" name="category" type="search" defaultValue={category}
            placeholder="Catégorie…" maxLength={100} />
          <button type="submit">Rechercher</button>
        </form>

        <div className="results-heading">
          <h2>{hasFilters ? 'Résultats de votre recherche' : 'Entreprises vérifiées'}</h2>
          <span>{businesses.length} résultat(s) affiché(s)</span>
        </div>
        {hasFilters ? (
          <p className="muted">
            {[
              q ? `Recherche : ${q}` : '',
              city ? `Ville : ${city}` : '',
              category ? `Catégorie : ${category}` : '',
            ].filter(Boolean).join(' · ')}
            {' · '}
            <a href="/recherche">Effacer les filtres</a>
          </p>
        ) : null}

        {unavailable ? (
          <p className="empty-note">La recherche est momentanément indisponible.</p>
        ) : businesses.length ? (
          <div className="business-grid">
            {businesses.map((business) => (
              <BusinessCard business={business} key={business.id} />
            ))}
          </div>
        ) : (
          <p className="empty-note">
            Aucun résultat pour cette recherche. Essayez un autre mot ou une autre localité.
          </p>
        )}
      </main>
    </div>
  )
}
