
# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created (usually takes 1-2 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root with:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql` and run it
3. This will create all necessary tables with proper security policies

## 5. Enable Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email authentication
3. Configure any additional auth providers if needed

## 6. Test the Connection

1. Restart your development server: `npm run dev`
2. Check the browser console for "Supabase client initialized successfully"
3. Try creating an account and logging in

## Current Status

- ✅ Database schema ready
- ✅ Row Level Security enabled
- ✅ Frontend integration complete
- ✅ Authentication flow configured

The app will automatically detect if Supabase is configured and switch from demo mode to live data.
