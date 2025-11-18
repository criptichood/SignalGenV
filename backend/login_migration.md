# Procedure: Migrating Login to Supabase

## Objective
To replace the current mock login logic in `AuthPage.tsx` with a secure call to the Supabase Authentication endpoint, authenticating a user against the database.

## Prerequisites
1.  The `services/supabaseClient.ts` file, as detailed in the [Sign Up Migration Plan](./signup_migration.md), must be created and configured.

---

## Step 1: Update `AuthPage.tsx`

The `handleSubmit` function needs to be updated for the login view.

1.  Ensure the Supabase client is imported: `import { supabase } from '@/services/supabaseClient';`.
2.  Ensure the `handleSubmit` function is `async`.
3.  In the `isLoginView` block, replace the `setTimeout` with an `async` call to `supabase.auth.signInWithPassword`.
4.  Handle the response, setting an error message on failure or calling the success callback.

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
      // LOGIN LOGIC
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      onAuthSuccess();
    } else {
      // ... Sign up logic from signup_migration.md
    }
  };

  // ... rest of the component
};
```

## Outcome
Upon successful completion, the login form will now securely authenticate users against the Supabase project's `auth.users` table and grant them access to the application. Error messages from Supabase (e.g., "Invalid login credentials") will be displayed to the user.
