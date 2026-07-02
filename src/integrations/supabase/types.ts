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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          position: number
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          position?: number
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          position?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          animation_speed: number
          avatar_shape: string
          avatar_url: string | null
          background_effect: string | null
          background_image_url: string | null
          background_opacity: number
          bio: string | null
          border_glow: boolean
          card_blur: number
          card_opacity: number
          click_effect: boolean | null
          click_effect_style: string
          created_at: string
          cursor_trail: boolean
          custom_cursor: boolean | null
          discord_id: string | null
          display_name: string | null
          entry_animation: string
          font_family: string
          id: string
          layout_style: string
          music_title: string | null
          music_url: string | null
          profile_style: string
          roblox_url: string | null
          secondary_color: string | null
          tilt_cards: boolean
          updated_at: string
          username: string
          view_count: number
        }
        Insert: {
          accent_color?: string | null
          animation_speed?: number
          avatar_shape?: string
          avatar_url?: string | null
          background_effect?: string | null
          background_image_url?: string | null
          background_opacity?: number
          bio?: string | null
          border_glow?: boolean
          card_blur?: number
          card_opacity?: number
          click_effect?: boolean | null
          click_effect_style?: string
          created_at?: string
          cursor_trail?: boolean
          custom_cursor?: boolean | null
          discord_id?: string | null
          display_name?: string | null
          entry_animation?: string
          font_family?: string
          id: string
          layout_style?: string
          music_title?: string | null
          music_url?: string | null
          profile_style?: string
          roblox_url?: string | null
          secondary_color?: string | null
          tilt_cards?: boolean
          updated_at?: string
          username: string
          view_count?: number
        }
        Update: {
          accent_color?: string | null
          animation_speed?: number
          avatar_shape?: string
          avatar_url?: string | null
          background_effect?: string | null
          background_image_url?: string | null
          background_opacity?: number
          bio?: string | null
          border_glow?: boolean
          card_blur?: number
          card_opacity?: number
          click_effect?: boolean | null
          click_effect_style?: string
          created_at?: string
          cursor_trail?: boolean
          custom_cursor?: boolean | null
          discord_id?: string | null
          display_name?: string | null
          entry_animation?: string
          font_family?: string
          id?: string
          layout_style?: string
          music_title?: string | null
          music_url?: string | null
          profile_style?: string
          roblox_url?: string | null
          secondary_color?: string | null
          tilt_cards?: boolean
          updated_at?: string
          username?: string
          view_count?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          profile_id: string
          rating: number | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          profile_id: string
          rating?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
