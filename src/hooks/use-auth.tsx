
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export type UserRole = 'Administrator' | 'Manager' | 'Staff' | 'Operator';

export interface UserWithRole extends User {
  role: UserRole;
}

export interface UserSession {
  user: UserWithRole | null;
  session: Session | null;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user's role when authenticated
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', currentSession.user.id)
                .single();
              
              if (error) throw error;
              
              // Combine auth user with role data
              setUser({
                ...currentSession.user,
                role: data.role
              });
            } catch (err) {
              console.error('Error fetching user role:', err);
              setUser(null);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        // Fetch user's role for initial session
        supabase
          .from('users')
          .select('role')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user role:', error);
              setUser(null);
            } else {
              setUser({
                ...initialSession.user,
                role: data.role
              });
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user's role
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (roleError) throw roleError;
      
      // All roles are now allowed to log in

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    logout
  };
};
