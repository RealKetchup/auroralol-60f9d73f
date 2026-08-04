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
      admin_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          admin_only: boolean
          color: string
          created_at: string
          description: string
          icon: string
          key: string
          name: string
          sort: number
          tier: string
        }
        Insert: {
          admin_only?: boolean
          color?: string
          created_at?: string
          description: string
          icon?: string
          key: string
          name: string
          sort?: number
          tier?: string
        }
        Update: {
          admin_only?: boolean
          color?: string
          created_at?: string
          description?: string
          icon?: string
          key?: string
          name?: string
          sort?: number
          tier?: string
        }
        Relationships: []
      }
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
          aurora_intensity: number
          aurora_preset: string
          auto_roblox_avatar: boolean
          avatar_shape: string
          avatar_url: string | null
          background_effect: string | null
          background_image_url: string | null
          background_opacity: number
          ban_reason: string | null
          banned: boolean
          bio: string | null
          border_glow: boolean
          card_blur: number
          card_opacity: number
          click_effect: boolean | null
          click_effect_style: string
          created_at: string
          cursor_trail: boolean
          custom_cursor: boolean | null
          custom_font_name: string | null
          custom_font_url: string | null
          discord_id: string | null
          display_name: string | null
          entry_animation: string
          font_family: string
          id: string
          layout_style: string
          music_title: string | null
          music_url: string | null
          panel_background_opacity: number
          panel_background_url: string | null
          profile_style: string
          roblox_avatar_url: string | null
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
          aurora_intensity?: number
          aurora_preset?: string
          auto_roblox_avatar?: boolean
          avatar_shape?: string
          avatar_url?: string | null
          background_effect?: string | null
          background_image_url?: string | null
          background_opacity?: number
          ban_reason?: string | null
          banned?: boolean
          bio?: string | null
          border_glow?: boolean
          card_blur?: number
          card_opacity?: number
          click_effect?: boolean | null
          click_effect_style?: string
          created_at?: string
          cursor_trail?: boolean
          custom_cursor?: boolean | null
          custom_font_name?: string | null
          custom_font_url?: string | null
          discord_id?: string | null
          display_name?: string | null
          entry_animation?: string
          font_family?: string
          id: string
          layout_style?: string
          music_title?: string | null
          music_url?: string | null
          panel_background_opacity?: number
          panel_background_url?: string | null
          profile_style?: string
          roblox_avatar_url?: string | null
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
          aurora_intensity?: number
          aurora_preset?: string
          auto_roblox_avatar?: boolean
          avatar_shape?: string
          avatar_url?: string | null
          background_effect?: string | null
          background_image_url?: string | null
          background_opacity?: number
          ban_reason?: string | null
          banned?: boolean
          bio?: string | null
          border_glow?: boolean
          card_blur?: number
          card_opacity?: number
          click_effect?: boolean | null
          click_effect_style?: string
          created_at?: string
          cursor_trail?: boolean
          custom_cursor?: boolean | null
          custom_font_name?: string | null
          custom_font_url?: string | null
          discord_id?: string | null
          display_name?: string | null
          entry_animation?: string
          font_family?: string
          id?: string
          layout_style?: string
          music_title?: string | null
          music_url?: string | null
          panel_background_opacity?: number
          panel_background_url?: string | null
          profile_style?: string
          roblox_avatar_url?: string | null
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
      user_badges: {
        Row: {
          awarded_at: string
          badge_key: string
          equipped: boolean
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_key: string
          equipped?: boolean
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_key?: string
          equipped?: boolean
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_key_fkey"
            columns: ["badge_key"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_badge: {
        Args: { _badge_key: string; _user_id: string }
        Returns: undefined
      }
      admin_revoke_badge: {
        Args: { _badge_key: string; _user_id: string }
        Returns: undefined
      }
      admin_set_ban: {
        Args: { _banned: boolean; _reason: string; _user_id: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _enabled: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      award_badges: { Args: { _user_id: string }; Returns: undefined }
      claim_badges: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_admin_code: { Args: { _code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
