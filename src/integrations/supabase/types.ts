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
      accounts: {
        Row: {
          account_subtype: string | null
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          institution_id: string
          is_manual: boolean
          last_synced_at: string | null
          nickname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_subtype?: string | null
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          institution_id: string
          is_manual?: boolean
          last_synced_at?: string | null
          nickname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_subtype?: string | null
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          institution_id?: string
          is_manual?: boolean
          last_synced_at?: string | null
          nickname?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      goal_accounts: {
        Row: {
          account_id: string
          created_at: string
          goal_name: string
          id: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          goal_name: string
          id?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          goal_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          goal_id: string
          id: string
          milestone_pct: number
          reached_at: string | null
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          goal_id: string
          id?: string
          milestone_pct: number
          reached_at?: string | null
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          goal_id?: string
          id?: string
          milestone_pct?: number
          reached_at?: string | null
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          coach_notes: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          goal_type: string
          id: string
          linked_account_id: string | null
          monthly_contribution: number | null
          status: string | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coach_notes?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          goal_type: string
          id?: string
          linked_account_id?: string | null
          monthly_contribution?: number | null
          status?: string | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coach_notes?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          linked_account_id?: string | null
          monthly_contribution?: number | null
          status?: string | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          id: string
          institution_type: string
          logo_url: string | null
          name: string
          provider: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_type?: string
          logo_url?: string | null
          name: string
          provider?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_type?: string
          logo_url?: string | null
          name?: string
          provider?: string
        }
        Relationships: []
      }
      investment_holdings: {
        Row: {
          account_id: string
          cost_basis: number | null
          created_at: string
          current_value: number
          id: string
          name: string | null
          plaid_security_id: string | null
          quantity: number
          symbol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          cost_basis?: number | null
          created_at?: string
          current_value?: number
          id?: string
          name?: string | null
          plaid_security_id?: string | null
          quantity?: number
          symbol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          cost_basis?: number | null
          created_at?: string
          current_value?: number
          id?: string
          name?: string | null
          plaid_security_id?: string | null
          quantity?: number
          symbol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_holdings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      liabilities: {
        Row: {
          account_id: string
          apr: number | null
          balance: number
          created_at: string
          id: string
          liability_type: string
          minimum_payment: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          apr?: number | null
          balance?: number
          created_at?: string
          id?: string
          liability_type?: string
          minimum_payment?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          apr?: number | null
          balance?: number
          created_at?: string
          id?: string
          liability_type?: string
          minimum_payment?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      plaid_connections: {
        Row: {
          access_token: string
          created_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          item_id?: string
          user_id?: string
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
      survey_responses: {
        Row: {
          accounts_held: string[] | null
          age_group: string | null
          anything_else: string | null
          app_dropout_reasons: string[] | null
          biggest_barrier: string | null
          biggest_difference: string | null
          confident_self: string | null
          created_at: string | null
          debt_situation: string | null
          dream_goal: string | null
          email: string | null
          engagement_drivers: string | null
          financial_journey: string | null
          id: string
          income_range: string | null
          money_behaviors: string[] | null
          money_feelings: string[] | null
          money_is: string | null
          money_upbringing: string | null
          motivation_ranking: string[] | null
        }
        Insert: {
          accounts_held?: string[] | null
          age_group?: string | null
          anything_else?: string | null
          app_dropout_reasons?: string[] | null
          biggest_barrier?: string | null
          biggest_difference?: string | null
          confident_self?: string | null
          created_at?: string | null
          debt_situation?: string | null
          dream_goal?: string | null
          email?: string | null
          engagement_drivers?: string | null
          financial_journey?: string | null
          id?: string
          income_range?: string | null
          money_behaviors?: string[] | null
          money_feelings?: string[] | null
          money_is?: string | null
          money_upbringing?: string | null
          motivation_ranking?: string[] | null
        }
        Update: {
          accounts_held?: string[] | null
          age_group?: string | null
          anything_else?: string | null
          app_dropout_reasons?: string[] | null
          biggest_barrier?: string | null
          biggest_difference?: string | null
          confident_self?: string | null
          created_at?: string | null
          debt_situation?: string | null
          dream_goal?: string | null
          email?: string | null
          engagement_drivers?: string | null
          financial_journey?: string | null
          id?: string
          income_range?: string | null
          money_behaviors?: string[] | null
          money_feelings?: string[] | null
          money_is?: string | null
          money_upbringing?: string | null
          motivation_ranking?: string[] | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string
          date: string
          id: string
          merchant_name: string | null
          pending: boolean
          plaid_transaction_id: string | null
          subcategory: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          merchant_name?: string | null
          pending?: boolean
          plaid_transaction_id?: string | null
          subcategory?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          merchant_name?: string | null
          pending?: boolean
          plaid_transaction_id?: string | null
          subcategory?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
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
      award_xp: {
        Args: {
          p_reason?: string
          p_source_id?: string
          p_source_type: string
          p_user_id: string
          p_xp_amount: number
        }
        Returns: Json
      }
      recalculate_financial_score: {
        Args: { p_user_id: string }
        Returns: number
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
