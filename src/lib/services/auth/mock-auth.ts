// Mock authentication service for local development without Supabase

// Define UserRole as an enum to be used as both type and value
export enum UserRole {
  ADMIN = 'Administrator',
  MANAGER = 'Manager',
  STAFF = 'Staff',
  OPERATOR = 'Operator'
}

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
    name: 'Admin User',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    role: UserRole.STAFF,
    name: 'Regular User',
  },
];

export interface AuthResponse {
  data: {
    user: {
      id: string;
      email: string;
      name?: string;
    } | null;
    session: {
      access_token: string;
    } | null;
  };
  error: Error | null;
}

export interface UserDataResponse {
  data: {
    role: UserRole;
  } | null;
  error: Error | null;
}

// Mock sign in function
export const signInWithPassword = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
  
  if (user) {
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          access_token: `mock_token_${user.id}`,
        },
      },
      error: null,
    };
  } else {
    return {
      data: {
        user: null,
        session: null,
      },
      error: new Error('Invalid email or password'),
    };
  }
};

// Mock function to get user role
export const getUserRole = async (userId: string): Promise<UserDataResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = users.find(u => u.id === userId);
  
  if (user) {
    return {
      data: {
        role: user.role,
      },
      error: null,
    };
  } else {
    return {
      data: null,
      error: new Error('User not found'),
    };
  }
};

// Mock sign out function
export const signOut = async (): Promise<{ error: Error | null }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { error: null };
};
