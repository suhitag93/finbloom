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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          badge_icon?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          xp_reward?: number
        }
        Update: {
          badge_icon?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          id: string
          is_active: boolean
          mission_type: string
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          mission_type?: string
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          mission_type?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          connected_bank: boolean | null
          created_at: string
          date_of_birth: string | null
          employment_type: string | null
          financial_accounts: string[] | null
          financial_confidence: string | null
          financial_personality: string | null
          financial_score: number | null
          finbloom_level: number
          full_name: string | null
          goals: string[] | null
          household: string | null
          id: string
          income_range: string | null
          location_type: string | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
          xp_points: number
        }
        Insert: {
          age_group?: string | null
          connected_bank?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          employment_type?: string | null
          financial_accounts?: string[] | null
          financial_confidence?: string | null
          financial_personality?: string | null
          financial_score?: number | null
          finbloom_level?: number
          full_name?: string | null
          goals?: string[] | null
          household?: string | null
          id?: string
          income_range?: string | null
          location_type?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
          xp_points?: number
        }
        Update: {
          age_group?: string | null
          connected_bank?: boolean | null
          created_at?: string
          date_of_birth?: string | null
          employment_type?: string | null
          financial_accounts?: string[] | null
          financial_confidence?: string | null
          financial_personality?: string | null
          financial_score?: number | null
          finbloom_level?: number
          full_name?: string | null
          goals?: string[] | null
          household?: string | null
          id?: string
          income_range?: string | null
          location_type?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
          xp_points?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          mission_id: string
          progress_value: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          mission_id: string
          progress_value?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          mission_id?: string
          progress_value?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_ledger: {
        Row: {
          created_at: string
          id: string
          reason: string
          source_id: string | null
          source_type: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          source_id?: string | null
          source_type: string
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
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
