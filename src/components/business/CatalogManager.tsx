import { useEffect, useState, type FormEvent } from 'react'
import { getBusinessCatalog, saveCatalogItem } from '~/features/auth/catalog.functions'

type CatalogKind = 'product' | 'service'
type CatalogItem = {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  image_url: string | null
  is_available: boolean
  duration?: string | null
}

type Props = {
  businessId: string
  role: string
}

export function CatalogManager({ businessId, role }: Props) {
  const canManage = ['owner', 'admin', 'editor'].includes(role)
  const [kind, setKind] = useState<CatalogKind>('product')
  const [products, setProducts] = useState<CatalogItem[]>([])
  const [services, setServices] = useState<CatalogItem[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'HTG' | 'USD'>('HTG')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function refresh(clearMessage = false) {
    setLoading(true)
    try {
      const result = await getBusinessCatalog({ data: { businessId } })
      if (result.success) {
        setProducts(result.products as CatalogItem[])
        setServices(result.services as CatalogItem[])
        if (clearMessage) setMessage('')
      } else {
        setMessage(result.message)
      }
    } catch {
      setMessage('Le catalogue ne peut pas être chargé pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh(true)
  }, [businessId])

  const items = kind === 'product' ? products : services

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setCurrency('HTG')
    setImageUrl('')
    setDuration('')
    setIsAvailable(true)
    setEditingId(null)
  }

  function editItem(item: CatalogItem) {
    setName(item.name)
    setDescription(item.description ?? '')
    setPrice(item.price === null ? '' : String(item.price))
    setCurrency(item.currency === 'USD' ? 'USD' : 'HTG')
    setImageUrl(item.image_url ?? '')
    setDuration(item.duration ?? '')
    setIsAvailable(item.is_available)
    setEditingId(item.id)
    setMessage('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return
    setBusy(true)
    setMessage('')
    try {
      const result = await saveCatalogItem({
        data: {
          businessId,
          kind,
          action: editingId ? 'update' : 'create',
          ...(editingId ? { itemId: editingId } : {}),
          name,
          description,
          price: price.trim() === '' ? null : Number(price),
          currency,
          imageUrl,
          duration,
          isAvailable,
        },
      })
      setMessage(result.message)
      if (result.success) {
        resetForm()
        await refresh()
      }
    } catch {
      setMessage('Une erreur temporaire a empêché l’enregistrement. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  async function removeItem(item: CatalogItem) {
    if (!canManage || !window.confirm(`Supprimer « ${item.name} » ?`)) return
    setBusy(true)
    setMessage('')
    try {
      const result = await saveCatalogItem({
        data: { businessId, kind, action: 'delete', itemId: item.id },
      })
      setMessage(result.message)
      if (result.success) {
        if (editingId === item.id) resetForm()
        await refresh()
      }
    } catch {
      setMessage('Impossible de supprimer cet élément pour le moment.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleAvailability(item: CatalogItem) {
    setBusy(true)
    setMessage('')
    try {
      const result = await saveCatalogItem({
        data: {
          businessId,
          kind,
          action: 'update',
          itemId: item.id,
          name: item.name,
          description: item.description ?? '',
          price: item.price,
          currency: item.currency === 'USD' ? 'USD' : 'HTG',
          imageUrl: item.image_url ?? '',
          duration: item.duration ?? '',
          isAvailable: !item.is_available,
        },
      })
      setMessage(result.message)
      if (result.success) await refresh()
    } catch {
      setMessage('Impossible de modifier la disponibilité pour le moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="catalog-manager">
      <div className="catalog-manager-heading">
        <div>
          <h3>Catalogue de l’entreprise</h3>
          <p className="muted">Ajoutez et gérez les produits et services visibles sur votre fiche publique.</p>
        </div>
        <div className="catalog-tabs" role="group" aria-label="Type de catalogue">
          <button type="button" className={kind === 'product' ? 'button button-primary' : 'button button-outline'} onClick={() => { setKind('product'); resetForm() }} disabled={busy}>Produits</button>
          <button type="button" className={kind === 'service' ? 'button button-primary' : 'button button-outline'} onClick={() => { setKind('service'); resetForm() }} disabled={busy}>Services</button>
        </div>
      </div>

      {canManage ? (
        <form className="auth-form catalog-form" onSubmit={submit}>
          <h4>{editingId ? 'Modifier un élément' : kind === 'product' ? 'Ajouter un produit' : 'Ajouter un service'}</h4>
          <label htmlFor={`catalog-name-${businessId}`}>Nom *</label>
          <input id={`catalog-name-${businessId}`} required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
          <label htmlFor={`catalog-description-${businessId}`}>Description</label>
          <textarea id={`catalog-description-${businessId}`} rows={3} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} />
          <div className="form-columns">
            <div>
              <label htmlFor={`catalog-price-${businessId}`}>Prix (laisser vide si sur demande)</label>
              <input id={`catalog-price-${businessId}`} type="number" min="0" max="100000000" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
            </div>
            <div>
              <label htmlFor={`catalog-currency-${businessId}`}>Devise</label>
              <select id={`catalog-currency-${businessId}`} value={currency} onChange={(event) => setCurrency(event.target.value as 'HTG' | 'USD')}>
                <option value="HTG">Gourdes (HTG)</option>
                <option value="USD">Dollars US (USD)</option>
              </select>
            </div>
          </div>
          <label htmlFor={`catalog-image-${businessId}`}>Lien de l’image (HTTPS)</label>
          <input id={`catalog-image-${businessId}`} type="url" maxLength={500} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…" />
          {kind === 'service' ? (
            <>
              <label htmlFor={`catalog-duration-${businessId}`}>Durée ou délai</label>
              <input id={`catalog-duration-${businessId}`} maxLength={100} value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Ex. : 1 heure, 3 jours…" />
            </>
          ) : null}
          <label className="catalog-availability">
            <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />
            Disponible sur la fiche publique
          </label>
          {message ? <p className="form-message" role="status">{message}</p> : null}
          <div className="workspace-actions">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : editingId ? 'Enregistrer les changements' : 'Ajouter au catalogue'}</button>
            {editingId ? <button className="button button-outline" type="button" onClick={resetForm} disabled={busy}>Annuler</button> : null}
          </div>
        </form>
      ) : (
        <p className="muted">Votre rôle permet de consulter le catalogue, mais pas de le modifier.</p>
      )}

      <div className="catalog-items">
        <h4>{kind === 'product' ? 'Produits enregistrés' : 'Services enregistrés'}</h4>
        {loading ? <p className="muted">Chargement du catalogue…</p> : items.length ? (
          <div className="workspace-list">
            {items.map((item) => (
              <article className="workspace-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">{item.price === null ? 'Prix sur demande' : `${item.price.toLocaleString('fr-HT')} ${item.currency}`} · {item.is_available ? 'Disponible' : 'Indisponible'}</p>
                  {item.description ? <p>{item.description}</p> : null}
                  {kind === 'service' && item.duration ? <p className="muted">Durée : {item.duration}</p> : null}
                </div>
                {canManage ? (
                  <div className="workspace-actions">
                    <button className="button button-outline" type="button" onClick={() => editItem(item)} disabled={busy}>Modifier</button>
                    <button className="button button-outline" type="button" onClick={() => void toggleAvailability(item)} disabled={busy}>{item.is_available ? 'Désactiver' : 'Activer'}</button>
                    <button className="button button-outline" type="button" onClick={() => void removeItem(item)} disabled={busy}>Supprimer</button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-note">{kind === 'product' ? 'Aucun produit enregistré.' : 'Aucun service enregistré.'}</p>
        )}
      </div>
    </section>
  )
}
