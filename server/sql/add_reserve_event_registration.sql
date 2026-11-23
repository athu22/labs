-- Ensure required column exists on event_registrations table
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS member_registration_id UUID;

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

  -- Reserve seats immediately
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

NOTIFY pgrst, 'reload schema';
