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
      customers: {
        Row: {
          active: boolean
          address: string | null
          company: string
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      operation_templates: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          machining_methods: string | null
          name: string
          part_id: string
          sequence: number
          setup_instructions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          machining_methods?: string | null
          name: string
          part_id: string
          sequence?: number
          setup_instructions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          machining_methods?: string | null
          name?: string
          part_id?: string
          sequence?: number
          setup_instructions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_templates_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          assigned_to_id: string | null
          comments: string | null
          created_at: string
          description: string | null
          estimated_end_time: string | null
          estimated_start_time: string | null
          id: string
          is_custom: boolean
          machining_methods: string | null
          name: string
          sequence: number
          setup_instructions: string | null
          status: string
          updated_at: string
          work_order_id: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_to_id?: string | null
          comments?: string | null
          created_at?: string
          description?: string | null
          estimated_end_time?: string | null
          estimated_start_time?: string | null
          id?: string
          is_custom?: boolean
          machining_methods?: string | null
          name: string
          sequence?: number
          setup_instructions?: string | null
          status?: string
          updated_at?: string
          work_order_id: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_to_id?: string | null
          comments?: string | null
          created_at?: string
          description?: string | null
          estimated_end_time?: string | null
          estimated_start_time?: string | null
          id?: string
          is_custom?: boolean
          machining_methods?: string | null
          name?: string
          sequence?: number
          setup_instructions?: string | null
          status?: string
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      part_documents: {
        Row: {
          id: string
          name: string
          part_id: string
          type: string
          uploaded_at: string
          url: string
        }
        Insert: {
          id?: string
          name: string
          part_id: string
          type: string
          uploaded_at?: string
          url: string
        }
        Update: {
          id?: string
          name?: string
          part_id?: string
          type?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_documents_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          active: boolean
          archive_reason: string | null
          archived: boolean
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          machining_methods: string | null
          materials: string[] | null
          name: string
          part_number: string
          previous_revision_id: string | null
          revision_number: string | null
          setup_instructions: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          archive_reason?: string | null
          archived?: boolean
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          machining_methods?: string | null
          materials?: string[] | null
          name: string
          part_number: string
          previous_revision_id?: string | null
          revision_number?: string | null
          setup_instructions?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          archive_reason?: string | null
          archived?: boolean
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          machining_methods?: string | null
          materials?: string[] | null
          name?: string
          part_number?: string
          previous_revision_id?: string | null
          revision_number?: string | null
          setup_instructions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_previous_revision_id_fkey"
            columns: ["previous_revision_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          archive_reason: string | null
          archived: boolean
          archived_at: string | null
          assigned_to_id: string | null
          completed_date: string | null
          created_at: string
          customer_id: string
          due_date: string
          id: string
          notes: string | null
          part_id: string
          priority: string
          purchase_order_number: string | null
          quantity: number
          start_date: string | null
          status: string
          updated_at: string
          work_order_number: string
        }
        Insert: {
          archive_reason?: string | null
          archived?: boolean
          archived_at?: string | null
          assigned_to_id?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          notes?: string | null
          part_id: string
          priority?: string
          purchase_order_number?: string | null
          quantity: number
          start_date?: string | null
          status?: string
          updated_at?: string
          work_order_number: string
        }
        Update: {
          archive_reason?: string | null
          archived?: boolean
          archived_at?: string | null
          assigned_to_id?: string | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          notes?: string | null
          part_id?: string
          priority?: string
          purchase_order_number?: string | null
          quantity?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          work_order_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
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
    Enums: {},
  },
} as const
