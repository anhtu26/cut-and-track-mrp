/**
 * Local API Client
 * 
 * This client handles all API requests to the local backend services.
 * It replaces Supabase with locally hosted API endpoints for ITAR compliance.
 * 
 * This enhanced version supports all the operations needed by our Supabase proxy.
 */

import { WorkOrder, Customer, Part, Operation } from '@/types';

// Base URL for API endpoints - configured to use local server or Docker container
const API_BASE_URL = process.env.VITE_API_URL ? `${process.env.VITE_API_URL}/api` : 'http://localhost:3002/api';

// Custom error for API operations
export class ApiError extends Error {
  code: string;
  details: string;
  
  constructor(message: string, code = 'unknown_error', details = '') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// API response structure
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Execute the fetch request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        data: null, 
        error: new ApiError(
          data.message || 'An error occurred', 
          data.code || 'fetch_error',
          data.details || response.statusText
        ) 
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('API fetch error:', error);
    const apiError = error instanceof Error 
      ? new ApiError(error.message, 'fetch_error', error.stack) 
      : new ApiError('Unknown error occurred');
    
    return { data: null, error: apiError };
  }
}

// API client with methods for different resources
export const apiClient = {
  // Expose the base URL for use in other modules
  baseUrl: API_BASE_URL,
  // Work Orders
  workOrders: {
    getAll: async (options: { archived?: boolean } = {}): Promise<ApiResponse<WorkOrder[]>> => {
      const params = new URLSearchParams();
      if (options.archived !== undefined) {
        params.append('archived', options.archived.toString());
      }

      return fetchApi<WorkOrder[]>(`/work-orders?${params.toString()}`);
    },
    
    getRecent: async (limit = 5): Promise<ApiResponse<WorkOrder[]>> => {
      return fetchApi<WorkOrder[]>(`/work-orders/recent?limit=${limit}`);
    },
    
    getById: async (id: string): Promise<ApiResponse<WorkOrder>> => {
      return fetchApi<WorkOrder>(`/work-orders/${id}`);
    },
    
    create: async (workOrder: Omit<WorkOrder, 'id'>): Promise<ApiResponse<WorkOrder>> => {
      return fetchApi<WorkOrder>('/work-orders', {
        method: 'POST',
        body: JSON.stringify(workOrder),
      });
    },
    
    update: async (id: string, updates: Partial<WorkOrder>): Promise<ApiResponse<WorkOrder>> => {
      return fetchApi<WorkOrder>(`/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    
    delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
      return fetchApi<{ success: boolean }>(`/work-orders/${id}`, {
        method: 'DELETE',
      });
    }
  },
  
  // Mock data methods for testing without backend
  // These will be replaced with actual API calls when the backend is ready
  mock: {
    getRecentWorkOrders: async (): Promise<WorkOrder[]> => {
      console.log('Using mock data for recent work orders');
      return [
        {
          id: '1',
          order_number: 'WO-2025-001',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          customer: { id: '1', name: 'Aero Precision', contact_email: 'contact@aeroprecision.com' } as Customer,
          part: { id: '1', part_number: 'AP-1001', name: 'Hydraulic Manifold', material: 'Aluminum 6061' } as Part,
          operations: [
            { id: '1', name: 'CNC Milling', status: 'completed', duration_hours: 2.5 },
            { id: '2', name: 'Deburring', status: 'in_progress', duration_hours: 1.0 },
            { id: '3', name: 'Inspection', status: 'pending', duration_hours: 0.5 }
          ] as Operation[]
        },
        {
          id: '2',
          order_number: 'WO-2025-002',
          status: 'pending',
          created_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          customer: { id: '2', name: 'TechMach Industries', contact_email: 'orders@techmach.com' } as Customer,
          part: { id: '2', part_number: 'TM-500', name: 'Precision Shaft', material: 'Stainless Steel 304' } as Part,
          operations: [
            { id: '4', name: 'CNC Turning', status: 'pending', duration_hours: 1.5 },
            { id: '5', name: 'Surface Grinding', status: 'pending', duration_hours: 1.0 },
            { id: '6', name: 'QC', status: 'pending', duration_hours: 0.5 }
          ] as Operation[]
        }
      ] as WorkOrder[];
    },
    
    getTopParts: async (): Promise<{name: string; orderCount: number}[]> => {
      return [
        { name: "Hydraulic Manifold", orderCount: 12 },
        { name: "Precision Shaft", orderCount: 8 },
        { name: "Bearing Housing", orderCount: 7 },
        { name: "Custom Flange", orderCount: 5 }
      ];
    },
    
    getTopCustomers: async (): Promise<{name: string; orderValue: number}[]> => {
      return [
        { name: "Airo Defense Systems", orderValue: 28500 },
        { name: "Precision Hydraulics", orderValue: 19200 },
        { name: "TechMach Industries", orderValue: 15800 },
        { name: "Aerospace Specialties", orderValue: 12400 }
      ];
    }
  },
  
  // Authentication (local) - updated for direct implementation
  auth: {
    async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
      const response = await fetchApi<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // If login successful, store token and user data
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
      
      return response;
    },
    
    async register(email: string, password: string, userData: any): Promise<ApiResponse<{ user: any }>> {
      return fetchApi<{ user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, ...userData }),
      });
    },
    
    async logout(): Promise<ApiResponse<{ success: boolean }>> {
      // Call the server logout endpoint
      const response = await fetchApi<{ success: boolean }>('/auth/logout', {
        method: 'POST'
      });
      
      // Always clear local storage regardless of server response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      return response;
    },
    
    async getUserInfo(): Promise<ApiResponse<any>> {
      return fetchApi<any>('/auth/user');
    },
    
    async getUserRole(userId: string): Promise<ApiResponse<{ role: string }>> {
      return fetchApi<{ role: string }>(`/auth/user/${userId}/role`);
    },
    
    /**
     * Check if the user is authenticated
     */
    isAuthenticated(): boolean {
      return localStorage.getItem('auth_token') !== null;
    },
    
    /**
     * Get the current user from local storage
     * Note: This doesn't verify the token validity
     */
    getStoredUser(): any | null {
      const userJson = localStorage.getItem('auth_user');
      if (!userJson) return null;
      
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        return null;
      }
    },
    
    /**
     * Get the current auth token
     */
    getToken(): string | null {
      return localStorage.getItem('auth_token');
    }
  }
};

// Log client initialization
console.log('Local API client initialized with URL:', API_BASE_URL);
