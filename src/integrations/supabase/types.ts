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
      group_roles: {
        Row: {
          created_at: string
          group_id: string
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          role_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "available_roles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["role_id"]
          },
        ]
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
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          name: string
          resource: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          manager_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          manager_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          manager_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["permission_id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "available_roles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "available_roles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["role_id"]
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
          use_operation_templates: boolean
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
          use_operation_templates?: boolean
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
          use_operation_templates?: boolean
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
      available_roles_view: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          permission_count: number | null
        }
        Relationships: []
      }
      permissions_view: {
        Row: {
          action: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          resource: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          resource?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          resource?: string | null
        }
        Relationships: []
      }
      role_permissions_view: {
        Row: {
          created_at: string | null
          id: string | null
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["permission_id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "available_roles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_with_permissions_view"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles_with_permissions_view: {
        Row: {
          permission_action: string | null
          permission_created_at: string | null
          permission_description: string | null
          permission_id: string | null
          permission_name: string | null
          permission_resource: string | null
          role_created_at: string | null
          role_description: string | null
          role_id: string | null
          role_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_create_user: {
        Args: {
          admin_user_id: string
          new_email: string
          new_password: string
          new_first_name: string
          new_last_name: string
          new_department: string
          new_job_title: string
          new_role_id?: string
        }
        Returns: string
      }
      ensure_default_roles: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_role_permissions: {
        Args: { role_id: string }
        Returns: {
          permission_id: string
          permission_name: string
          permission_resource: string
          permission_action: string
          permission_description: string
        }[]
      }
      is_manager_of: {
        Args: { manager_uuid: string; employee_uuid: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_uuid: string; resource: string; action: string }
        Returns: boolean
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
