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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          calculated_at: string | null
          date_range: string
          expires_at: string | null
          id: string
          metric_name: string
          metric_value: Json
        }
        Insert: {
          calculated_at?: string | null
          date_range: string
          expires_at?: string | null
          id?: string
          metric_name: string
          metric_value: Json
        }
        Update: {
          calculated_at?: string | null
          date_range?: string
          expires_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: Json
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          provider_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          provider_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          provider_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          provider_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          provider_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          provider_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_created_by: string | null
          booking_date: string
          booking_time: string
          client_id: string | null
          client_notes: string | null
          created_at: string | null
          id: string
          provider_id: string
          provider_notes: string | null
          service_id: string
          source_type: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string | null
        }
        Insert: {
          booking_created_by?: string | null
          booking_date: string
          booking_time: string
          client_id?: string | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
          provider_id: string
          provider_notes?: string | null
          service_id: string
          source_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string | null
        }
        Update: {
          booking_created_by?: string | null
          booking_date?: string
          booking_time?: string
          client_id?: string | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string
          provider_notes?: string | null
          service_id?: string
          source_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booking_created_by_fkey"
            columns: ["booking_created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_favorites: {
        Row: {
          client_id: string
          created_at: string
          id: string
          provider_id: string
          service_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          provider_id: string
          service_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          provider_id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_favorites_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      delegaciones: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          state?: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      guest_bookings: {
        Row: {
          booking_id: string
          created_at: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string
          id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone: string
          id?: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          city_id: string | null
          colonia: string | null
          created_at: string | null
          delegacion_id: string | null
          group_label: string | null
          id: string
          is_anchor: boolean | null
          latitude: number | null
          longitude: number | null
          municipality: string | null
          name: string
          postal_code: string | null
          professional_count: number | null
          state: string
          zone_id: string | null
        }
        Insert: {
          city: string
          city_id?: string | null
          colonia?: string | null
          created_at?: string | null
          delegacion_id?: string | null
          group_label?: string | null
          id?: string
          is_anchor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          municipality?: string | null
          name: string
          postal_code?: string | null
          professional_count?: number | null
          state?: string
          zone_id?: string | null
        }
        Update: {
          city?: string
          city_id?: string | null
          colonia?: string | null
          created_at?: string | null
          delegacion_id?: string | null
          group_label?: string | null
          id?: string
          is_anchor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          municipality?: string | null
          name?: string
          postal_code?: string | null
          professional_count?: number | null
          state?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_delegacion_id_fkey"
            columns: ["delegacion_id"]
            isOneToOne: false
            referencedRelation: "delegaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      main_categories: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean
          id: string
          preferred_method: string
          provider_id: string
          updated_at: string | null
          whatsapp_enabled: boolean
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          preferred_method?: string
          provider_id: string
          updated_at?: string | null
          whatsapp_enabled?: boolean
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          preferred_method?: string
          provider_id?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          avg_rating: number | null
          bio: string | null
          business_name: string | null
          category: string | null
          city_id: string | null
          colonia: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          latitude: number | null
          location_id: string | null
          longitude: number | null
          main_category_id: string | null
          onboarding_step: number | null
          phone: string | null
          postal_code: string | null
          prefers_local_clients: boolean | null
          profile_completed: boolean | null
          profile_image_url: string | null
          rating: number | null
          review_count: number | null
          service_radius_km: number | null
          subcategory_id: string | null
          theme_color: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          whatsapp_phone: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          bio?: string | null
          business_name?: string | null
          category?: string | null
          city_id?: string | null
          colonia?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          main_category_id?: string | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          prefers_local_clients?: boolean | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          service_radius_km?: number | null
          subcategory_id?: string | null
          theme_color?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          whatsapp_phone?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          bio?: string | null
          business_name?: string | null
          category?: string | null
          city_id?: string | null
          colonia?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          main_category_id?: string | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          prefers_local_clients?: boolean | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          review_count?: number | null
          service_radius_km?: number | null
          subcategory_id?: string | null
          theme_color?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          whatsapp_phone?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          is_public: boolean
          is_verified: boolean
          provider_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          provider_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          is_verified?: boolean
          provider_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          main_category_id: string | null
          name: string
          price: number
          provider_id: string
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name: string
          price: number
          provider_id: string
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          main_category_id?: string | null
          name?: string
          price?: number
          provider_id?: string
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers_with_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean
          main_category_id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean
          main_category_id: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          main_category_id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      zones: {
        Row: {
          city_id: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      colonia_analytics: {
        Row: {
          activation_status: string | null
          active_providers: number | null
          bookings_last_30_days: number | null
          colonia: string | null
          provider_count: number | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      provider_analytics: {
        Row: {
          bookings_last_30_days: number | null
          bookings_last_7_days: number | null
          business_name: string | null
          category: string | null
          colonia: string | null
          id: string | null
          onboarded_at: string | null
          revenue_last_30_days: number | null
          status: string | null
          total_bookings: number | null
          total_revenue: number | null
          unique_clients: number | null
        }
        Relationships: []
      }
      providers_with_location: {
        Row: {
          address: string | null
          bio: string | null
          business_name: string | null
          category: string | null
          city: string | null
          colonia: string | null
          created_at: string | null
          id: string | null
          instagram_handle: string | null
          is_active: boolean | null
          latitude: number | null
          location_colonia: string | null
          location_id: string | null
          location_name: string | null
          location_postal_code: string | null
          longitude: number | null
          onboarding_step: number | null
          phone: string | null
          postal_code: string | null
          prefers_local_clients: boolean | null
          profile_completed: boolean | null
          profile_image_url: string | null
          rating: number | null
          service_radius_km: number | null
          state: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          whatsapp_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_dashboard_metrics: {
        Args: { date_range?: string }
        Returns: Json
      }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      check_booking_conflicts: {
        Args: {
          booking_date_param: string
          booking_time_param: string
          duration_minutes_param: number
          provider_id_param: string
          service_id_param: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { event_data?: Json; event_type: string; target_user_id?: string }
        Returns: undefined
      }
      refresh_analytics_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      service_category:
        | "haircut"
        | "beard"
        | "nails"
        | "eyebrows"
        | "massage"
        | "other"
        | "corte_barberia"
        | "unas"
        | "maquillaje_cejas"
        | "cuidado_facial"
        | "masajes_relajacion"
        | "color_alisado"
      user_role: "provider" | "client"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      service_category: [
        "haircut",
        "beard",
        "nails",
        "eyebrows",
        "massage",
        "other",
        "corte_barberia",
        "unas",
        "maquillaje_cejas",
        "cuidado_facial",
        "masajes_relajacion",
        "color_alisado",
      ],
      user_role: ["provider", "client"],
    },
  },
} as const
