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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          currency: string | null
          demo_url: string | null
          description: string | null
          faq: Json | null
          files: Json | null
          id: string
          images: Json | null
          license: string | null
          price: number
          seller_id: string
          status: string | null
          subtitle: string | null
          support_contact: string | null
          tags: string[] | null
          tech_stack: string[] | null
          title: string
          type: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          demo_url?: string | null
          description?: string | null
          faq?: Json | null
          files?: Json | null
          id?: string
          images?: Json | null
          license?: string | null
          price: number
          seller_id: string
          status?: string | null
          subtitle?: string | null
          support_contact?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          demo_url?: string | null
          description?: string | null
          faq?: Json | null
          files?: Json | null
          id?: string
          images?: Json | null
          license?: string | null
          price?: number
          seller_id?: string
          status?: string | null
          subtitle?: string | null
          support_contact?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          github: string | null
          id: string
          linkedin: string | null
          location: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string | null
          id: string
          product_id: string
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          product_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          product_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          body: string | null
          cons: string[] | null
          created_at: string | null
          helpful_count: number | null
          id: string
          pros: string[] | null
          rating: number
          recommend: boolean | null
          resource_id: string
          resource_type: string
          status: string | null
          title: string | null
          updated_at: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          author_id: string
          body?: string | null
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          pros?: string[] | null
          rating: number
          recommend?: boolean | null
          resource_id: string
          resource_type: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          author_id?: string
          body?: string | null
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          pros?: string[] | null
          rating?: number
          recommend?: boolean | null
          resource_id?: string
          resource_type?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          created_at: string | null
          id: string
          kyc_status: string | null
          payout_enabled: boolean | null
          stripe_connect_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kyc_status?: string | null
          payout_enabled?: boolean | null
          stripe_connect_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kyc_status?: string | null
          payout_enabled?: boolean | null
          stripe_connect_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      toolkits: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          tools: Json | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          tools?: Json | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          tools?: Json | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "toolkits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          pricing: string | null
          repo_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvote_count: number | null
          user_id: string
          view_count: number | null
          website_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          pricing?: string | null
          repo_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id: string
          view_count?: number | null
          website_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          pricing?: string | null
          repo_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id?: string
          view_count?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
