import { createServerFn } from '@tanstack/react-start'
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

export const searchBusinesses = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
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

      const term = query.trim()
      if (term) {
        request = request.textSearch('search_document', term, {
          type: 'websearch',
          config: 'simple',
        })
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
  .validator((slug: string) => slug)
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
        return { business: null, unavailable: true }
      }

      return { business: data, unavailable: false }
    } catch {
      console.error('Zack business detail is unavailable.')
      return { business: null, unavailable: true }
    }
  })
