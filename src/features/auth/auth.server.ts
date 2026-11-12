import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServerClient } from '~/lib/supabase/server'

export const getCurrentAccount = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const supabase = createSupabaseServerClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return { user: null, profile: null, businesses: [] }
      }

      const [profileResult, membershipResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('business_members')
          .select(
            'business_id, role, businesses!business_members_business_id_fkey(name, slug, status)',
          )
          .eq('user_id', user.id),
      ])

      return {
        user: { id: user.id, email: user.email ?? null },
        profile: profileResult.data,
        businesses: membershipResult.data ?? [],
      }
    } catch {
      return { user: null, profile: null, businesses: [] }
    }
  },
)

const businessInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().trim().max(5000).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  neighborhood: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  whatsapp: z.string().trim().max(40).optional().default(''),
  email: z.string().trim().email().max(254).or(z.literal('')).optional().default(''),
})

export const createBusiness = createServerFn({ method: 'POST' })
  .validator(businessInput)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, message: 'Connectez-vous pour inscrire une entreprise.' }
    }

    const { data: businessId, error } = await supabase.rpc('create_business', {
      p_name: data.name,
      p_slug: data.slug,
      p_description: data.description || null,
      p_category: data.category || null,
      p_address: data.address || null,
      p_neighborhood: data.neighborhood || null,
      p_phone: data.phone || null,
      p_whatsapp: data.whatsapp || null,
      p_email: data.email || null,
    })

    if (error || !businessId) {
      console.error('Zack business creation failed.')
      return {
        success: false,
        message: error?.code === '23505'
          ? 'Ce nom d’adresse web est déjà utilisé. Essayez un autre nom.'
          : 'Impossible de créer cette fiche pour le moment. Vérifiez les informations et réessayez.',
      }
    }

    if (data.city) {
      const { error: cityError } = await supabase
        .from('businesses')
        .update({ city: data.city })
        .eq('id', businessId)
      if (cityError) {
        console.error('Zack business city update failed after creation.')
        return {
          success: true,
          businessId,
          message: 'Votre demande a été créée, mais la ville n’a pas pu être enregistrée. Elle pourra être complétée dans votre fiche.',
        }
      }
    }

    return {
      success: true,
      businessId,
      message: 'Votre demande a été envoyée. La fiche sera visible après vérification.',
    }
  })
