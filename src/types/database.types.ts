export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: number
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          permissions: string[]
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          permissions?: string[]
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          permissions?: string[]
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      business_delivery_zones: {
        Row: {
          business_id: string
          created_at: string
          currency: string
          fee: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          business_id: string
          created_at?: string
          currency?: string
          fee: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          business_id?: string
          created_at?: string
          currency?: string
          fee?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_delivery_zones_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_delivery_zones_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_events: {
        Row: {
          archived_at: string | null
          business_id: string
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          image_url: string | null
          is_published: boolean
          location: string | null
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          business_id: string
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          business_id?: string
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_favorites: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_follows: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_follows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_follows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          closing_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          opening_time: string | null
        }
        Insert: {
          business_id: string
          closing_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          opening_time?: string | null
        }
        Update: {
          business_id?: string
          closing_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          opening_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_interactions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          interaction_type: string
          target_id: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          interaction_type: string
          target_id?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          target_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_media: {
        Row: {
          business_id: string
          caption: string | null
          created_at: string | null
          display_order: number
          id: string
          media_type: string
          media_url: string
        }
        Insert: {
          business_id: string
          caption?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          media_type: string
          media_url: string
        }
        Update: {
          business_id?: string
          caption?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          media_type?: string
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string | null
          permissions: string[]
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          permissions?: string[]
          role?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          permissions?: string[]
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_stats_events: {
        Row: {
          business_id: string
          created_at: string
          event_type: string
          id: number
          product_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          event_type: string
          id?: never
          product_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          event_type?: string
          id?: never
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_stats_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_stats_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_stats_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          plan_id: string
          starts_at: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          plan_id: string
          starts_at?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string
          starts_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string | null
          category_id: string | null
          city: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          founded_year: number | null
          geo_id: string | null
          id: string
          instagram_url: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          neighborhood: string | null
          phone: string | null
          price_range: string | null
          search_document: unknown
          slug: string
          status: string
          street: string | null
          tiktok_url: string | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          category_id?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          founded_year?: number | null
          geo_id?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          price_range?: string | null
          search_document?: unknown
          slug: string
          status?: string
          street?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          category_id?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          founded_year?: number | null
          geo_id?: string | null
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          price_range?: string | null
          search_document?: unknown
          slug?: string
          status?: string
          street?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_geo_id_fkey"
            columns: ["geo_id"]
            isOneToOne: false
            referencedRelation: "geo_units"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          name: string
          name_ht: string | null
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          name_ht?: string | null
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ht?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "contact_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string
          id: string
          last_message_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id: string
          id?: string
          last_message_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          last_message_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          user_id: string | null
          vehicle: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          user_id?: string | null
          vehicle?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          user_id?: string | null
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couriers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "couriers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_units: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_official: boolean
          level: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_official?: boolean
          level: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_official?: boolean
          level?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_units_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geo_units"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          account_activity: boolean
          business_updates: boolean
          email: boolean
          in_app: boolean
          promotions: boolean
          push: boolean
          review_activity: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_activity?: boolean
          business_updates?: boolean
          email?: boolean
          in_app?: boolean
          promotions?: boolean
          push?: boolean
          review_activity?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_activity?: boolean
          business_updates?: boolean
          email?: boolean
          in_app?: boolean
          promotions?: boolean
          push?: boolean
          review_activity?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          business_id: string | null
          created_at: string
          dedupe_key: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          reject_reason: string | null
          status: string
          unit_price: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          reject_reason?: string | null
          status?: string
          unit_price: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          reject_reason?: string | null
          status?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          checkout_id: string
          contact_phone: string
          courier_id: string | null
          created_at: string
          currency: string
          customer_id: string
          customer_note: string | null
          delivery_address: string | null
          delivery_fee: number
          delivery_zone_id: string | null
          fulfillment: string
          id: string
          order_number: string
          payment_method: string
          payment_status: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          business_id: string
          checkout_id: string
          contact_phone: string
          courier_id?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          customer_note?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          delivery_zone_id?: string | null
          fulfillment: string
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          checkout_id?: string
          contact_phone?: string
          courier_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          customer_note?: string | null
          delivery_address?: string | null
          delivery_fee?: number
          delivery_zone_id?: string | null
          fulfillment?: string
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "business_delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          payload: Json
          payment_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          payload?: Json
          payment_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          payload?: Json
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_recipients: {
        Row: {
          account_number: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          provider: string
        }
        Insert: {
          account_number: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          provider: string
        }
        Update: {
          account_number?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          provider?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          business_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          kind: string
          proof_reference: string | null
          provider: string
          provider_transaction_id: string | null
          review_note: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          business_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kind?: string
          proof_reference?: string | null
          provider: string
          provider_transaction_id?: string | null
          review_note?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          kind?: string
          proof_reference?: string | null
          provider?: string
          provider_transaction_id?: string | null
          review_note?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "business_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          archived_at: string | null
          business_id: string
          content: string
          created_at: string | null
          expire_action: string
          expires_at: string | null
          id: string
          is_published: boolean
          media_type: string | null
          media_url: string | null
          post_type: string
          published_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          business_id: string
          content: string
          created_at?: string | null
          expire_action?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          business_id?: string
          content?: string
          created_at?: string | null
          expire_action?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          business_id: string
          category_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          business_id: string
          category_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          business_id?: string
          category_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "product_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          business_id: string
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
          storage_path: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
          storage_path?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "product_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number | null
          search_document: unknown
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price?: number | null
          search_document?: unknown
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number | null
          search_document?: unknown
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          archived_at: string | null
          business_id: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_at: string | null
          expire_action: string
          id: string
          image_url: string | null
          is_active: boolean
          start_at: string
          title: string
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          business_id: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_at?: string | null
          expire_action?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_at?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          business_id?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_at?: string | null
          expire_action?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_at?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "promotions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          business_id: string
          created_at: string
          details: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          reason: string
          reporter_id: string | null
          status: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          business_id: string
          created_at?: string
          details?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          status?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          business_id?: string
          created_at?: string
          details?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          content: string
          created_at: string
          id: string
          owner_responded_at: string | null
          owner_response: string | null
          rating: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          id?: string
          owner_responded_at?: string | null
          owner_response?: string | null
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          id?: string
          owner_responded_at?: string | null
          owner_response?: string | null
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          currency: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number | null
          search_document: unknown
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          currency?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price?: number | null
          search_document?: unknown
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number | null
          search_document?: unknown
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_rating_summary"
            referencedColumns: ["business_id"]
          },
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          display_order: number
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          max_images_per_item: number
          max_products: number | null
          name: string
          price_htg: number
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_images_per_item?: number
          max_products?: number | null
          name: string
          price_htg?: number
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_images_per_item?: number
          max_products?: number | null
          name?: string
          price_htg?: number
        }
        Relationships: []
      }
    }
    Views: {
      business_rating_summary: {
        Row: {
          average_rating: number | null
          business_id: string | null
          ranking_score: number | null
          review_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _order_notify: {
        Args: {
          p_business: string
          p_msg: string
          p_order: string
          p_title: string
          p_type: string
          p_user: string
        }
        Returns: undefined
      }
      _order_recalc: { Args: { p_order: string }; Returns: undefined }
      admin_add_admin: {
        Args: { p_email: string; p_permissions: string[] }
        Returns: undefined
      }
      admin_business_owners: {
        Args: { p_business_id: string }
        Returns: {
          email: string
          full_name: string
          member_id: string
          member_role: string
          phone: string
        }[]
      }
      admin_list_admins: {
        Args: never
        Returns: {
          email: string
          full_name: string
          permissions: string[]
          role: string
          user_id: string
        }[]
      }
      admin_remove_admin: { Args: { p_user_id: string }; Returns: undefined }
      admin_review_payment: {
        Args: { p_approve: boolean; p_note?: string; p_payment: string }
        Returns: undefined
      }
      admin_set_business_status: {
        Args: { p_business_id: string; p_reason?: string; p_status: string }
        Returns: {
          business_id: string
          current_status: string
          previous_status: string
          updated_at: string
        }[]
      }
      business_counts: {
        Args: { p_business: string }
        Returns: {
          favorites: number
          followers: number
        }[]
      }
      business_stats: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          day: string
          event_type: string
          total: number
        }[]
      }
      claim_main_admin: { Args: never; Returns: boolean }
      create_business: {
        Args: {
          p_address?: string
          p_category?: string
          p_description?: string
          p_email?: string
          p_name: string
          p_neighborhood?: string
          p_phone?: string
          p_slug: string
          p_whatsapp?: string
        }
        Returns: string
      }
      current_plan: {
        Args: { p_business: string }
        Returns: {
          code: string
          created_at: string
          display_order: number
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          max_images_per_item: number
          max_products: number | null
          name: string
          price_htg: number
        }
        SetofOptions: {
          from: "*"
          to: "subscription_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      customer_cancel_order: { Args: { p_order: string }; Returns: undefined }
      geo_descendants: { Args: { p_id: string }; Returns: string[] }
      get_payment_recipients: {
        Args: never
        Returns: {
          account_number: string
          label: string
          provider: string
        }[]
      }
      has_business_permission: {
        Args: { p_business: string; p_perm: string }
        Returns: boolean
      }
      is_business_manager: {
        Args: { target_business_id: string }
        Returns: boolean
      }
      is_main_admin: { Args: never; Returns: boolean }
      is_zack_admin: { Args: { perm?: string }; Returns: boolean }
      place_order: {
        Args: { p_cart: Json; p_options: Json; p_phone: string }
        Returns: string
      }
      process_expirations: { Args: never; Returns: undefined }
      request_subscription_payment: {
        Args: {
          p_business: string
          p_plan: string
          p_provider: string
          p_reference: string
        }
        Returns: string
      }
      search_businesses: {
        Args: {
          p_category?: string
          p_geo?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: {
          category: string
          city: string
          description: string
          geo_id: string
          id: string
          logo_url: string
          name: string
          rank: number
          slug: string
          street: string
        }[]
      }
      seller_assign_courier: {
        Args: { p_courier: string; p_order: string }
        Returns: undefined
      }
      seller_decide_item: {
        Args: { p_accept: boolean; p_item: string; p_reason?: string }
        Returns: undefined
      }
      seller_mark_paid: { Args: { p_order: string }; Returns: undefined }
      seller_set_order_status: {
        Args: { p_order: string; p_status: string }
        Returns: undefined
      }
      zack_notify_business_audience: {
        Args: {
          p_business_id: string
          p_dedupe_suffix?: string
          p_entity_id?: string
          p_entity_type?: string
          p_message: string
          p_notification_type: string
          p_preference?: string
          p_title: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
