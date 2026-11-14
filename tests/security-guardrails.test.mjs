import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const subscriptionsPage = readFileSync(
  new URL('../src/routes/abonnements.tsx', import.meta.url),
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

test('la gestion du catalogue est limitée aux rôles autorisés et à leur entreprise', () => {
  assert.match(professionalPage, /\['owner', 'admin', 'editor'\]\.includes\(membership\.role\)/)
  assert.match(professionalPage, /\.eq\('business_id', businessId\)/)
  assert.match(professionalPage, /\.from\('products'\)\.insert\(values\)/)
  assert.match(professionalPage, /\.from\('services'\)\.insert\(values\)/)
  assert.match(professionalPage, /\.from\('products'\)\.delete\(\)/)
  assert.match(professionalPage, /\.from\('services'\)\.delete\(\)/)
})

test('le catalogue permet de masquer un élément sans modération préalable', () => {
  assert.match(professionalPage, /is_available: isAvailable/)
  assert.match(professionalPage, /Rendre visible/)
  assert.match(professionalPage, /sans file de validation/)
  assert.doesNotMatch(professionalPage, /moderation_queue|approval_required|pending_approval/)
})
