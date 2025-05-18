# Clean Authentication System

This directory contains the clean authentication implementation for the Cut-and-Track MRP system. This implementation replaces the previous Supabase-based authentication with a fully local solution for ITAR compliance.

## Architecture

The authentication system follows a clean architecture with separation of concerns:

- `auth-service.ts`: Core authentication service that handles all interactions with the API
- `auth-hooks.tsx`: React hooks for using authentication in components
- Backend authentication handled by JWT-based authentication middleware

## Usage

### React Components

Use the authentication provider at the root of your app:

```tsx
import { AuthProvider } from '@/lib/auth/auth-hooks';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

Then use the hooks in your components:

```tsx
import { useAuth, useUser, useIsAuthenticated } from '@/lib/auth/auth-hooks';

function LoginForm() {
  const { login, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Redirect or update UI
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </form>
  );
}

function ProfilePage() {
  const { user, loading } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome, {user.email}</div>;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useIsAuthenticated();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}
```

### Legacy Code

For compatibility with existing code that uses the Supabase-style authentication, we provide a compatible interface in `@/lib/auth-implementation.ts`:

```ts
import auth from '@/lib/auth-implementation';

// Use Supabase-compatible methods
const result = await auth.signInWithPassword({ email, password });
await auth.signOut();
const session = await auth.getSession();
```

## Migration Guide

To migrate a component from Supabase to the new authentication system:

1. Replace Supabase imports with hooks:
   ```diff
   - import { supabase } from '@/lib/supabase';
   + import { useAuth } from '@/lib/auth/auth-hooks';
   ```

2. Use the hooks instead of direct Supabase calls:
   ```diff
   - const handleLogin = async () => {
   -   const { data, error } = await supabase.auth.signInWithPassword({
   -     email, password
   -   });
   -   if (error) setError(error.message);
   - };
   
   + const { login, error } = useAuth();
   + const handleLogin = async () => {
   +   await login(email, password);
   + };
   ```

3. For authentication state, use the provided hooks:
   ```diff
   - const [user, setUser] = useState(null);
   - useEffect(() => {
   -   const { data } = await supabase.auth.getUser();
   -   setUser(data.user);
   - }, []);
   
   + const { user } = useUser();
   ```

## Security Considerations

- JWT tokens are stored in localStorage and have a 24-hour expiration
- Authentication state is synchronized across browser tabs
- All authentication API endpoints are properly secured with HTTPS in production
