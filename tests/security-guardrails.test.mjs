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


const authPages = Object.fromEntries(
  ['auth.connexion.tsx', 'auth.inscription.tsx', 'auth.mot-de-passe-oublie.tsx', 'auth.reinitialiser.tsx']
    .map((name) => [
      name,
      readFileSync(new URL('../src/routes/' + name, import.meta.url), 'utf8'),
    ]),
)

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
