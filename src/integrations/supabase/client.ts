
import { createClient } from '@supabase/supabase-js';

// Get the current URL to determine if we're running locally or in production
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Initialize the Supabase client with appropriate URL and key
// For local development, use the local Supabase instance if running on localhost
export const supabase = createClient(
  isLocalhost 
    ? 'http://localhost:54321'  // Local Supabase URL
    : 'https://xydntmjbpdzcyjdumnrg.supabase.co', // Production Supabase URL
  isLocalhost
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZG50bWpicGR6Y3lqZHVtbnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDM1NzAsImV4cCI6MjA2MDMxOTU3MH0.K88YsqVWQ4IwqrRaoXI1F6rjT9Ue_Ori7ShlzzRm3_A'  // Local Anon Key
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZG50bWpicGR6Y3lqZHVtbnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDM1NzAsImV4cCI6MjA2MDMxOTU3MH0.K88YsqVWQ4IwqrRaoXI1F6rjT9Ue_Ori7ShlzzRm3_A'  // Production Anon Key
);

console.log('Supabase client initialized with URL:', isLocalhost ? 'http://localhost:54321' : 'https://xydntmjbpdzcyjdumnrg.supabase.co');
