import { ThemeSwitcher } from './ThemeSwitcher'

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Zack, accueil">
        <span className="brand-mark">Z</span>
        <span>ZACK</span>
      </a>
      <nav className="main-nav" aria-label="Navigation principale">
        <a href="/">Accueil</a>
        <a href="/recherche">Explorer</a>
        <a href="/profil">Mon profil</a>
      </nav>
      <div className="header-actions">
        <ThemeSwitcher />
        <a className="button button-primary" href="/auth/inscription">Inscrire mon entreprise</a>
      </div>
    </header>
  )
}
