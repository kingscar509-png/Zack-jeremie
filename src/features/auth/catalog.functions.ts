import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServerClient } from '~/lib/supabase/server'

const catalogLookup = z.object({
  businessId: z.string().uuid(),
})

export const getBusinessCatalog = createServerFn({ method: 'GET' })
  .validator(catalogLookup)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false as const, message: 'Connectez-vous pour consulter ce catalogue.', products: [], services: [] }
    }

    const { data: membership, error: membershipError } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', data.businessId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError || !membership) {
      return { success: false as const, message: 'Vous ne disposez pas d’un accès à cette entreprise.', products: [], services: [] }
    }

    const [productsResult, servicesResult] = await Promise.all([
      supabase.from('products')
        .select('id, name, description, price, currency, image_url, is_available')
        .eq('business_id', data.businessId)
        .order('created_at', { ascending: false }),
      supabase.from('services')
        .select('id, name, description, price, currency, image_url, duration, is_available')
        .eq('business_id', data.businessId)
        .order('created_at', { ascending: false }),
    ])

    if (productsResult.error || servicesResult.error) {
      console.error('Zack private catalog retrieval failed.')
      return { success: false as const, message: 'Le catalogue ne peut pas être chargé pour le moment.', products: [], services: [] }
    }

    return {
      success: true as const,
      message: '',
      products: productsResult.data ?? [],
      services: servicesResult.data ?? [],
    }
  })

const catalogMutation = z.object({
  businessId: z.string().uuid(),
  kind: z.enum(['product', 'service']),
  action: z.enum(['create', 'update', 'delete']),
  itemId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional().default(''),
  price: z.number().finite().nonnegative().max(100000000).nullable().optional(),
  currency: z.enum(['HTG', 'USD']).optional().default('HTG'),
  imageUrl: z.string().trim().max(500).url().or(z.literal('')).optional().default(''),
  duration: z.string().trim().max(100).optional().default(''),
  isAvailable: z.boolean().optional().default(true),
})

export const saveCatalogItem = createServerFn({ method: 'POST' })
  .validator(catalogMutation)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, message: 'Connectez-vous pour gérer ce catalogue.' }
    }

    const { data: membership, error: membershipError } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', data.businessId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError || !membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
      return { success: false, message: 'Votre rôle ne permet pas de modifier ce catalogue.' }
    }

    if (data.action !== 'delete' && !data.name) {
      return { success: false, message: 'Le nom doit contenir au moins 2 caractères.' }
    }
    if (data.action !== 'create' && !data.itemId) {
      return { success: false, message: 'Élément introuvable.' }
    }

    const common = {
      name: data.name ?? '',
      description: data.description ?? '',
      price: data.price ?? null,
      currency: data.currency ?? 'HTG',
      image_url: data.imageUrl || null,
      is_available: data.isAvailable,
      updated_at: new Date().toISOString(),
    }

    if (data.kind === 'product') {
      const result = data.action === 'create'
        ? await supabase.from('products').insert({ business_id: data.businessId, ...common })
        : data.action === 'update'
          ? await supabase.from('products').update(common).eq('id', data.itemId!).eq('business_id', data.businessId)
          : await supabase.from('products').delete().eq('id', data.itemId!).eq('business_id', data.businessId)
      if (result.error) {
        console.error('Zack product catalog mutation failed.')
        return { success: false, message: 'Impossible d’enregistrer ce produit. Vérifiez les informations puis réessayez.' }
      }
    } else {
      const serviceData = { ...common, duration: data.duration ?? '' }
      const result = data.action === 'create'
        ? await supabase.from('services').insert({ business_id: data.businessId, ...serviceData })
        : data.action === 'update'
          ? await supabase.from('services').update(serviceData).eq('id', data.itemId!).eq('business_id', data.businessId)
          : await supabase.from('services').delete().eq('id', data.itemId!).eq('business_id', data.businessId)
      if (result.error) {
        console.error('Zack service catalog mutation failed.')
        return { success: false, message: 'Impossible d’enregistrer ce service. Vérifiez les informations puis réessayez.' }
      }
    }

    return { success: true, message: data.action === 'delete' ? 'Élément supprimé.' : 'Catalogue mis à jour.' }
  })
