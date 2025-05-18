
/**
 * Supabase Client Proxy Implementation
 * 
 * This file provides a proxy implementation of the Supabase client
 * that redirects all calls to our local API implementation.
 * 
 * This allows existing code that uses Supabase to continue working
 * while we migrate to a fully local implementation for ITAR compliance.
 */

import supabaseClientProxy from '@/lib/supabase-client-proxy';

// Export the Supabase client proxy as the default client
export const supabase = supabaseClientProxy;

// Log that we're using the proxy implementation
console.log('Using Supabase client proxy for local authentication');

