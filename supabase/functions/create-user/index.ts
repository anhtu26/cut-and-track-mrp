
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateUserRequest {
  email: string;
  password: string;
  role: 'Administrator' | 'Manager' | 'Staff' | 'Operator';
}

serve(async (req) => {
  // Create a Supabase client with the Auth context of the logged-in user
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
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Extract the token from the Authorization header
  const token = authHeader.replace('Bearer ', '')

  // Get the requesting user
  const {
    data: { user: callerUser },
    error: userError,
  } = await supabaseClient.auth.getUser(token)

  if (userError || !callerUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check if the user is an administrator
  const { data: userData, error: roleError } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', callerUser.id)
    .single()

  if (roleError || userData.role !== 'Administrator') {
    return new Response(JSON.stringify({ error: 'Unauthorized. Only administrators can create users.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse request body
  const { email, password, role } = await req.json() as CreateUserRequest

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
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Set the user's role
  const { error: roleUpdateError } = await supabaseAdmin
    .from('users')
    .update({ role, created_by: callerUser.id })
    .eq('id', newUser.user.id)

  if (roleUpdateError) {
    return new Response(JSON.stringify({ error: roleUpdateError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ user: newUser.user }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
