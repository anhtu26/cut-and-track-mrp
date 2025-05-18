/**
 * Global Authentication Functions
 * 
 * This file exports authentication functions to the global scope,
 * ensuring they're available throughout the application.
 * 
 * This is a temporary solution to fix the "signInWithPassword is not defined" error
 * while migrating from Supabase to a local authentication system.
 */

import { signInWithPassword, signOut, getSession, getUser } from './auth-implementation';

// Make the authentication functions available globally
declare global {
  interface Window {
    signInWithPassword: typeof signInWithPassword;
    signOut: typeof signOut;
    getSession: typeof getSession;
    getUser: typeof getUser;
  }
}

// Assign the functions to the global window object
if (typeof window !== 'undefined') {
  window.signInWithPassword = signInWithPassword;
  window.signOut = signOut;
  window.getSession = getSession;
  window.getUser = getUser;
  
  console.log('Global authentication functions registered successfully');
}

// Export the functions for direct imports
export {
  signInWithPassword,
  signOut,
  getSession,
  getUser
};

export default {
  signInWithPassword,
  signOut,
  getSession,
  getUser
};
