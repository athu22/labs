-- ----------------------------------------------------------------------------
-- Add Multi-Day Support: Event End Date column to events table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'events' 
      AND column_name = 'event_end_date'
  ) THEN
    ALTER TABLE public.events ADD COLUMN event_end_date DATE;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
