// Base API URL from configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
import AuthService from '../auth';
import axios from 'axios';

export interface Customer {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CustomerFilter {
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

/**
 * Service for interacting with customers API
 */
const CustomersService = {
  /**
   * Get all customers with optional filtering
   * @param filter Filter parameters
   * @returns List of customers
   */
  async getCustomers(filter: CustomerFilter = {}): Promise<Customer[]> {
    // Build query parameters
    const params = new URLSearchParams();
    if (filter.search) params.append('search', filter.search);
    if (filter.sort_by) params.append('sort_by', filter.sort_by);
    if (filter.sort_order) params.append('sort_order', filter.sort_order);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Make API request
    const response = await axios.get(`${API_URL}/customers${queryString}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Get a customer by ID
   * @param id Customer ID
   * @returns Customer details
   */
  async getCustomer(id: string): Promise<Customer> {
    const response = await axios.get(`${API_URL}/customers/${id}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Create a new customer
   * @param customer Customer data
   * @returns Created customer
   */
  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const response = await axios.post(`${API_URL}/customers`, customer, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Update an existing customer
   * @param id Customer ID
   * @param customer Updated customer data
   * @returns Updated customer
   */
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await axios.put(`${API_URL}/customers/${id}`, customer, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Delete a customer
   * @param id Customer ID
   * @returns Confirmation message
   */
  async deleteCustomer(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/customers/${id}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  }
};

export default CustomersService;
