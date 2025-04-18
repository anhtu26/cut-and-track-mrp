
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateUserRequest {
  email: string;
  password: string;
  role: 'Administrator' | 'Manager' | 'Staff' | 'Operator';
}

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
      return new Response(JSON.stringify({ error: 'Unauthorized. Only administrators can create users.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    let email, password, role;
    try {
      const requestBody = await req.json() as CreateUserRequest;
      email = requestBody.email;
      password = requestBody.password;
      role = requestBody.role;
      console.log('Creating user with email:', email, 'and role:', role);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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

    // Create the new user
    console.log('Creating user in Auth system');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('User creation error:', createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('User created successfully, setting role:', role);

    // Insert the user's record with role into the users table
    const { error: roleInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email: email,
        role: role
      })

    if (roleInsertError) {
      console.error('Role insert error:', roleInsertError);
      return new Response(JSON.stringify({ error: roleInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
