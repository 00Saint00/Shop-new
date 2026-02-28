# Database Trigger Setup Guide

## ✅ What Was Changed

1. **Created SQL triggers** (`supabase-triggers.sql`) that automatically:
   - Create user and customer records when someone signs up
   - Set `approved: false` initially
   - Update `approved: true` when email is verified

2. **Updated AuthPage.tsx**:
   - Removed manual database inserts (triggers handle this now)
   - Only handles avatar upload and update
   - Passes user metadata to Supabase auth

3. **Updated App.tsx**:
   - Checks email verification status
   - Updates `approved` field when email is verified (backup check)
   - Includes `approved` field in profile queries

4. **Updated authSlice.tsx**:
   - Added `approved` field to Profile type

## 🚀 Setup Steps

### Step 1: Run SQL Triggers in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-triggers.sql` from this project
4. Copy and paste the entire SQL code into the SQL Editor
5. Click **Run** to execute

This will:
- Add `approved` columns to your tables (if they don't exist)
- Create triggers for automatic user creation
- Create triggers for email verification approval
- Create cleanup function (optional)

### Step 2: Verify Triggers Are Working

After running the SQL, verify the triggers exist:

```sql
-- Check triggers
SELECT * FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'on_email_confirmed');

-- Check functions
SELECT proname FROM pg_proc 
WHERE proname IN ('handle_new_user', 'handle_email_confirmation');
```

### Step 3: Test the Flow

1. **Register a new user**:
   - The trigger will automatically create records in `users` and `customers` tables
   - Both will have `approved: false`

2. **Verify email**:
   - When user clicks the verification link in their email
   - The trigger will automatically set `approved: true` in both tables

3. **Check the database**:
   ```sql
   SELECT id, email, full_name, approved FROM users;
   SELECT id, approved FROM customers;
   ```

## 🔒 RLS Policies

Make sure your Row Level Security (RLS) policies allow:

1. **Users can insert their own record** (for the trigger to work):
   ```sql
   CREATE POLICY "Users can insert own profile"
   ON users FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```

2. **Users can read their own profile**:
   ```sql
   CREATE POLICY "Users can read own profile"
   ON users FOR SELECT
   USING (auth.uid() = id);
   ```

3. **Users can update their own profile**:
   ```sql
   CREATE POLICY "Users can update own profile"
   ON users FOR UPDATE
   USING (auth.uid() = id);
   ```

## 🧹 Optional: Schedule Cleanup

To automatically delete unverified users after 7 days:

1. Enable `pg_cron` extension in Supabase
2. Run this in SQL Editor:
   ```sql
   SELECT cron.schedule(
     'cleanup-unverified', 
     '0 2 * * *', 
     'SELECT cleanup_unverified_users()'
   );
   ```

This runs daily at 2 AM and deletes users with `approved: false` older than 7 days.

## 🐛 Troubleshooting

### Issue: "Database error saving new user" on registration
This means the trigger ran but failed, so the whole sign-up transaction was rolled back.

1. **Get the real error**  
   Supabase Dashboard → **Logs** → **Postgres Logs** (or **Database** → **Logs**). Look for the exact error when you try to register (e.g. column missing, NOT NULL violation, foreign key).

2. **Match table schemas**  
   The trigger expects:

   - **`public.users`**: columns `id` (uuid), `email` (text), `full_name` (text), `avatar` (text nullable), `role` (text), `approved` (boolean).  
     No extra **NOT NULL** columns without defaults, or the trigger must set them.

   - **`public.customers`**: columns `id` (uuid), `phone` (text nullable), `address` (text nullable), `approved` (boolean).  
     Same rule: no NOT NULL columns that the trigger doesn’t set.

3. **Confirm triggers exist**  
   In SQL Editor run:
   ```sql
   SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   If this returns no row, run `supabase-triggers.sql` in this project’s Supabase SQL Editor.

4. **RLS**  
   The trigger uses `SECURITY DEFINER`, so it runs as the function owner and normally bypasses RLS. If you still see permission errors in Postgres logs, ensure the function owner has permission to INSERT into `public.users` and `public.customers`.

### Issue: Users table not getting populated
- **Check**: Did you run the SQL triggers?
- **Check**: Are RLS policies allowing inserts?
- **Check**: Look at Supabase logs for errors

### Issue: Approved not updating after email verification
- **Check**: Is the email verification trigger created?
- **Check**: Does `auth.users.email_confirmed_at` have a value?
- **Note**: App.tsx has a backup check, but the trigger should handle it automatically

### Issue: Avatar not saving
- **Check**: Storage bucket "avatars" exists and has proper policies
- **Check**: User has permission to upload to storage
- **Note**: Avatar upload happens after user creation, so it's a separate update

## 📝 Notes

- The trigger uses `SECURITY DEFINER` to bypass RLS when creating records
- The trigger uses `ON CONFLICT DO NOTHING` to prevent errors if records already exist
- Avatar is handled separately because it needs to be uploaded first, then updated
- The `approved` field starts as `false` and becomes `true` after email verification
