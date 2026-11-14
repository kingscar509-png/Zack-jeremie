import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getCurrentAccount, createBusiness } from '~/features/auth/auth.functions'
import { SiteHeader } from '~/components/layout/SiteHeader'
import { getSupabaseBrowserClient } from '~/lib/supabase/client'
import type { Database } from '~/types/database.types'

export const Route = createFileRoute('/pro')({
  loader: () => getCurrentAccount(),
  component: ProfessionalPage,
})

function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ProfessionalPage() {
  const account = Route.useLoaderData()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      const result = await createBusiness({
        data: {
          name,
          slug: makeSlug(name),
          category,
          description,
          address,
          neighborhood,
          city,
          phone,
          whatsapp,
          email,
        },
      })
      setMessage(result.message)
      if (result.success) {
        window.setTimeout(() => window.location.reload(), 1800)
      }
    } catch {
      setMessage('Une erreur temporaire a empêché l’envoi. Vos données n’ont pas forcément été enregistrées ; vérifiez la liste de vos entreprises avant de réessayer.')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    window.location.assign('/')
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="content-page">
        <div className="pro-heading">
          <div>
            <span className="eyebrow eyebrow-dark">ESPACE PROFESSIONNEL</span>
            <h1>Votre espace Zack</h1>
            <p className="muted">{account.user?.email ?? 'Compte non connecté'}</p>
          </div>
          {account.user ? <button className="button button-outline" type="button" onClick={signOut}>Déconnexion</button> : null}
        </div>

        {account.unavailable && !account.user ? (
          <section className="detail-panel">
            <p role="alert">Le service de compte est momentanément indisponible. Réessayez dans quelques instants.</p>
          </section>
        ) : !account.user ? (
          <section className="detail-panel">
            <h2>Connectez-vous pour continuer</h2>
            <p>Vous devez être connecté pour gérer une entreprise ou en inscrire une nouvelle.</p>
            <a className="button button-primary" href="/auth/connexion">Se connecter</a>
          </section>
        ) : (
          <>
            {account.unavailable ? <p className="form-message" role="status">Certaines données du compte n’ont pas pu être chargées. Vos informations de connexion restent reconnues ; réessayez pour actualiser les données.</p> : null}
            <section className="detail-panel">
              <h2>Mes entreprises</h2>
              {account.businesses.length ? (
                <div className="workspace-list">
                  {account.businesses.map((membership) => {
                    const business = Array.isArray(membership.businesses)
                      ? membership.businesses[0]
                      : membership.businesses
                    return (
                      <article className="workspace-item" key={membership.business_id}>
                        <div>
                          <strong>{business?.name ?? 'Entreprise'}</strong>
                          <p className="muted">Rôle : {membership.role} · Statut : {business?.status ?? 'inconnu'}</p>
                        </div>
                        <div className="workspace-actions">
                          {membership.role === 'owner' || membership.role === 'admin'
                            ? <a href="/abonnements">Gérer les abonnements</a>
                            : null}
                          {business?.slug ? <a href={`/entreprises/${business.slug}`}>Voir la fiche</a> : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="muted">{account.unavailable ? 'La liste des entreprises est momentanément indisponible.' : 'Vous ne gérez encore aucune entreprise avec ce compte.'}</p>
              )}
            </section>

            <section className="detail-panel">
              <h2>Catalogue de mes entreprises</h2>
              <p className="muted">Ajoutez et gérez les produits et services visibles sur vos fiches publiques. Les changements sont publiés directement, sans file de validation.</p>
              {account.businesses.map((membership) => {
                const business = Array.isArray(membership.businesses)
                  ? membership.businesses[0]
                  : membership.businesses
                if (!business) return null
                const canManage = ['owner', 'admin', 'editor'].includes(membership.role)
                return (
                  <div className="catalog-business" key={membership.business_id}>
                    <h3>{business.name}</h3>
                    <p className="muted">Rôle : {membership.role}</p>
                    <CatalogManager
                      businessId={membership.business_id}
                      businessName={business.name}
                      canManage={canManage}
                    />
                  </div>
                )
              })}
            </section>

            <section className="detail-panel">
              <h2>Inscrire une entreprise</h2>
              <p className="muted">La fiche sera créée avec le statut « en attente ». Elle ne sera pas visible publiquement avant vérification.</p>
              <form className="auth-form business-form" onSubmit={submit}>
                <label htmlFor="business-name">Nom de l’entreprise *</label>
                <input id="business-name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
                <label htmlFor="business-category">Catégorie</label>
                <input id="business-category" maxLength={100} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ex. : Restaurant, commerce, santé…" />
                <label htmlFor="business-description">Description</label>
                <textarea id="business-description" rows={4} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} />
                <label htmlFor="business-address">Adresse</label>
                <input id="business-address" maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} />
                <label htmlFor="business-city">Ville / commune</label>
                <input id="business-city" maxLength={120} value={city} onChange={(event) => setCity(event.target.value)} />
                <label htmlFor="business-neighborhood">Quartier / localité</label>
                <input id="business-neighborhood" maxLength={120} value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
                <div className="form-columns">
                  <div><label htmlFor="business-phone">Téléphone</label><input id="business-phone" type="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
                  <div><label htmlFor="business-whatsapp">WhatsApp</label><input id="business-whatsapp" type="tel" maxLength={40} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} /></div>
                </div>
                <label htmlFor="business-email">E-mail professionnel</label>
                <input id="business-email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
                {message ? <p className="form-message" role="status">{message}</p> : null}
                <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                  {busy ? 'Envoi…' : 'Envoyer ma demande'}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  )
}


type ProductRow = Database['public']['Tables']['products']['Row']
type ServiceRow = Database['public']['Tables']['services']['Row']
type CatalogRow = ProductRow | ServiceRow

function CatalogManager({
  businessId,
  businessName,
  canManage,
}: {
  businessId: string
  businessName: string
  canManage: boolean
}) {
  return (
    <div className="catalog-manager">
      <CatalogPanel businessId={businessId} businessName={businessName} kind="products" canManage={canManage} />
      <CatalogPanel businessId={businessId} businessName={businessName} kind="services" canManage={canManage} />
    </div>
  )
}

function CatalogPanel({
  businessId,
  businessName,
  kind,
  canManage,
}: {
  businessId: string
  businessName: string
  kind: 'products' | 'services'
  canManage: boolean
}) {
  const [items, setItems] = useState<CatalogRow[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const title = kind === 'products' ? 'Produits' : 'Services'
  const formPrefix = `${kind}-${businessId}`

  async function loadItems() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setMessage('Le catalogue est indisponible : configuration manquante.')
      setLoading(false)
      return
    }
    setLoading(true)
    if (kind === 'products') {
      const { data, error } = await supabase
        .from('products')
        .select('id, business_id, name, description, price, currency, image_url, is_available, created_at, updated_at, search_document')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      if (error) setMessage('Impossible de charger les produits. Vérifiez votre connexion puis réessayez.')
      else setItems(data ?? [])
    } else {
      const { data, error } = await supabase
        .from('services')
        .select('id, business_id, name, description, price, currency, image_url, duration, is_available, created_at, updated_at, search_document')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      if (error) setMessage('Impossible de charger les services. Vérifiez votre connexion puis réessayez.')
      else setItems(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    void loadItems()
  }, [businessId, kind])

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setImageUrl('')
    setDuration('')
    setIsAvailable(true)
    setEditingId(null)
  }

  function editItem(item: CatalogRow) {
    setEditingId(item.id)
    setName(item.name)
    setDescription(item.description ?? '')
    setPrice(item.price === null ? '' : String(item.price))
    setImageUrl(item.image_url ?? '')
    setDuration('duration' in item ? item.duration ?? '' : '')
    setIsAvailable(item.is_available)
    setMessage('')
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !canManage) return
    setBusy(true)
    setMessage('')
    const parsedPrice = price.trim() === '' ? null : Number(price)
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setMessage('Le prix doit être un nombre positif.')
      setBusy(false)
      return
    }

    let error: { message: string } | null = null
    if (kind === 'products') {
      const values = {
        business_id: businessId,
        name: name.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        currency: 'HTG',
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
      }
      const result = editingId
        ? await supabase.from('products').update(values).eq('id', editingId).eq('business_id', businessId)
        : await supabase.from('products').insert(values)
      error = result.error
    } else {
      const values = {
        business_id: businessId,
        name: name.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        currency: 'HTG',
        image_url: imageUrl.trim() || null,
        duration: duration.trim() || null,
        is_available: isAvailable,
      }
      const result = editingId
        ? await supabase.from('services').update(values).eq('id', editingId).eq('business_id', businessId)
        : await supabase.from('services').insert(values)
      error = result.error
    }

    if (error) {
      setMessage('Enregistrement impossible. Vérifiez vos droits et réessayez.')
    } else {
      setMessage(editingId ? 'Modification enregistrée.' : 'Élément ajouté au catalogue.')
      resetForm()
      await loadItems()
    }
    setBusy(false)
  }

  async function toggleAvailability(item: CatalogRow) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !canManage) return
    setBusy(true)
    const nextValue = !item.is_available
    const result = kind === 'products'
      ? await supabase.from('products').update({ is_available: nextValue }).eq('id', item.id).eq('business_id', businessId)
      : await supabase.from('services').update({ is_available: nextValue }).eq('id', item.id).eq('business_id', businessId)
    setMessage(result.error ? 'Impossible de modifier la disponibilité.' : nextValue ? 'Élément rendu visible.' : 'Élément masqué du public.')
    if (!result.error) await loadItems()
    setBusy(false)
  }

  async function deleteItem(item: CatalogRow) {
    if (!window.confirm(`Supprimer définitivement « ${item.name} » de ${businessName} ?`)) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase || !canManage) return
    setBusy(true)
    const result = kind === 'products'
      ? await supabase.from('products').delete().eq('id', item.id).eq('business_id', businessId)
      : await supabase.from('services').delete().eq('id', item.id).eq('business_id', businessId)
    setMessage(result.error ? 'Suppression impossible. Vérifiez vos droits et réessayez.' : 'Élément supprimé.')
    if (!result.error) {
      if (editingId === item.id) resetForm()
      await loadItems()
    }
    setBusy(false)
  }

  return (
    <section className="catalog-panel">
      <h4>{title}</h4>
      {loading ? <p className="muted">Chargement…</p> : items.length ? (
        <div className="workspace-list">
          {items.map((item) => (
            <article className="workspace-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                {item.description ? <p>{item.description}</p> : null}
                {'duration' in item && item.duration ? <p className="muted">Durée : {item.duration}</p> : null}
                <p className="muted">
                  {item.price === null ? 'Prix sur demande' : `${item.price.toLocaleString('fr-HT')} ${item.currency}`}
                  {' · '}
                  {item.is_available ? 'Visible' : 'Masqué'}
                </p>
              </div>
              {canManage ? (
                <div className="workspace-actions">
                  <button className="button button-outline" type="button" disabled={busy} onClick={() => editItem(item)}>Modifier</button>
                  <button className="button button-outline" type="button" disabled={busy} onClick={() => void toggleAvailability(item)}>{item.is_available ? 'Masquer' : 'Rendre visible'}</button>
                  <button className="button button-outline" type="button" disabled={busy} onClick={() => void deleteItem(item)}>Supprimer</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">{kind === 'products' ? 'Aucun produit enregistré.' : 'Aucun service enregistré.'}</p>
      )}

      {canManage ? (
        <form className="auth-form business-form catalog-form" onSubmit={saveItem}>
          <h5>{editingId ? `Modifier ${kind === 'products' ? 'le produit' : 'le service'}` : `Ajouter ${kind === 'products' ? 'un produit' : 'un service'}`}</h5>
          <label htmlFor={`${formPrefix}-name`}>Nom *</label>
          <input id={`${formPrefix}-name`} required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
          <label htmlFor={`${formPrefix}-description`}>Description</label>
          <textarea id={`${formPrefix}-description`} rows={3} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
          <label htmlFor={`${formPrefix}-price`}>Prix en gourdes (HTG)</label>
          <input id={`${formPrefix}-price`} type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Laisser vide si le prix est sur demande" />
          <label htmlFor={`${formPrefix}-image`}>Lien de l’image (facultatif)</label>
          <input id={`${formPrefix}-image`} type="url" maxLength={2000} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…" />
          {kind === 'services' ? (
            <>
              <label htmlFor={`${formPrefix}-duration`}>Durée (facultatif)</label>
              <input id={`${formPrefix}-duration`} maxLength={100} value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Ex. : 1 heure" />
            </>
          ) : null}
          <label className="catalog-availability">
            <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />
            Afficher cet élément sur la fiche publique
          </label>
          {message ? <p className="form-message" role="status">{message}</p> : null}
          <div className="workspace-actions">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}</button>
            {editingId ? <button className="button button-outline" type="button" disabled={busy} onClick={resetForm}>Annuler</button> : null}
          </div>
        </form>
      ) : (
        <p className="muted">Votre rôle permet la consultation, mais pas la modification du catalogue.</p>
      )}
      {message && !canManage ? <p className="form-message" role="status">{message}</p> : null}
    </section>
  )
}
