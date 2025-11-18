# Procedure: Migrating Sign Up to Supabase

## Objective
To replace the current mock sign-up logic in `AuthPage.tsx` with a secure call to the Supabase Authentication endpoint, creating a real user in the database.

## Prerequisites
1.  A Supabase project must be created.
2.  The project's **URL** and **Anon Key** must be available as environment variables (`SUPABASE_URL` and `SUPABASE_ANON_KEY`).
3.  The Supabase JS client library (`@supabase/supabase-js`) needs to be added to the project's dependencies or import map.

---

## Step 1: Create a Supabase Client

A singleton client is the best practice for interacting with Supabase.

1.  Create a new file at `services/supabaseClient.ts`.
2.  This file will initialize and export the client, making it accessible throughout the application.

#### `services/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Step 2: Update `AuthPage.tsx`

The `handleSubmit` function needs to be updated to call the Supabase service instead of the mock timer.

1.  Import the newly created Supabase client at the top of the file.
2.  Modify the `handleSubmit` function to be `async`.
3.  In the `!isLoginView` block (the sign-up logic), replace the `setTimeout` with an `async` call to `supabase.auth.signUp`.
4.  Handle the response from Supabase, setting an error message on failure or calling the success callback.

#### `AuthPage.tsx` (Updated Logic)
```typescript
import { supabase } from '@/services/supabaseClient';
// ... other imports

const AuthPage = ({ onAuthSuccess }) => {
  // ... existing state ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // ... existing validation ...

    setIsLoading(true);

    if (isLoginView) {
      // ... Login logic will be handled in login_migration.md
    } else {
      // SIGN UP LOGIC
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }
      
      // If email confirmation is required, you might show a message here.
      // For a simpler flow, we'll treat signup as an immediate login.
      if (data.user) {
        onAuthSuccess();
      } else {
        setError('An unknown error occurred during sign up.');
        setIsLoading(false);
      }
    }
  };

  // ... rest of the component
};
```

## Outcome
Upon successful completion of these steps, the sign-up form will create a new user in the Supabase project's `auth.users` table, and the user will be logged into the application.
