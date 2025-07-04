export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        }
        Insert: {
          city: string
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
        }
        Update: {
          city?: string
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
        }
        Relationships: [
          {
            foreignKeyName: "locations_delegacion_id_fkey"
            columns: ["delegacion_id"]
            isOneToOne: false
            referencedRelation: "delegaciones"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          preferred_method?: string
          provider_id: string
          updated_at?: string | null
          whatsapp_enabled?: boolean
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          preferred_method?: string
          provider_id?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean
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
          bio: string | null
          business_name: string | null
          category: string | null
          colonia: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          latitude: number | null
          location_id: string | null
          longitude: number | null
          onboarding_step: number | null
          phone: string | null
          postal_code: string | null
          prefers_local_clients: boolean | null
          profile_completed: boolean | null
          profile_image_url: string | null
          rating: number | null
          service_radius_km: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          business_name?: string | null
          category?: string | null
          colonia?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          prefers_local_clients?: boolean | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          service_radius_km?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          business_name?: string | null
          category?: string | null
          colonia?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          prefers_local_clients?: boolean | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          rating?: number | null
          service_radius_km?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          whatsapp_phone?: string | null
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
          name: string
          price: number
          provider_id: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          provider_id: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
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
        Args: { lat1: number; lng1: number; lat2: number; lng2: number }
        Returns: number
      }
      check_booking_conflicts: {
        Args: {
          provider_id_param: string
          service_id_param: string
          booking_date_param: string
          booking_time_param: string
          duration_minutes_param: number
        }
        Returns: boolean
      }
      log_security_event: {
        Args: { event_type: string; event_data?: Json; target_user_id?: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
