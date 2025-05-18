/**
 * Supabase Client Replacement
 * 
 * This file exports the Supabase client proxy as the default export,
 * allowing it to be used as a drop-in replacement for the Supabase client.
 * This helps with the migration from Supabase to a local authentication system
 * without having to change all references at once.
 */

import supabaseClientProxy from './supabase-client-proxy';

// Export the Supabase client proxy as the default export
export default supabaseClientProxy;

// Export the createClient function that returns the proxy
export const createClient = () => supabaseClientProxy;

// Export a helper function to check if the client is initialized
export const isInitialized = () => true;
