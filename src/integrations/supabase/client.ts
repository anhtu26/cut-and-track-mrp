
/**
 * DEPRECATED - DO NOT USE
 * 
 * This Supabase client has been deprecated as part of the ITAR compliance migration.
 * All cloud services have been replaced with local API implementations.
 * 
 * Please use the local API client from '@/lib/api/client' instead.
 */

// Create a dummy object that throws errors if used
const createErrorProxy = () => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop !== 'then') { // Avoid breaking Promise checks
        return createErrorProxy();
      }
      return undefined;
    },
    apply: () => {
      throw new Error('Supabase client is deprecated. Use local API client instead.');
    }
  });
};

// Export a dummy supabase client that will throw errors if used
export const supabase = createErrorProxy();

console.warn('DEPRECATED: Supabase client is no longer supported. Please use the local API client instead.');

