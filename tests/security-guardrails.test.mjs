import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const subscriptionsPage = readFileSync(
  new URL('../src/routes/abonnements.tsx', import.meta.url),
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
