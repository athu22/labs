-- ============================================================================
-- ACLAP Smart Event Attendance, QR Scanner & WhatsApp Automation Module
-- Complete All-in-One SQL Schema, Foreign Keys, Indexes & Atomic RPCs
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Ensure existing registrations table supports membership_id
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS membership_id TEXT;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. Events Table (safe create/extend)
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
  ADD COLUMN IF NOT EXISTS event_end_date DATE,
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
-- 2. Event Registrations Table
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
  ADD COLUMN IF NOT EXISTS member_registration_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'non_member',
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
CREATE INDEX IF NOT EXISTS idx_event_regs_payment_status ON public.event_registrations (payment_status);
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

-- ----------------------------------------------------------------------------
-- 4. Event Tickets Table (Required BEFORE event_attendee_activities)
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

-- ----------------------------------------------------------------------------
-- 6. Event Check-ins Table (Legacy Venue Entry)
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

-- ----------------------------------------------------------------------------
-- 7. Event Attendee Activities Table (Entry, Welcome Kit, Breakfast, Lunch)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_attendee_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('entry', 'welcome_kit', 'breakfast', 'lunch')),
  activity_status TEXT NOT NULL DEFAULT 'completed' CHECK (activity_status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_by TEXT NOT NULL,
  staff_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_registration_activity UNIQUE (registration_id, activity_type)
);

CREATE INDEX IF NOT EXISTS idx_attendee_act_event_type ON public.event_attendee_activities (event_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_attendee_act_ticket ON public.event_attendee_activities (ticket_id);
CREATE INDEX IF NOT EXISTS idx_attendee_act_reg ON public.event_attendee_activities (registration_id);

-- ----------------------------------------------------------------------------
-- 8. Event Staff Permissions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_user_id TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  can_checkin BOOLEAN NOT NULL DEFAULT FALSE,
  can_distribute_welcome_kit BOOLEAN NOT NULL DEFAULT FALSE,
  can_distribute_breakfast BOOLEAN NOT NULL DEFAULT FALSE,
  can_distribute_lunch BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_staff_perm UNIQUE (event_id, staff_user_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_perm_event ON public.event_staff_permissions (event_id);
CREATE INDEX IF NOT EXISTS idx_staff_perm_user ON public.event_staff_permissions (staff_user_id);

-- ----------------------------------------------------------------------------
-- 9. Event WhatsApp Notification Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  notify_registration BOOLEAN NOT NULL DEFAULT TRUE,
  notify_entry BOOLEAN NOT NULL DEFAULT FALSE,
  notify_welcome_kit BOOLEAN NOT NULL DEFAULT FALSE,
  notify_breakfast BOOLEAN NOT NULL DEFAULT FALSE,
  notify_lunch BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. WhatsApp Message Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.event_tickets(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  whatsapp_message_id TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'simulated')),
  error_message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_logs_event_type ON public.whatsapp_message_logs (event_id, message_type);
CREATE INDEX IF NOT EXISTS idx_wa_logs_status ON public.whatsapp_message_logs (delivery_status);

-- ----------------------------------------------------------------------------
-- 11. Event Audit Logs Table
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

-- ----------------------------------------------------------------------------
-- 12. Ticket Code & Registration Code Sequences & Generator Functions
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
-- 13. Atomic RPC: Issue Event Ticket (Idempotent)
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
-- 14. Atomic RPC: Check In Ticket (Legacy entry)
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

  -- Also record into event_attendee_activities
  INSERT INTO public.event_attendee_activities (
    event_id,
    registration_id,
    ticket_id,
    activity_type,
    activity_status,
    completed_at,
    completed_by,
    staff_email
  ) VALUES (
    v_ticket.event_id,
    v_ticket.registration_id,
    v_ticket.id,
    'entry',
    'completed',
    v_checkin.checked_in_at,
    p_staff_id,
    p_staff_email
  )
  ON CONFLICT (registration_id, activity_type) DO NOTHING;

  RETURN jsonb_build_object(
    'result', 'success',
    'checkin_id', v_checkin.id,
    'checked_in_at', v_checkin.checked_in_at
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 15. Atomic RPC: Record Attendee Activity (Unified Entry, Kit, Breakfast, Lunch)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_attendee_activity(
  p_event_id UUID,
  p_ticket_id UUID,
  p_activity_type TEXT,
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
  v_existing public.event_attendee_activities%ROWTYPE;
  v_new_activity public.event_attendee_activities%ROWTYPE;
BEGIN
  IF p_activity_type NOT IN ('entry', 'welcome_kit', 'breakfast', 'lunch') THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Invalid activity type');
  END IF;

  SELECT * INTO v_ticket
  FROM public.event_tickets
  WHERE id = p_ticket_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Ticket not found');
  END IF;

  IF v_ticket.event_id <> p_event_id THEN
    RETURN jsonb_build_object('result', 'invalid', 'reason', 'Ticket belongs to a different event');
  END IF;

  SELECT * INTO v_reg
  FROM public.event_registrations
  WHERE id = v_ticket.registration_id;

  IF NOT FOUND OR v_reg.registration_status <> 'confirmed' OR v_reg.payment_status <> 'paid' THEN
    RETURN jsonb_build_object('result', 'unauthorized_ticket', 'reason', 'Ticket is unpaid, cancelled, or unconfirmed');
  END IF;

  SELECT * INTO v_existing
  FROM public.event_attendee_activities
  WHERE registration_id = v_ticket.registration_id
    AND activity_type = p_activity_type;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'result', 'already_completed',
      'reason', 'Activity already completed',
      'activity_type', p_activity_type,
      'completed_at', v_existing.completed_at,
      'completed_by', v_existing.staff_email
    );
  END IF;

  INSERT INTO public.event_attendee_activities (
    event_id,
    registration_id,
    ticket_id,
    activity_type,
    activity_status,
    completed_at,
    completed_by,
    staff_email
  ) VALUES (
    p_event_id,
    v_ticket.registration_id,
    v_ticket.id,
    p_activity_type,
    'completed',
    NOW(),
    p_staff_id,
    p_staff_email
  )
  RETURNING * INTO v_new_activity;

  IF p_activity_type = 'entry' THEN
    UPDATE public.event_tickets
    SET ticket_status = 'checked_in',
        checked_in_at = v_new_activity.completed_at
    WHERE id = v_ticket.id;

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
      p_event_id,
      p_staff_id,
      p_staff_email,
      'checked_in',
      v_new_activity.completed_at
    )
    ON CONFLICT (ticket_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'result', 'success',
    'activity_id', v_new_activity.id,
    'activity_type', p_activity_type,
    'completed_at', v_new_activity.completed_at,
    'completed_by', p_staff_email
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 16. Enable RLS and Reload Schema Cache
-- ----------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_cash_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendee_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

NOTIFY pgrst, 'reload schema';
