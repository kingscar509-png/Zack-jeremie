import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServerClient } from '~/lib/supabase/server'

export const getHomeData = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const supabase = createSupabaseServerClient()
      const [categoriesResult, businessesResult] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, icon')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('businesses')
          .select(
            'id, name, slug, category, city, neighborhood, logo_url, description',
          )
          .eq('status', 'verified')
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      if (categoriesResult.error || businessesResult.error) {
        console.error('Zack home data query failed.')
        return {
          categories: [],
          businesses: [],
          unavailable: true,
        }
      }

      return {
        categories: categoriesResult.data ?? [],
        businesses: businessesResult.data ?? [],
        unavailable: false,
      }
    } catch {
      console.error('Zack home data is unavailable.')
      return {
        categories: [],
        businesses: [],
        unavailable: true,
      }
    }
  },
)

const businessSearchInput = z.object({
  query: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
})

export const searchBusinesses = createServerFn({ method: 'GET' })
  .validator(businessSearchInput)
  .handler(async ({ data: filters }) => {
    try {
      const supabase = createSupabaseServerClient()
      let request = supabase
        .from('businesses')
        .select(
          'id, name, slug, category, city, neighborhood, logo_url, description',
        )
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(40)

      if (filters.query) {
        request = request.textSearch('search_document', filters.query, {
          type: 'websearch',
          config: 'simple',
        })
      }
      if (filters.city) {
        request = request.ilike('city', `%${filters.city}%`)
      }
      if (filters.category) {
        request = request.ilike('category', `%${filters.category}%`)
      }

      const { data, error } = await request
      if (error) {
        console.error('Zack business search query failed.')
        return { businesses: [], unavailable: true }
      }

      return { businesses: data ?? [], unavailable: false }
    } catch {
      console.error('Zack business search is unavailable.')
      return { businesses: [], unavailable: true }
    }
  })

export const getBusinessBySlug = createServerFn({ method: 'GET' })
  .validator(z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  .handler(async ({ data: slug }) => {
    try {
      const supabase = createSupabaseServerClient()
      const { data, error } = await supabase
        .from('businesses')
        .select(
          'id, name, slug, description, category, logo_url, cover_url, address, street, neighborhood, city, phone, whatsapp, email, website, facebook_url, instagram_url, tiktok_url, youtube_url, founded_year, price_range, status',
        )
        .eq('slug', slug)
        .eq('status', 'verified')
        .maybeSingle()

      if (error) {
        console.error('Zack business detail query failed.')
        return {
          business: null,
          products: [],
          services: [],
          catalogUnavailable: false,
          unavailable: true,
        }
      }

      if (!data) {
        return {
          business: null,
          products: [],
          services: [],
          catalogUnavailable: false,
          unavailable: false,
        }
      }

      const [productsResult, servicesResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, description, price, currency, image_url')
          .eq('business_id', data.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('id, name, description, price, currency, image_url, duration')
          .eq('business_id', data.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
      ])

      const catalogUnavailable = Boolean(productsResult.error || servicesResult.error)
      if (catalogUnavailable) {
        console.error('Zack business catalog query failed.')
      }

      return {
        business: data,
        products: productsResult.data ?? [],
        services: servicesResult.data ?? [],
        catalogUnavailable,
        unavailable: false,
      }
    } catch {
      console.error('Zack business detail is unavailable.')
      return {
        business: null,
        products: [],
        services: [],
        catalogUnavailable: false,
        unavailable: true,
      }
    }
  })
