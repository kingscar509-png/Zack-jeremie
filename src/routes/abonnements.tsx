import { createServerFn } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { createSupabaseServerClient } from '~/lib/supabase/server'

type BusinessSummary = {
  id: string
  name: string
  status: string
  role: string
}

export const getSubscriptionOverview = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const supabase = createSupabaseServerClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        return { user: null, businesses: [], plans: [], subscriptions: [], payments: [], unavailable: true }
      }
      if (!user) {
        return { user: null, businesses: [], plans: [], subscriptions: [], payments: [], unavailable: false }
      }

      const { data: membershipRows, error: membershipError } = await supabase
        .from('business_members')
        .select('business_id, role, businesses!business_members_business_id_fkey(name, status)')
        .eq('user_id', user.id)

      if (membershipError) {
        return { user: { id: user.id }, businesses: [], plans: [], subscriptions: [], payments: [], unavailable: true }
      }

      const businesses: BusinessSummary[] = (membershipRows ?? [])
        .filter((membership) => membership.role === 'owner' || membership.role === 'admin')
        .map((membership) => {
          const business = Array.isArray(membership.businesses)
            ? membership.businesses[0]
            : membership.businesses
          return {
            id: membership.business_id,
            name: business?.name ?? 'Entreprise',
            status: business?.status ?? 'unknown',
            role: membership.role,
          }
        })

      if (businesses.length === 0) {
        return { user: { id: user.id }, businesses, plans: [], subscriptions: [], payments: [], unavailable: false }
      }

      const businessIds = businesses.map((business) => business.id)
      const [plansResult, subscriptionsResult, paymentsResult] = await Promise.all([
        supabase
          .from('subscription_plans')
          .select('id, code, name, price_htg, duration_days, max_products, max_images_per_item, features')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('business_subscriptions')
          .select('id, business_id, plan_id, status, starts_at, ends_at, created_at, subscription_plans!business_subscriptions_plan_id_fkey(name, code, price_htg, duration_days)')
          .in('business_id', businessIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('id, business_id, subscription_id, provider, amount, currency, status, proof_reference, created_at, confirmed_at')
          .in('business_id', businessIds)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (plansResult.error || subscriptionsResult.error || paymentsResult.error) {
        return { user: { id: user.id }, businesses, plans: [], subscriptions: [], payments: [], unavailable: true }
      }

      return {
        user: { id: user.id },
        businesses,
        plans: plansResult.data ?? [],
        subscriptions: subscriptionsResult.data ?? [],
        payments: paymentsResult.data ?? [],
        unavailable: false,
      }
    } catch {
      return { user: null, businesses: [], plans: [], subscriptions: [], payments: [], unavailable: true }
    }
  },
)

export const Route = createFileRoute('/abonnements')({
  loader: () => getSubscriptionOverview(),
  component: SubscriptionPage,
})

function formatDate(value: string | null) {
  if (!value) return 'Non définie'
  return new Intl.DateTimeFormat('fr-HT', {
    dateStyle: 'medium',
    timeZone: 'America/Port-au-Prince',
  }).format(new Date(value))
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-HT', {
    style: 'currency',
    currency: currency === 'HTG' ? 'HTG' : currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function SubscriptionPage() {
  const data = Route.useLoaderData()

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <div className="pro-heading">
          <div>
            <span className="eyebrow eyebrow-dark">ESPACE PROFESSIONNEL</span>
            <h1>Abonnements Zack</h1>
            <p className="muted">Consultez les offres et l’historique des abonnements de vos entreprises.</p>
          </div>
          <a className="button button-outline" href="/pro">Retour à mon espace</a>
        </div>

        {data.unavailable ? (
          <section className="detail-panel">
            <p role="alert">Les informations d’abonnement sont momentanément indisponibles. Aucun paiement ne doit être envoyé pendant cette indisponibilité.</p>
          </section>
        ) : !data.user ? (
          <section className="detail-panel">
            <h2>Connectez-vous pour continuer</h2>
            <p>La consultation des abonnements nécessite une session active.</p>
            <a className="button button-primary" href="/auth/connexion">Se connecter</a>
          </section>
        ) : data.businesses.length === 0 ? (
          <section className="detail-panel">
            <h2>Aucune entreprise gérée</h2>
            <p>Seuls les propriétaires et administrateurs peuvent consulter les abonnements et paiements d’une entreprise.</p>
            <a className="button button-primary" href="/pro">Inscrire ou consulter une entreprise</a>
          </section>
        ) : (
          <>
            <section className="detail-panel">
              <h2>État du paiement en ligne</h2>
              <p role="status">
                Les paiements d’abonnement ne sont pas encore ouverts. {data.plans.length > 0 && data.plans.every((plan) => plan.price_htg === 0) ? 'Seul le forfait Gratuit est actuellement disponible.' : 'Les offres affichées sont consultables, mais aucun paiement ne peut encore être envoyé.'}
                Le destinataire MonCash et le formulaire de paiement ne seront consultés qu’une fois le parcours sécurisé prêt.
              </p>
              <p className="muted">N’envoyez pas d’argent et ne communiquez aucun PIN ou code OTP à Zack. Cette page ne collecte aucune donnée bancaire.</p>
            </section>

            <section className="detail-panel">
              <h2>Mes entreprises</h2>
              <div className="workspace-list">
                {data.businesses.map((business) => (
                  <article className="workspace-item" key={business.id}>
                    <div>
                      <strong>{business.name}</strong>
                      <p className="muted">Rôle : {business.role} · Vérification : {business.status}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-panel">
              <h2>Offres disponibles</h2>
              {data.plans.length === 0 ? (
                <p className="muted">Aucune offre active n’est disponible pour le moment.</p>
              ) : (
                <div className="workspace-list">
                  {data.plans.map((plan) => (
                    <article className="workspace-item" key={plan.id}>
                      <div>
                        <strong>{plan.name}</strong>
                        <p>{plan.price_htg === 0 ? 'Gratuit' : formatAmount(plan.price_htg, 'HTG')} · {plan.duration_days} jours</p>
                        <p className="muted">
                          {plan.max_products === null ? 'Produits sans limite configurée' : `${plan.max_products} produits maximum`}
                          {' · '}{plan.max_images_per_item} image(s) par produit
                        </p>
                      </div>
                      <span className="muted">{plan.code}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="detail-panel">
              <h2>Historique des abonnements</h2>
              {data.subscriptions.length === 0 ? (
                <p className="muted">Aucun abonnement n’a encore été enregistré pour vos entreprises.</p>
              ) : (
                <div className="workspace-list">
                  {data.subscriptions.map((subscription) => {
                    const plan = Array.isArray(subscription.subscription_plans)
                      ? subscription.subscription_plans[0]
                      : subscription.subscription_plans
                    const business = data.businesses.find((item) => item.id === subscription.business_id)
                    return (
                      <article className="workspace-item" key={subscription.id}>
                        <div>
                          <strong>{business?.name ?? 'Entreprise'} · {plan?.name ?? 'Forfait'}</strong>
                          <p className="muted">Statut : {subscription.status} · Du {formatDate(subscription.starts_at)} au {formatDate(subscription.ends_at)}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="detail-panel">
              <h2>Historique des paiements</h2>
              {data.payments.length === 0 ? (
                <p className="muted">Aucun paiement n’a été enregistré.</p>
              ) : (
                <div className="workspace-list">
                  {data.payments.map((payment) => {
                    const business = data.businesses.find((item) => item.id === payment.business_id)
                    return (
                      <article className="workspace-item" key={payment.id}>
                        <div>
                          <strong>{business?.name ?? 'Entreprise'} · {formatAmount(payment.amount, payment.currency)}</strong>
                          <p className="muted">Fournisseur : {payment.provider} · Statut : {payment.status} · {formatDate(payment.created_at)}</p>
                          {payment.proof_reference ? <p className="muted">Référence : {payment.proof_reference}</p> : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
