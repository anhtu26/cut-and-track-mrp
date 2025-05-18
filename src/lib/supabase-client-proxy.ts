/**
 * Supabase Client Proxy
 * 
 * This file provides a proxy for the Supabase client that redirects all calls
 * to our local API implementation. This helps with the migration from Supabase
 * to a local authentication system without having to change all references at once.
 */

import { apiClient } from './api/client';

/**
 * Implementation of Supabase's signInWithPassword function
 * using our local authentication system
 */
async function signInWithPassword(credentials: { email: string; password: string }) {
  try {
    const response = await apiClient.auth.login(credentials.email, credentials.password);
    
    if (response.error) {
      return {
        data: { user: null, session: null },
        error: response.error
      };
    }
    
    return {
      data: {
        user: response.data.user,
        session: { access_token: response.data.token }
      },
      error: null
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      data: { user: null, session: null },
      error: new Error(error.message || 'Authentication failed')
    };
  }
}

/**
 * Implementation of Supabase's signOut function
 * using our local authentication system
 */
async function signOut() {
  try {
    await apiClient.auth.logout();
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error: new Error(error.message || 'Logout failed') };
  }
}

// Create a proxy object that mimics the Supabase client structure
const supabaseClientProxy = {
  // Authentication methods
  auth: {
    signInWithPassword,
    signOut,
    getUser: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          return { data: { user: null }, error: null };
        }
        
        const response = await apiClient.auth.getUserInfo();
        return {
          data: { user: response.data },
          error: null
        };
      } catch (error) {
        console.error('Get user error:', error);
        return { data: { user: null }, error };
      }
    },
    getSession: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          return { data: { session: null }, error: null };
        }
        
        const userResponse = await apiClient.auth.getUserInfo();
        if (userResponse.error) {
          return { data: { session: null }, error: userResponse.error };
        }
        
        return {
          data: {
            session: {
              access_token: token,
              user: userResponse.data
            }
          },
          error: null
        };
      } catch (error) {
        console.error('Get session error:', error);
        return { data: { session: null }, error };
      }
    },
    onAuthStateChange: (callback: any) => {
      // Simulate Supabase's onAuthStateChange by adding a storage event listener
      const handler = (event: StorageEvent) => {
        if (event.key === 'auth_token') {
          if (!event.newValue) {
            callback('SIGNED_OUT', { session: null });
          } else if (event.newValue !== event.oldValue) {
            callback('SIGNED_IN', { 
              session: { 
                access_token: event.newValue,
                user: JSON.parse(localStorage.getItem('auth_user') || '{}')
              } 
            });
          }
        }
      };
      
      window.addEventListener('storage', handler);
      
      // Return an unsubscribe function
      return {
        data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handler) } },
        error: null
      };
    }
  },
  
  // Storage methods (redirected to local API)
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`${apiClient.baseUrl}/storage/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          console.error('Upload error:', error);
          return { data: null, error };
        }
      },
      
      download: async (path: string) => {
        try {
          const response = await fetch(`${apiClient.baseUrl}/storage/${bucket}/${path}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          return { data: blob, error: null };
        } catch (error) {
          console.error('Download error:', error);
          return { data: null, error };
        }
      },
      
      remove: async (paths: string[]) => {
        try {
          const response = await fetch(`${apiClient.baseUrl}/storage/${bucket}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paths })
          });
          
          if (!response.ok) {
            throw new Error(`Remove failed: ${response.statusText}`);
          }
          
          return { data: { message: 'Files removed successfully' }, error: null };
        } catch (error) {
          console.error('Remove error:', error);
          return { data: null, error };
        }
      },
      
      list: async (path: string) => {
        try {
          const response = await fetch(`${apiClient.baseUrl}/storage/${bucket}/list/${path}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`List failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          console.error('List error:', error);
          return { data: null, error };
        }
      },
      
      getPublicUrl: (path: string) => {
        return {
          data: { publicUrl: `${apiClient.baseUrl}/storage/${bucket}/public/${path}` },
          error: null
        };
      }
    })
  },
  
  // Database methods (redirected to local API)
  from: (table: string) => {
    return {
      select: (columns = '*') => {
        let query = `?select=${columns}`;
        
        return {
          eq: (column: string, value: any) => {
            query += `&${column}=eq.${value}`;
            return {
              order: (column: string, { ascending = true } = {}) => {
                query += `&order=${column}.${ascending ? 'asc' : 'desc'}`;
                return {
                  limit: (limit: number) => {
                    query += `&limit=${limit}`;
                    return {
                      single: () => {
                        return fetchData(`${table}/single${query}`);
                      },
                      execute: () => {
                        return fetchData(`${table}${query}`);
                      }
                    };
                  },
                  execute: () => {
                    return fetchData(`${table}${query}`);
                  }
                };
              },
              execute: () => {
                return fetchData(`${table}${query}`);
              },
              single: () => {
                return fetchData(`${table}/single${query}`);
              }
            };
          },
          in: (column: string, values: any[]) => {
            query += `&${column}=in.(${values.join(',')})`;
            return {
              execute: () => {
                return fetchData(`${table}${query}`);
              }
            };
          },
          order: (column: string, { ascending = true } = {}) => {
            query += `&order=${column}.${ascending ? 'asc' : 'desc'}`;
            return {
              limit: (limit: number) => {
                query += `&limit=${limit}`;
                return {
                  execute: () => {
                    return fetchData(`${table}${query}`);
                  }
                };
              },
              execute: () => {
                return fetchData(`${table}${query}`);
              }
            };
          },
          limit: (limit: number) => {
            query += `&limit=${limit}`;
            return {
              execute: () => {
                return fetchData(`${table}${query}`);
              }
            };
          },
          execute: () => {
            return fetchData(`${table}${query}`);
          }
        };
      },
      
      insert: (data: any) => {
        return insertData(table, data);
      },
      
      update: (data: any) => {
        return {
          eq: (column: string, value: any) => {
            return updateData(table, data, `${column}=eq.${value}`);
          },
          match: (criteria: Record<string, any>) => {
            const conditions = Object.entries(criteria)
              .map(([key, value]) => `${key}=eq.${value}`)
              .join('&');
            return updateData(table, data, conditions);
          }
        };
      },
      
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return deleteData(table, `${column}=eq.${value}`);
          },
          match: (criteria: Record<string, any>) => {
            const conditions = Object.entries(criteria)
              .map(([key, value]) => `${key}=eq.${value}`)
              .join('&');
            return deleteData(table, conditions);
          }
        };
      }
    };
  },
  
  // Functions API (redirected to local API)
  functions: {
    invoke: async (functionName: string, { body = {} } = {}) => {
      try {
        const response = await fetch(`${apiClient.baseUrl}/functions/${functionName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        if (!response.ok) {
          throw new Error(`Function invocation failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        console.error(`Function ${functionName} error:`, error);
        return { data: null, error };
      }
    }
  }
};

// Helper function to fetch data
async function fetchData(path: string) {
  try {
    const response = await fetch(`${apiClient.baseUrl}/db/${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Fetch error:', error);
    return { data: null, error };
  }
}

// Helper function to insert data
async function insertData(table: string, data: any) {
  try {
    const response = await fetch(`${apiClient.baseUrl}/db/${table}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Insert failed: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Insert error:', error);
    return { data: null, error };
  }
}

// Helper function to update data
async function updateData(table: string, data: any, conditions: string) {
  try {
    const response = await fetch(`${apiClient.baseUrl}/db/${table}?${conditions}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return { data: responseData, error: null };
  } catch (error) {
    console.error('Update error:', error);
    return { data: null, error };
  }
}

// Helper function to delete data
async function deleteData(table: string, conditions: string) {
  try {
    const response = await fetch(`${apiClient.baseUrl}/db/${table}?${conditions}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { data: null, error };
  }
}

// Export the Supabase client proxy as a default export
export default supabaseClientProxy;
