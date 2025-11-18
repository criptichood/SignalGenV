# Backend Migration Plan: Supabase

This directory contains the procedural documents for migrating the application's mock frontend functionality to a robust, scalable backend powered by Supabase.

Our goal is to progressively replace all mock data and client-side logic with real-time, secure, and persistent data managed by a production-grade backend.

## Current Focus: Authentication

The first and most critical step is to migrate user authentication from the current mock implementation to **Supabase Auth**. This will provide secure user registration, login, and session management.

### Migration Procedures

1.  [**Sign Up Migration Plan**](./signup_migration.md): Details the steps to connect the registration form to Supabase.
2.  [**Login Migration Plan**](./login_migration.md): Details the steps to connect the login form to Supabase.
