import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { searchBusinesses } from '~/features/home/home.server'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { BusinessCard } from '~/components/business/BusinessCard'

const searchSchema = z.object({ q: z.string().optional() })

export const Route = createFileRoute('/recherche')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ query: search.q ?? '' }),
  loader: ({ deps }) => searchBusinesses({ data: deps.query }),
  component: SearchPage,
})

function SearchPage() {
  const { q = '' } = Route.useSearch()
  const { businesses, unavailable } = Route.useLoaderData()

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <span className="eyebrow eyebrow-dark">ANNUAIRE NATIONAL</span>
        <h1>Rechercher en Haïti</h1>
        <form className="page-search" action="/recherche" method="get">
          <label className="sr-only" htmlFor="search-query">Votre recherche</label>
          <input id="search-query" name="q" type="search" defaultValue={q}
            placeholder="Nom, activité, produit ou service…" />
          <button type="submit">Rechercher</button>
        </form>

        <div className="results-heading">
          <h2>{q ? `Résultats pour « ${q} »` : 'Entreprises vérifiées'}</h2>
          <span>{businesses.length} résultat(s) affiché(s)</span>
        </div>

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
            Aucun résultat pour cette recherche. Essayez un autre mot.
          </p>
        )}
      </main>
    </div>
  )
}
