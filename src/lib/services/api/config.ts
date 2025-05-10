/**
 * API configuration settings for Cut and Track MRP
 */

// Configure API URL from environment or default to localhost in development
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// Default API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Export constants for use in API services
export default {
  API_URL,
  API_TIMEOUT
};
