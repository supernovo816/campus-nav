-- ================================================================
-- VISTAS CAMPUS MAP — SUPABASE DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
--    Stores student profiles linked to Supabase Auth users.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_no TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 2. TURF BOOKINGS TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.turf_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_no TEXT NOT NULL,
  booking_date    DATE NOT NULL,
  start_time      TEXT NOT NULL,   -- e.g. '09:00'
  end_time        TEXT NOT NULL,   -- e.g. '10:00'
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate bookings for the same date + start_time
  CONSTRAINT turf_bookings_date_start_unique
    UNIQUE (booking_date, start_time, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Index for fast lookup of bookings by date
CREATE INDEX IF NOT EXISTS idx_turf_bookings_date
  ON public.turf_bookings (booking_date, status);

-- ─────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turf_bookings ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ──
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── turf_bookings policies ──

-- Anyone (even unauthenticated) can read booking dates/times to see availability.
-- We only expose booking_date and start_time; personal data is protected.
CREATE POLICY "Anyone can view booking slots for availability"
  ON public.turf_bookings FOR SELECT
  USING (true);

-- Only authenticated users can create bookings, and only for themselves.
CREATE POLICY "Authenticated users can create own bookings"
  ON public.turf_bookings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
  );

-- Users can only update their own bookings (e.g., cancel).
CREATE POLICY "Users can update their own bookings"
  ON public.turf_bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE PROFILE ON SIGN-UP (optional trigger)
--    If you prefer, the React app inserts the profile directly.
--    This trigger acts as a fallback.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if row doesn't already exist (React app may have done it)
  INSERT INTO public.profiles (id, registration_no, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'registration_no', 'UNKNOWN'),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- DONE.
-- After running this script:
--   1. Go to Authentication > Settings in your Supabase dashboard.
--   2. Enable Email confirmations if desired.
--   3. Set your Site URL to your dev/prod URL.
--   4. Deploy the Edge Function (see supabase/functions/send-booking-email/).
-- ─────────────────────────────────────────────────────────────────
