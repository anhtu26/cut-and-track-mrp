/**
 * Local Authentication Service
 * 
 * This module handles user authentication with the local API server
 * instead of Supabase to maintain ITAR compliance.
 */

import { apiClient } from './client';
import { User } from '@/types';

// Token storage keys
const AUTH_TOKEN_KEY = 'mrp_auth_token';
const AUTH_USER_KEY = 'mrp_auth_user';

// Authentication service
export const authService = {
  /**
   * Log in a user with email and password
   * @param email User email
   * @param password User password
   * @returns User data and token on success
   */
  async login(email: string, password: string) {
    const response = await apiClient.auth.login(email, password);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (response.data) {
      // Store token and user data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error('Login failed');
  },
  
  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @param userData Additional user data
   * @returns User data on success
   */
  async register(email: string, password: string, userData: any) {
    const response = await apiClient.auth.register(email, password, userData);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  },
  
  /**
   * Log out the current user
   */
  async logout() {
    await apiClient.auth.logout();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
  
  /**
   * Get the current user's authentication token
   * @returns The token or null if not authenticated
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  
  /**
   * Get the current authenticated user
   * @returns User data or null if not authenticated
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  /**
   * Check if a user is currently authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  
  /**
   * Get a user's role by their ID
   * @param userId The user's ID
   * @returns The user's role data
   */
  async getUserRole(userId: string) {
    const response = await apiClient.auth.getUserRole(userId);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  }
};
