-- ============================================================================
-- ACLAP Event Management & Smart Ticket Booking System
-- Complete Supabase PostgreSQL Schema, Indexes, RLS Policies & Atomic RPCs
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Ensure existing registrations table supports membership_id
-- ----------------------------------------------------------------------------
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS membership_id TEXT;

CREATE INDEX IF NOT EXISTS idx_registrations_reg_no
  ON public.registrations (LOWER(registration_no));

CREATE INDEX IF NOT EXISTS idx_registrations_membership_id
  ON public.registrations (LOWER(membership_id));

-- ----------------------------------------------------------------------------
-- 1. Events Table (extends existing public.events safely)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  date TEXT,
  location TEXT,
  category TEXT DEFAULT 'Clinical Workshop',
  district TEXT,
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS venue TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS registration_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_capacity INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS booked_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS registration_type TEXT NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS member_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS non_member_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_limit INTEGER,
  ADD COLUMN IF NOT EXISTS allow_cash_payment BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS allow_online_payment BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_tickets_per_person INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_events_status_date
  ON public.events (status, event_date DESC);

-- ----------------------------------------------------------------------------
-- 2. Event Registrations Table (extends existing public.event_registrations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT,
  event_district TEXT,
  event_admin_email TEXT,
  uid TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  membership_id TEXT,
  organization TEXT,
  designation TEXT,
  district TEXT,
  transaction_id TEXT,
  member_type TEXT DEFAULT 'old',
  status TEXT NOT NULL DEFAULT 'pending',
  entered_by TEXT,
  is_admin_entry BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'non_member',
  ADD COLUMN IF NOT EXISTS member_registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS member_id TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS chapter_name TEXT,
  ADD COLUMN IF NOT EXISTS ticket_quantity INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_event_regs_event_id ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_email ON public.event_registrations (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_event_regs_user_id ON public.event_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_payment_status ON public.event_registrations (payment_status);
CREATE INDEX IF NOT EXISTS idx_event_regs_reg_status ON public.event_registrations (registration_status);
CREATE INDEX IF NOT EXISTS idx_event_regs_code ON public.event_registrations (registration_code);

-- ----------------------------------------------------------------------------
-- 3. Event Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  gateway_response JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_payments_reg_id ON public.event_payments (registration_id);
CREATE INDEX IF NOT EXISTS idx_event_payments_event_id ON public.event_payments (event_id);
CREATE INDEX IF NOT EXISTS idx_event_payments_status ON public.event_payments (status);

-- ----------------------------------------------------------------------------
-- 4. Event Tickets Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT UNIQUE NOT NULL,
  registration_id UUID UNIQUE NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  qr_token TEXT UNIQUE NOT NULL,
  ticket_status TEXT NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event_id ON public.event_tickets (event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_code ON public.event_tickets (ticket_code);
CREATE INDEX IF NOT EXISTS idx_event_tickets_status ON public.event_tickets (ticket_status);

-- ----------------------------------------------------------------------------
-- 5. Event Cash Verifications Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_cash_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID UNIQUE NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  expected_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(10, 2) NOT NULL DEFAULT 0,
  receipt_notes TEXT,
  verified_by TEXT,
  verified_by_email TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_cash_verif_event_id ON public.event_cash_verifications (event_id);

-- ----------------------------------------------------------------------------
-- 6. Event Check-ins Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID UNIQUE NOT NULL REFERENCES public.event_tickets(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_id TEXT,
  staff_email TEXT,
  checkin_status TEXT NOT NULL DEFAULT 'checked_in',
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_checkins_event_id ON public.event_checkins (event_id);

-- ----------------------------------------------------------------------------
-- 7. Event Audit Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.event_tickets(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_email TEXT,
  actor_role TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_audit_event_id ON public.event_audit_logs (event_id);
CREATE INDEX IF NOT EXISTS idx_event_audit_action ON public.event_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_event_audit_created ON public.event_audit_logs (created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. Sequences for Unique Ticket IDs & Provisional Registration IDs
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.event_ticket_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.event_reg_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_event_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('public.event_ticket_seq');
  RETURN 'EVT-' || to_char(NOW(), 'YYYY') || '-' || lpad(seq_val::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_event_reg_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('public.event_reg_code_seq');
  RETURN 'REG-' || to_char(NOW(), 'YYYY') || '-' || lpad(seq_val::TEXT, 6, '0');
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. Atomic RPC: Reserve Event Registration (Prevents Overbooking & Duplicates)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_event_registration(
  p_event_id UUID,
  p_user_id UUID,
  p_category TEXT,
  p_member_registration_id UUID,
  p_member_id TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_business_name TEXT,
  p_organization TEXT,
  p_city TEXT,
  p_chapter_name TEXT,
  p_ticket_quantity INTEGER,
  p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event public.events%ROWTYPE;
  v_effective_limit INTEGER;
  v_unit_fee NUMERIC(10, 2);
  v_total_amount NUMERIC(10, 2);
  v_reg_code TEXT;
  v_payment_status TEXT;
  v_reg_status TEXT;
  v_existing_count INTEGER;
  v_reg_id UUID;
BEGIN
  -- Lock event row to serialize concurrent bookings
  SELECT * INTO v_event
  FROM public.events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF v_event.status <> 'published' THEN
    RAISE EXCEPTION 'Event is not open for registration';
  END IF;

  IF v_event.registration_start_date IS NOT NULL AND NOW() < v_event.registration_start_date THEN
    RAISE EXCEPTION 'Registration has not started yet';
  END IF;

  IF v_event.registration_end_date IS NOT NULL AND NOW() > v_event.registration_end_date THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  IF p_category NOT IN ('member', 'non_member') THEN
    RAISE EXCEPTION 'Invalid registration category';
  END IF;

  IF v_event.registration_type = 'member_only' AND p_category <> 'member' THEN
    RAISE EXCEPTION 'This event is restricted to verified members only';
  END IF;

  IF v_event.registration_type = 'non_member_only' AND p_category <> 'non_member' THEN
    RAISE EXCEPTION 'This event is restricted to non-members only';
  END IF;

  IF p_ticket_quantity < 1 OR p_ticket_quantity > COALESCE(v_event.max_tickets_per_person, 1) THEN
    RAISE EXCEPTION 'Ticket quantity exceeds maximum allowed per person (%)', COALESCE(v_event.max_tickets_per_person, 1);
  END IF;

  -- Check effective capacity
  v_effective_limit := LEAST(
    COALESCE(v_event.total_capacity, 100),
    COALESCE(v_event.registration_limit, COALESCE(v_event.total_capacity, 100))
  );

  IF COALESCE(v_event.booked_count, 0) + p_ticket_quantity > v_effective_limit THEN
    RAISE EXCEPTION 'Not enough tickets available. Remaining: %', GREATEST(v_effective_limit - COALESCE(v_event.booked_count, 0), 0);
  END IF;

  -- Prevent duplicate active registration by email for same event
  SELECT COUNT(*) INTO v_existing_count
  FROM public.event_registrations
  WHERE event_id = p_event_id
    AND LOWER(email) = LOWER(p_email)
    AND registration_status IN ('confirmed', 'pending_verification');

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'An active registration already exists for this email in this event';
  END IF;

  -- Compute authoritative fee from DB
  IF v_event.is_free THEN
    v_unit_fee := 0;
  ELSIF p_category = 'member' THEN
    v_unit_fee := COALESCE(v_event.member_fee, 0);
  ELSE
    v_unit_fee := COALESCE(v_event.non_member_fee, 0);
  END IF;

  v_total_amount := v_unit_fee * p_ticket_quantity;

  -- Validate payment method
  IF v_total_amount <= 0 THEN
    v_payment_status := 'paid';
    v_reg_status := 'confirmed';
  ELSIF p_payment_method = 'online' THEN
    IF NOT COALESCE(v_event.allow_online_payment, TRUE) THEN
      RAISE EXCEPTION 'Online payment is disabled for this event';
    END IF;
    v_payment_status := 'pending';
    v_reg_status := 'pending_payment';
  ELSIF p_payment_method = 'cash' THEN
    IF NOT COALESCE(v_event.allow_cash_payment, TRUE) THEN
      RAISE EXCEPTION 'Cash payment is disabled for this event';
    END IF;
    v_payment_status := 'cash_pending';
    v_reg_status := 'pending_verification';
  ELSE
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  v_reg_code := public.generate_event_reg_code();

  INSERT INTO public.event_registrations (
    registration_code,
    event_id,
    event_title,
    event_district,
    event_admin_email,
    user_id,
    uid,
    category,
    member_type,
    member_registration_id,
    member_id,
    membership_id,
    full_name,
    email,
    phone,
    business_name,
    organization,
    city,
    chapter_name,
    district,
    ticket_quantity,
    unit_fee,
    total_amount,
    payment_method,
    payment_status,
    registration_status,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_reg_code,
    p_event_id,
    v_event.title,
    v_event.district,
    v_event.admin_email,
    p_user_id,
    COALESCE(p_user_id::TEXT, 'public'),
    p_category,
    CASE WHEN p_category = 'member' THEN 'old' ELSE 'new' END,
    p_member_registration_id,
    p_member_id,
    p_member_id,
    p_full_name,
    p_email,
    p_phone,
    p_business_name,
    COALESCE(p_organization, p_business_name),
    p_city,
    p_chapter_name,
    COALESCE(p_chapter_name, p_city),
    p_ticket_quantity,
    v_unit_fee,
    v_total_amount,
    CASE WHEN v_total_amount <= 0 THEN 'free' ELSE p_payment_method END,
    v_payment_status,
    v_reg_status,
    v_reg_status,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reg_id;

  -- Reserve seats immediately for free & cash_pending; for online reserve atomically too
  -- (abandoned pending_payment orders can be released/cancelled)
  UPDATE public.events
  SET booked_count = COALESCE(booked_count, 0) + p_ticket_quantity,
      updated_at = NOW()
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'id', v_reg_id,
    'registration_code', v_reg_code,
    'event_id', p_event_id,
    'unit_fee', v_unit_fee,
    'total_amount', v_total_amount,
    'payment_method', CASE WHEN v_total_amount <= 0 THEN 'free' ELSE p_payment_method END,
    'payment_status', v_payment_status,
    'registration_status', v_reg_status
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. Atomic RPC: Confirm Registration & Issue Ticket (Idempotent)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_event_ticket(
  p_registration_id UUID,
  p_ticket_code TEXT,
  p_qr_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg public.event_registrations%ROWTYPE;
  v_existing public.event_tickets%ROWTYPE;
  v_new_ticket public.event_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_reg
  FROM public.event_registrations
  WHERE id = p_registration_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  -- Idempotent: return existing ticket if already issued
  SELECT * INTO v_existing
  FROM public.event_tickets
  WHERE registration_id = p_registration_id;

  IF FOUND THEN
    RETURN to_jsonb(v_existing);
  END IF;

  UPDATE public.event_registrations
  SET payment_status = 'paid',
      registration_status = 'confirmed',
      status = 'confirmed',
      updated_at = NOW()
  WHERE id = p_registration_id;

  INSERT INTO public.event_tickets (
    ticket_code,
    registration_id,
    event_id,
    qr_token,
    ticket_status,
    issued_at
  ) VALUES (
    p_ticket_code,
    p_registration_id,
    v_reg.event_id,
    p_qr_token,
    'active',
    NOW()
  )
  RETURNING * INTO v_new_ticket;

  RETURN to_jsonb(v_new_ticket);
END;
$$;

-- ----------------------------------------------------------------------------
-- 11. Atomic RPC: Check In Ticket (Strictly Prevents Duplicate Check-ins)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.checkin_event_ticket(
  p_ticket_id UUID,
  p_staff_id TEXT,
  p_staff_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket public.event_tickets%ROWTYPE;
  v_reg public.event_registrations%ROWTYPE;
  v_checkin public.event_checkins%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket
  FROM public.event_tickets
  WHERE id = p_ticket_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Ticket not found');
  END IF;

  IF v_ticket.ticket_status = 'checked_in' THEN
    RETURN jsonb_build_object(
      'result', 'already_checked_in',
      'reason', 'Ticket has already been checked in',
      'checked_in_at', v_ticket.checked_in_at
    );
  END IF;

  IF v_ticket.ticket_status <> 'active' THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Ticket is cancelled or inactive');
  END IF;

  SELECT * INTO v_reg
  FROM public.event_registrations
  WHERE id = v_ticket.registration_id;

  IF NOT FOUND OR v_reg.registration_status <> 'confirmed' OR v_reg.payment_status <> 'paid' THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Registration is not confirmed or paid');
  END IF;

  INSERT INTO public.event_checkins (
    ticket_id,
    registration_id,
    event_id,
    staff_id,
    staff_email,
    checkin_status,
    checked_in_at
  ) VALUES (
    v_ticket.id,
    v_ticket.registration_id,
    v_ticket.event_id,
    p_staff_id,
    p_staff_email,
    'checked_in',
    NOW()
  )
  RETURNING * INTO v_checkin;

  UPDATE public.event_tickets
  SET ticket_status = 'checked_in',
      checked_in_at = v_checkin.checked_in_at
  WHERE id = v_ticket.id;

  RETURN jsonb_build_object(
    'result', 'success',
    'checkin_id', v_checkin.id,
    'checked_in_at', v_checkin.checked_in_at
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 12. Row Level Security (RLS) & Role-Based Access Policies
-- Note: Backend Express server uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- after verifying JWT + user role in Express middleware.
-- ----------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_cash_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public & authenticated users can view published events
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

-- Authenticated users can view their own event registrations
DROP POLICY IF EXISTS "Users can view own event registrations" ON public.event_registrations;
CREATE POLICY "Users can view own event registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );

-- Authenticated users can view their own tickets
DROP POLICY IF EXISTS "Users can view own event tickets" ON public.event_tickets;
CREATE POLICY "Users can view own event tickets"
  ON public.event_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.event_registrations er
      WHERE er.id = event_tickets.registration_id
        AND (er.user_id = auth.uid() OR LOWER(er.email) = LOWER(auth.jwt() ->> 'email'))
    )
  );

-- Authenticated users can view their own payment records
DROP POLICY IF EXISTS "Users can view own event payments" ON public.event_payments;
CREATE POLICY "Users can view own event payments"
  ON public.event_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.event_registrations er
      WHERE er.id = event_payments.registration_id
        AND (er.user_id = auth.uid() OR LOWER(er.email) = LOWER(auth.jwt() ->> 'email'))
    )
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
