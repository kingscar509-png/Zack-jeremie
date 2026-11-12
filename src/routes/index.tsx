import { createFileRoute } from '@tanstack/react-router'
import { getHomeData } from '~/features/home/home.server'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { BusinessCard } from '~/components/business/BusinessCard'
import { ThemeSwitcher } from '~/components/layout/ThemeSwitcher'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  component: HomePage,
})

function HomePage() {
  const { categories, businesses, unavailable } = Route.useLoaderData()

  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <span className="eyebrow">DÉCOUVRIR · COMPARER · CONTACTER</span>
            <h1>Les bonnes adresses d’Haïti, <span>au même endroit.</span></h1>
            <p>
              Découvrez des entreprises et leurs coordonnées partout dans le pays.
              Zack vous rapproche des professionnels haïtiens.
            </p>
            <form className="hero-search" action="/recherche" method="get">
              <label className="sr-only" htmlFor="home-search">
                Que recherchez-vous ?
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Une entreprise, une activité, une localité…"
              />
              <button type="submit">Rechercher</button>
            </form>
            <div className="hero-note">Une plateforme pensée pour toute Haïti 🇭🇹</div>
          </div>
        </section>

        <section className="content-section" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow eyebrow-dark">EXPLORER</span>
              <h2>Explorer par catégorie</h2>
            </div>
            <a href="/recherche">Voir toutes les entreprises</a>
          </div>
          {categories.length ? (
            <div className="category-grid">
              {categories.map((category) => (
                <a
                  className="category-tile"
                  href={`/recherche?q=${encodeURIComponent(category.name)}`}
                  key={category.id}
                >
                  <span aria-hidden="true">{category.icon || '◆'}</span>
                  <strong>{category.name}</strong>
                </a>
              ))}
            </div>
          ) : (
            <p className="empty-note">
              Les catégories seront affichées ici dès qu’elles seront disponibles.
            </p>
          )}
        </section>

        <section className="content-section businesses-section" id="entreprises">
          <div className="section-heading">
            <div>
              <span className="eyebrow eyebrow-dark">ANNUAIRE NATIONAL</span>
              <h2>Entreprises à découvrir</h2>
              <p className="section-subtitle">
                Des fiches publiques d’entreprises vérifiées, sans statistiques inventées.
              </p>
            </div>
            <a href="/recherche">Explorer l’annuaire</a>
          </div>

          {unavailable ? (
            <p className="empty-note">
              Le service est momentanément indisponible. Réessayez dans quelques instants.
            </p>
          ) : businesses.length ? (
            <div className="business-grid">
              {businesses.map((business) => (
                <BusinessCard business={business} key={business.id} />
              ))}
            </div>
          ) : (
            <p className="empty-note">
              Les premières entreprises vérifiées apparaîtront ici.
            </p>
          )}
        </section>

        <section className="join-banner">
          <div>
            <span className="eyebrow">VOUS ÊTES PROFESSIONNEL ?</span>
            <h2>Faites connaître votre activité dans tout le pays.</h2>
            <p>Préparez votre fiche entreprise et présentez vos produits et services.</p>
          </div>
          <a className="button button-yellow" href="/auth/inscription">
            Rejoindre Zack
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="/">ZACK</a>
        <span>La vitrine des entreprises haïtiennes.</span>
        <ThemeSwitcher />
        <small>© {new Date().getFullYear()} Zack. Tous droits réservés.</small>
      </footer>
    </div>
  )
}
