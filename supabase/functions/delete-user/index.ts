
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Add CORS headers to support browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No Authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    // Get the requesting user - use try/catch to handle potential auth errors
    let callerUser;
    try {
      console.log('Getting user from auth token');
      const { data, error } = await supabaseClient.auth.getUser(token)
      
      if (error || !data.user) {
        console.error('Auth error:', error);
        return new Response(JSON.stringify({ error: 'Unauthorized', details: error }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      callerUser = data.user;
      console.log('User retrieved successfully:', callerUser.id);
    } catch (authError) {
      console.error('Exception in auth check:', authError);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if the user is an administrator
    console.log('Checking user role');
    const { data: userData, error: roleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify user role', details: roleError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (userData.role !== 'Administrator') {
      console.log('User is not an administrator');
      return new Response(JSON.stringify({ error: 'Unauthorized. Only administrators can delete users.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    let userId;
    try {
      const { userId: requestUserId } = await req.json();
      userId = requestUserId;
      console.log('Deleting user with ID:', userId);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if the user is trying to delete themselves
    if (userId === callerUser.id) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user role to check if they're an administrator
    const { data: targetUserData, error: targetRoleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetRoleError) {
      console.error('Target role check error:', targetRoleError);
      return new Response(JSON.stringify({ error: 'Failed to verify target user role', details: targetRoleError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Count administrators to ensure we're not deleting the last administrator
    if (targetUserData.role === 'Administrator') {
      const { count: adminCount, error: countError } = await supabaseClient
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'Administrator');
        
      if (countError) {
        console.error('Error counting administrators:', countError);
        return new Response(JSON.stringify({ error: 'Failed to verify administrator count', details: countError }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
        
      if (adminCount <= 1) {
        return new Response(JSON.stringify({ error: 'Cannot delete the only administrator' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Use service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )

    // Delete the user from auth
    console.log('Deleting user from auth system');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('User deletion error:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
