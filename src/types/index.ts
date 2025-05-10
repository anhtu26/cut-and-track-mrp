/**
 * Type definitions for the MRP application
 * These types are used across the application for type safety
 */

export interface Customer {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
}

export interface Part {
  id: string;
  part_number: string;
  name: string;
  description?: string;
  material?: string;
  drawing_number?: string;
  customer_id?: string;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  revision?: string;
  unit_price?: number;
}

export interface Operation {
  id: string;
  work_order_id?: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  machine?: string;
  setup_time_hours?: number;
  duration_hours?: number;
  actual_duration_hours?: number;
  sequence_number?: number;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
}

export interface WorkOrder {
  id: string;
  order_number: string;
  status: 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customer_id?: string;
  customer?: Customer;
  part_id?: string;
  part?: Part;
  quantity?: number;
  due_date?: string;
  start_date?: string;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  archived?: boolean;
  operations?: Operation[];
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'operator' | 'inspector';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  user: User | null;
  error: string | null;
}

// API response types
export interface ApiListResponse<T> {
  data: T[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}
