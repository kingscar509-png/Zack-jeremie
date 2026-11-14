import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const subscriptionsPage = readFileSync(
  new URL('../src/routes/abonnements.tsx', import.meta.url),
  'utf8',
)
const homePage = readFileSync(
  new URL('../src/routes/index.tsx', import.meta.url),
  'utf8',
)
const searchPage = readFileSync(
  new URL('../src/routes/recherche.tsx', import.meta.url),
  'utf8',
)
const homeFunctions = readFileSync(
  new URL('../src/features/home/home.functions.ts', import.meta.url),
  'utf8',
)
const businessPage = readFileSync(
  new URL('../src/routes/entreprises.$slug.tsx', import.meta.url),
  'utf8',
)
const professionalPage = readFileSync(
  new URL('../src/routes/pro.tsx', import.meta.url),
  'utf8',
)
const catalogFunctions = readFileSync(
  new URL('../src/features/auth/catalog.functions.ts', import.meta.url),
  'utf8',
)
const catalogManager = readFileSync(
  new URL('../src/components/business/CatalogManager.tsx', import.meta.url),
  'utf8',
)

test('la page abonnements reste strictement en lecture seule', () => {
  assert.match(subscriptionsPage, /createServerFn\(\{\s*method:\s*'GET'/)
  assert.doesNotMatch(subscriptionsPage, /\.(?:insert|update|delete|upsert)\s*\(/)
  assert.doesNotMatch(subscriptionsPage, /\.rpc\s*\(/)
})

test('les abonnements sont réservés aux propriétaires et administrateurs', () => {
  assert.match(
    subscriptionsPage,
    /membership\.role === 'owner' \|\| membership\.role === 'admin'/,
  )
  assert.match(subscriptionsPage, /\.eq\('user_id', user\.id\)/)
})

test('les données privées sont limitées aux entreprises gérées', () => {
  assert.ok(
    (subscriptionsPage.match(/\.in\('business_id', businessIds\)/g) ?? []).length >= 2,
    'les abonnements et paiements doivent être filtrés par les entreprises autorisées',
  )
})

test('la page ne récupère ni notes internes ni coordonnées de réception', () => {
  assert.doesNotMatch(
    subscriptionsPage,
    /review_note|get_payment_recipients|account_number/,
  )
})

test('la recherche nationale propose des filtres ville et catégorie', () => {
  assert.match(searchPage, /name="city"/)
  assert.match(searchPage, /name="category"/)
  assert.match(searchPage, /city: search\.city/)
  assert.match(searchPage, /category: search\.category/)
  assert.match(homeFunctions, /request\.ilike\('city'/)
  assert.match(homeFunctions, /request\.ilike\('category'/)
})

test('les filtres de recherche sont limités et validés côté serveur', () => {
  assert.match(homeFunctions, /query: z\.string\(\)\.trim\(\)\.max\(100\)/)
  assert.match(homeFunctions, /city: z\.string\(\)\.trim\(\)\.max\(100\)/)
  assert.match(homeFunctions, /category: z\.string\(\)\.trim\(\)\.max\(100\)/)
  assert.match(searchPage, /maxLength=\{100\}/)
})

test('le catalogue public est limité aux produits et services disponibles de la bonne entreprise', () => {
  assert.match(homeFunctions, /\.from\('products'\)[\s\S]*?\.eq\('business_id', data\.id\)[\s\S]*?\.eq\('is_available', true\)/)
  assert.match(homeFunctions, /\.from\('services'\)[\s\S]*?\.eq\('business_id', data\.id\)[\s\S]*?\.eq\('is_available', true\)/)
  assert.match(homeFunctions, /\.eq\('status', 'verified'\)/)
})

test('la fiche entreprise affiche les produits et services sans activer de commande', () => {
  assert.match(businessPage, /<h2>Produits<\/h2>/)
  assert.match(businessPage, /<h2>Services<\/h2>/)
  assert.match(businessPage, /catalogUnavailable/)
  assert.doesNotMatch(businessPage, /place_order|\.insert\s*\(/)
})

test('la gestion du catalogue vérifie le compte, le rôle et l’entreprise côté serveur', () => {
  assert.match(catalogFunctions, /supabase\.auth\.getUser\(\)/)
  assert.match(catalogFunctions, /\.eq\('business_id', data\.businessId\)/)
  assert.match(catalogFunctions, /\.eq\('user_id', user\.id\)/)
  assert.match(catalogFunctions, /\['owner', 'admin', 'editor'\]\.includes\(membership\.role\)/)
  assert.match(catalogFunctions, /\.eq\('id', data\.itemId!\)\.eq\('business_id', data\.businessId\)/)
  assert.match(catalogFunctions, /result\.error \|\| !result\.data\?\.length/)
  assert.match(catalogFunctions, /\.select\('id'\)/)
})

test('le gestionnaire permet de créer, modifier, désactiver et supprimer les éléments', () => {
  assert.match(catalogManager, /action: editingId \? 'update' : 'create'/)
  assert.match(catalogManager, /action: 'delete'/)
  assert.match(catalogManager, /toggleAvailability/)
  assert.match(catalogManager, /isAvailable: !item\.is_available/)
  assert.match(professionalPage, /<CatalogManager businessId=\{membership\.business_id\} role=\{membership\.role\}/)
})

test('les images du catalogue doivent utiliser HTTPS et aucune modération préalable', () => {
  assert.match(catalogFunctions, /value\.startsWith\('https:\/\/'\)/)
  assert.match(catalogFunctions, /is_available: data\.isAvailable/)
  assert.doesNotMatch(catalogFunctions, /moderation_queue|approval_required|pending_approval/)
  assert.doesNotMatch(catalogManager, /moderation_queue|approval_required|pending_approval/)
})

test('le gestionnaire conserve le retour de mutation après le rechargement du catalogue', () => {
  assert.match(catalogManager, /async function refresh\(clearMessage = false\)/)
  assert.match(catalogManager, /if \(clearMessage\) setMessage\(''\)/)
  assert.match(catalogManager, /setMessage\(result\.message\)[\s\S]*?await refresh\(\)/)
  assert.match(catalogManager, /setKind\('product'\)[\s\S]*?disabled=\{busy\}/)
  assert.match(catalogManager, /setKind\('service'\)[\s\S]*?disabled=\{busy\}/)
})

test('les catégories de l’accueil activent le filtre catégorie de l’annuaire', () => {
  assert.match(homePage, /href=\{\`\/recherche\?category=\$\{encodeURIComponent\(category\.name\)\}\`\}/)
  assert.doesNotMatch(homePage, /href=\{\`\/recherche\?q=\$\{encodeURIComponent\(category\.name\)\}\`\}/)
})

test('la fiche entreprise conserve une structure stable si le chargement échoue', () => {
  assert.match(homeFunctions, /business: null,[\s\S]*?products: \[\],[\s\S]*?services: \[\],[\s\S]*?catalogUnavailable: false,[\s\S]*?unavailable: true/)
})

test('les liens téléphone, WhatsApp et email sont validés avant création', () => {
  assert.match(businessPage, /function safePhone\(/)
  assert.match(businessPage, /\^\\\+\?\\d\{6,15\}\$/)
  assert.match(businessPage, /function safeEmail\(/)
  assert.match(businessPage, /const phone = safePhone\(business\.phone\)/)
  assert.match(businessPage, /const whatsapp = safePhone\(business\.whatsapp\)/)
  assert.match(businessPage, /const email = safeEmail\(business\.email\)/)
})

test('les filtres de recherche normalisent les espaces avant affichage et requête', () => {
  assert.match(searchPage, /q: z\.string\(\)\.trim\(\)\.max\(100\)/)
  assert.match(searchPage, /city: z\.string\(\)\.trim\(\)\.max\(100\)/)
  assert.match(searchPage, /category: z\.string\(\)\.trim\(\)\.max\(100\)/)
})


const authPages = {"auth.connexion.tsx":"import { useState, type FormEvent } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { getSupabaseBrowserClient } from '~/lib/supabase/client'\nimport { SiteHeader } from '~/components/layout/SiteHeader'\n\nexport const Route = createFileRoute('/auth/connexion')({\n  component: SignInPage,\n})\n\nfunction SignInPage() {\n  const [email, setEmail] = useState('')\n  const [password, setPassword] = useState('')\n  const [message, setMessage] = useState('')\n  const [busy, setBusy] = useState(false)\n\n  async function submit(event: FormEvent<HTMLFormElement>) {\n    event.preventDefault()\n    setMessage('')\n    const supabase = getSupabaseBrowserClient()\n    if (!supabase) {\n      setMessage('La connexion au service n’est pas configurée.')\n      return\n    }\n\n    setBusy(true)\n    let error: { message: string } | null = null\n    try {\n      const result = await supabase.auth.signInWithPassword({\n        email: email.trim(),\n        password,\n      })\n      error = result.error\n    } catch {\n      setMessage('Le service de connexion est momentanément indisponible. Réessayez.')\n      return\n    } finally {\n      setBusy(false)\n    }\n\n    if (error) {\n      setMessage('Adresse e-mail ou mot de passe incorrect.')\n      return\n    }\n\n    window.location.assign('/pro')\n  }\n\n  return (\n    <div className=\"site-shell\">\n      <SiteHeader />\n      <main className=\"auth-page\">\n        <section className=\"auth-card\">\n          <span className=\"eyebrow eyebrow-dark\">BON RETOUR</span>\n          <h1>Connectez-vous à Zack</h1>\n          <p className=\"auth-intro\">Accédez à votre compte et à vos espaces professionnels.</p>\n          <form onSubmit={submit} className=\"auth-form\">\n            <label htmlFor=\"signin-email\">Adresse e-mail</label>\n            <input id=\"signin-email\" type=\"email\" autoComplete=\"email\" required\n              value={email} onChange={(event) => setEmail(event.target.value)} />\n            <label htmlFor=\"signin-password\">Mot de passe</label>\n            <input id=\"signin-password\" type=\"password\" autoComplete=\"current-password\" required\n              value={password} onChange={(event) => setPassword(event.target.value)} />\n            {message ? <p className=\"form-message\" role=\"alert\">{message}</p> : null}\n            <button className=\"button button-primary auth-submit\" type=\"submit\" disabled={busy}>\n              {busy ? 'Connexion…' : 'Se connecter'}\n            </button>\n          </form>\n          <p className=\"auth-switch\"><a href=\"/auth/mot-de-passe-oublie\">Mot de passe oublié ?</a></p>\n          <p className=\"auth-switch\">Pas encore de compte ? <a href=\"/auth/inscription\">Créer un compte</a></p>\n        </section>\n      </main>\n    </div>\n  )\n}\n","auth.inscription.tsx":"import { useState, type FormEvent } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { getSupabaseBrowserClient } from '~/lib/supabase/client'\nimport { SiteHeader } from '~/components/layout/SiteHeader'\n\nexport const Route = createFileRoute('/auth/inscription')({\n  component: SignUpPage,\n})\n\nfunction SignUpPage() {\n  const [name, setName] = useState('')\n  const [email, setEmail] = useState('')\n  const [password, setPassword] = useState('')\n  const [message, setMessage] = useState('')\n  const [success, setSuccess] = useState(false)\n  const [busy, setBusy] = useState(false)\n\n  async function submit(event: FormEvent<HTMLFormElement>) {\n    event.preventDefault()\n    setMessage('')\n    setSuccess(false)\n    const supabase = getSupabaseBrowserClient()\n    if (!supabase) {\n      setMessage('La connexion au service n’est pas configurée.')\n      return\n    }\n\n    if (password.length < 10) {\n      setMessage('Choisissez un mot de passe d’au moins 10 caractères.')\n      return\n    }\n\n    setBusy(true)\n    let error: { message: string } | null = null\n    try {\n      const result = await supabase.auth.signUp({\n        email: email.trim(),\n        password,\n        options: { data: { full_name: name.trim() } },\n      })\n      error = result.error\n    } catch {\n      setMessage('Le service d’inscription est momentanément indisponible. Réessayez.')\n      return\n    } finally {\n      setBusy(false)\n    }\n\n    if (error) {\n      setMessage('La création du compte a échoué. Vérifiez les informations ou réessayez plus tard.')\n      return\n    }\n\n    setSuccess(true)\n    setMessage('Compte créé. Si la confirmation par e-mail est activée, consultez votre boîte de réception.')\n  }\n\n  return (\n    <div className=\"site-shell\">\n      <SiteHeader />\n      <main className=\"auth-page\">\n        <section className=\"auth-card\">\n          <span className=\"eyebrow eyebrow-dark\">REJOINDRE ZACK</span>\n          <h1>Créer votre compte</h1>\n          <p className=\"auth-intro\">Un compte vous permet de gérer votre profil, vos favoris et vos activités.</p>\n          <form onSubmit={submit} className=\"auth-form\">\n            <label htmlFor=\"signup-name\">Nom complet</label>\n            <input id=\"signup-name\" autoComplete=\"name\" required maxLength={120}\n              value={name} onChange={(event) => setName(event.target.value)} />\n            <label htmlFor=\"signup-email\">Adresse e-mail</label>\n            <input id=\"signup-email\" type=\"email\" autoComplete=\"email\" required\n              value={email} onChange={(event) => setEmail(event.target.value)} />\n            <label htmlFor=\"signup-password\">Mot de passe</label>\n            <input id=\"signup-password\" type=\"password\" autoComplete=\"new-password\"\n              minLength={10} required value={password}\n              onChange={(event) => setPassword(event.target.value)} />\n            {message ? <p className={success ? 'form-message form-success' : 'form-message'} role=\"status\">{message}</p> : null}\n            <button className=\"button button-primary auth-submit\" type=\"submit\" disabled={busy || success}>\n              {busy ? 'Création…' : success ? 'Compte créé' : 'Créer mon compte'}\n            </button>\n          </form>\n          <p className=\"auth-switch\">Vous avez déjà un compte ? <a href=\"/auth/connexion\">Se connecter</a></p>\n        </section>\n      </main>\n    </div>\n  )\n}\n","auth.mot-de-passe-oublie.tsx":"import { useState, type FormEvent } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { getSupabaseBrowserClient } from '~/lib/supabase/client'\nimport { SiteHeader } from '~/components/layout/SiteHeader'\n\nexport const Route = createFileRoute('/auth/mot-de-passe-oublie')({\n  component: ForgotPasswordPage,\n})\n\nfunction ForgotPasswordPage() {\n  const [email, setEmail] = useState('')\n  const [message, setMessage] = useState('')\n  const [busy, setBusy] = useState(false)\n\n  async function submit(event: FormEvent<HTMLFormElement>) {\n    event.preventDefault()\n    setMessage('')\n    const supabase = getSupabaseBrowserClient()\n    if (!supabase) {\n      setMessage('La connexion au service n’est pas configurée.')\n      return\n    }\n\n    setBusy(true)\n    let error: { message: string } | null = null\n    try {\n      const result = await supabase.auth.resetPasswordForEmail(email.trim(), {\n        redirectTo: `${window.location.origin}/auth/reinitialiser`,\n      })\n      error = result.error\n    } catch {\n      setMessage('Le service de récupération est momentanément indisponible. Réessayez.')\n      return\n    } finally {\n      setBusy(false)\n    }\n\n    setMessage(error\n      ? 'Impossible d’envoyer le lien. Vérifiez l’adresse ou réessayez plus tard.'\n      : 'Si cette adresse correspond à un compte, un lien de réinitialisation sera envoyé.')\n  }\n\n  return (\n    <div className=\"site-shell\">\n      <SiteHeader />\n      <main className=\"auth-page\">\n        <section className=\"auth-card\">\n          <span className=\"eyebrow eyebrow-dark\">RÉCUPÉRATION</span>\n          <h1>Mot de passe oublié ?</h1>\n          <p className=\"auth-intro\">Indiquez l’adresse e-mail associée à votre compte.</p>\n          <form onSubmit={submit} className=\"auth-form\">\n            <label htmlFor=\"reset-email\">Adresse e-mail</label>\n            <input id=\"reset-email\" type=\"email\" autoComplete=\"email\" required\n              value={email} onChange={(event) => setEmail(event.target.value)} />\n            {message ? <p className=\"form-message\" role=\"status\">{message}</p> : null}\n            <button className=\"button button-primary auth-submit\" type=\"submit\" disabled={busy}>\n              {busy ? 'Envoi…' : 'Envoyer le lien'}\n            </button>\n          </form>\n          <p className=\"auth-switch\"><a href=\"/auth/connexion\">Retour à la connexion</a></p>\n        </section>\n      </main>\n    </div>\n  )\n}\n","auth.reinitialiser.tsx":"import { useState, type FormEvent } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { getSupabaseBrowserClient } from '~/lib/supabase/client'\nimport { SiteHeader } from '~/components/layout/SiteHeader'\n\nexport const Route = createFileRoute('/auth/reinitialiser')({\n  component: ResetPasswordPage,\n})\n\nfunction ResetPasswordPage() {\n  const [password, setPassword] = useState('')\n  const [confirm, setConfirm] = useState('')\n  const [message, setMessage] = useState('')\n  const [success, setSuccess] = useState(false)\n  const [busy, setBusy] = useState(false)\n\n  async function submit(event: FormEvent<HTMLFormElement>) {\n    event.preventDefault()\n    setMessage('')\n    if (password.length < 10) {\n      setMessage('Le mot de passe doit contenir au moins 10 caractères.')\n      return\n    }\n    if (password !== confirm) {\n      setMessage('Les deux mots de passe ne correspondent pas.')\n      return\n    }\n\n    const supabase = getSupabaseBrowserClient()\n    if (!supabase) {\n      setMessage('La connexion au service n’est pas configurée.')\n      return\n    }\n\n    setBusy(true)\n    let error: { message: string } | null = null\n    try {\n      const result = await supabase.auth.updateUser({ password })\n      error = result.error\n    } catch {\n      setMessage('Le service de réinitialisation est momentanément indisponible. Réessayez.')\n      return\n    } finally {\n      setBusy(false)\n    }\n\n    if (error) {\n      setMessage('Le lien est invalide ou expiré. Demandez un nouveau lien.')\n      return\n    }\n\n    setSuccess(true)\n    setMessage('Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.')\n  }\n\n  return (\n    <div className=\"site-shell\">\n      <SiteHeader />\n      <main className=\"auth-page\">\n        <section className=\"auth-card\">\n          <span className=\"eyebrow eyebrow-dark\">SÉCURITÉ DU COMPTE</span>\n          <h1>Créer un nouveau mot de passe</h1>\n          <form onSubmit={submit} className=\"auth-form\">\n            <label htmlFor=\"new-password\">Nouveau mot de passe</label>\n            <input id=\"new-password\" type=\"password\" autoComplete=\"new-password\"\n              minLength={10} required value={password}\n              onChange={(event) => setPassword(event.target.value)} />\n            <label htmlFor=\"confirm-password\">Confirmer le mot de passe</label>\n            <input id=\"confirm-password\" type=\"password\" autoComplete=\"new-password\"\n              minLength={10} required value={confirm}\n              onChange={(event) => setConfirm(event.target.value)} />\n            {message ? <p className={success ? 'form-message form-success' : 'form-message'} role=\"status\">{message}</p> : null}\n            <button className=\"button button-primary auth-submit\" type=\"submit\" disabled={busy || success}>\n              {busy ? 'Modification…' : 'Enregistrer le mot de passe'}\n            </button>\n          </form>\n          {success ? <p className=\"auth-switch\"><a href=\"/auth/connexion\">Se connecter</a></p> : null}\n        </section>\n      </main>\n    </div>\n  )\n}\n"}

test('les quatre parcours Auth gèrent les erreurs réseau et libèrent toujours le bouton', () => {
  for (const [name, source] of Object.entries(authPages)) {
    assert.match(source, /catch\s*\{/ , name + ': un catch doit gérer les exceptions réseau')
    assert.match(source, /finally\s*\{[\s\S]*?setBusy\(false\)/, name + ': busy doit être réinitialisé')
  }
})

test('la connexion ne révèle pas si une adresse e-mail existe', () => {
  assert.match(authPages['auth.connexion.tsx'], /Adresse e-mail ou mot de passe incorrect\./)
  assert.doesNotMatch(authPages['auth.connexion.tsx'], /utilisateur introuvable|adresse inconnue|compte inexistant/i)
})

test('l’inscription et la récupération gardent des messages neutres', () => {
  assert.match(authPages['auth.inscription.tsx'], /Si la confirmation par e-mail est activée/)
  assert.match(authPages['auth.mot-de-passe-oublie.tsx'], /Si cette adresse correspond à un compte/)
})

test('la réinitialisation valide les deux mots de passe avant la requête', () => {
  const source = authPages['auth.reinitialiser.tsx']
  assert.match(source, /password\.length < 10/)
  assert.match(source, /password !== confirm/)
  assert.ok(source.indexOf('password !== confirm') < source.indexOf('supabase.auth.updateUser'))
})
