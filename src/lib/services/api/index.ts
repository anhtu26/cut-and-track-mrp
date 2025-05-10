import axios from 'axios';
import AuthService from '../auth';

// Configure API URL from environment or default to localhost in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Base API service for making authenticated requests to the backend
 */
export class BaseApiService {
  /**
   * Make a GET request
   */
  static async get(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        params,
        headers: AuthService.authHeader()
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`GET error for ${endpoint}:`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Request failed'
      };
    }
  }

  /**
   * Make a POST request
   */
  static async post(endpoint: string, data: any = {}) {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data, {
        headers: AuthService.authHeader()
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`POST error for ${endpoint}:`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Request failed'
      };
    }
  }

  /**
   * Make a PUT request
   */
  static async put(endpoint: string, data: any = {}) {
    try {
      const response = await axios.put(`${API_URL}${endpoint}`, data, {
        headers: AuthService.authHeader()
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`PUT error for ${endpoint}:`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Request failed'
      };
    }
  }

  /**
   * Make a DELETE request
   */
  static async delete(endpoint: string) {
    try {
      const response = await axios.delete(`${API_URL}${endpoint}`, {
        headers: AuthService.authHeader()
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`DELETE error for ${endpoint}:`, error);
      return {
        data: null,
        error: error.response?.data?.message || 'Request failed'
      };
    }
  }
}

/**
 * Parts API Service
 */
export const PartsService = {
  /**
   * Get all parts with optional filters
   */
  getParts: async (params = {}) => {
    return BaseApiService.get('/parts', params);
  },

  /**
   * Get a part by ID
   */
  getPartById: async (id: string) => {
    return BaseApiService.get(`/parts/${id}`);
  },

  /**
   * Create a new part
   */
  createPart: async (partData: any) => {
    return BaseApiService.post('/parts', partData);
  },

  /**
   * Update a part
   */
  updatePart: async (id: string, partData: any) => {
    return BaseApiService.put(`/parts/${id}`, partData);
  },

  /**
   * Delete a part
   */
  deletePart: async (id: string) => {
    return BaseApiService.delete(`/parts/${id}`);
  }
};

/**
 * Work Orders API Service
 */
export const WorkOrdersService = {
  /**
   * Get all work orders with optional filters
   */
  getWorkOrders: async (params = {}) => {
    return BaseApiService.get('/workorders', params);
  },

  /**
   * Get a work order by ID
   */
  getWorkOrderById: async (id: string) => {
    return BaseApiService.get(`/workorders/${id}`);
  },

  /**
   * Create a new work order
   */
  createWorkOrder: async (workOrderData: any) => {
    return BaseApiService.post('/workorders', workOrderData);
  },

  /**
   * Update a work order
   */
  updateWorkOrder: async (id: string, workOrderData: any) => {
    return BaseApiService.put(`/workorders/${id}`, workOrderData);
  },

  /**
   * Delete a work order
   */
  deleteWorkOrder: async (id: string) => {
    return BaseApiService.delete(`/workorders/${id}`);
  }
};

/**
 * Operations API Service
 */
export const OperationsService = {
  /**
   * Get all operations with optional filters
   */
  getOperations: async (params = {}) => {
    return BaseApiService.get('/operations', params);
  },

  /**
   * Get an operation by ID
   */
  getOperationById: async (id: string) => {
    return BaseApiService.get(`/operations/${id}`);
  },

  /**
   * Create a new operation
   */
  createOperation: async (operationData: any) => {
    return BaseApiService.post('/operations', operationData);
  },

  /**
   * Update an operation
   */
  updateOperation: async (id: string, operationData: any) => {
    return BaseApiService.put(`/operations/${id}`, operationData);
  },

  /**
   * Delete an operation
   */
  deleteOperation: async (id: string) => {
    return BaseApiService.delete(`/operations/${id}`);
  }
};

/**
 * Customers API Service
 */
export const CustomersService = {
  /**
   * Get all customers
   */
  getCustomers: async () => {
    return BaseApiService.get('/customers');
  },

  /**
   * Get a customer by ID
   */
  getCustomerById: async (id: string) => {
    return BaseApiService.get(`/customers/${id}`);
  },

  /**
   * Create a new customer
   */
  createCustomer: async (customerData: any) => {
    return BaseApiService.post('/customers', customerData);
  },

  /**
   * Update a customer
   */
  updateCustomer: async (id: string, customerData: any) => {
    return BaseApiService.put(`/customers/${id}`, customerData);
  },

  /**
   * Delete a customer
   */
  deleteCustomer: async (id: string) => {
    return BaseApiService.delete(`/customers/${id}`);
  }
};

// Export all services
export default {
  BaseApiService,
  PartsService,
  WorkOrdersService,
  OperationsService,
  CustomersService
};
