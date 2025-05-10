// Base API URL from configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
import AuthService from '../auth';
import axios from 'axios';

export interface Operation {
  id: string;
  name: string;
  description?: string;
  standard_time?: number;
  machine_id?: string;
  setup_time?: number;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface OperationFilter {
  search?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

/**
 * Service for interacting with operations API
 */
const OperationsService = {
  /**
   * Get all operations with optional filtering
   * @param filter Filter parameters
   * @returns List of operations
   */
  async getOperations(filter: OperationFilter = {}): Promise<Operation[]> {
    // Build query parameters
    const params = new URLSearchParams();
    if (filter.search) params.append('search', filter.search);
    if (filter.sort_by) params.append('sort_by', filter.sort_by);
    if (filter.sort_order) params.append('sort_order', filter.sort_order);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Make API request
    const response = await axios.get(`${API_URL}/operations${queryString}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Get an operation by ID
   * @param id Operation ID
   * @returns Operation details
   */
  async getOperation(id: string): Promise<Operation> {
    const response = await axios.get(`${API_URL}/operations/${id}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Create a new operation
   * @param operation Operation data
   * @returns Created operation
   */
  async createOperation(operation: Partial<Operation>): Promise<Operation> {
    const response = await axios.post(`${API_URL}/operations`, operation, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Update an existing operation
   * @param id Operation ID
   * @param operation Updated operation data
   * @returns Updated operation
   */
  async updateOperation(id: string, operation: Partial<Operation>): Promise<Operation> {
    const response = await axios.put(`${API_URL}/operations/${id}`, operation, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Delete an operation
   * @param id Operation ID
   * @returns Confirmation message
   */
  async deleteOperation(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/operations/${id}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  },
  
  /**
   * Get operations by machine ID
   * @param machineId Machine ID
   * @returns List of operations
   */
  async getOperationsByMachine(machineId: string): Promise<Operation[]> {
    const response = await axios.get(`${API_URL}/operations/machine/${machineId}`, {
      headers: AuthService.authHeader()
    });
    
    return response.data;
  }
};

export default OperationsService;
