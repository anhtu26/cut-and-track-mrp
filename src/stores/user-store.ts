
import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Management' | 'Machinist' | 'Sales';
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// This is a mock implementation - in a real application, this would connect to your backend
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock authentication - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes - hard-coded users
      if (email === 'admin@example.com' && password === 'admin') {
        set({ 
          user: { 
            id: '1', 
            name: 'Admin User', 
            email: 'admin@example.com', 
            role: 'Admin' 
          },
          isLoading: false 
        });
      } else if (email === 'manager@example.com' && password === 'manager') {
        set({ 
          user: { 
            id: '2', 
            name: 'Manager User', 
            email: 'manager@example.com', 
            role: 'Management' 
          },
          isLoading: false 
        });
      } else if (email === 'machinist@example.com' && password === 'machinist') {
        set({ 
          user: { 
            id: '3', 
            name: 'Machinist User', 
            email: 'machinist@example.com', 
            role: 'Machinist' 
          },
          isLoading: false 
        });
      } else if (email === 'sales@example.com' && password === 'sales') {
        set({ 
          user: { 
            id: '4', 
            name: 'Sales User', 
            email: 'sales@example.com', 
            role: 'Sales' 
          },
          isLoading: false 
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during login', 
        isLoading: false 
      });
    }
  },
  logout: () => {
    set({ user: null });
  },
}));
