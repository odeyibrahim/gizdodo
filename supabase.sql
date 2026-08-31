-- ============================================
-- GIZDODOSPECIALS — Supabase SQL Setup
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- ============================================

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number    TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  delivery_type   TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_area   TEXT,
  order_notes     TEXT,
  total           INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'payment_pending'
                    CHECK (status IN ('payment_pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  items           JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index for fast order number lookups (used by track page)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);

-- 3. Index for admin listing (newest first)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Allow anonymous inserts (customers placing orders from the website)
CREATE POLICY "anon_insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (true);

-- 6. Policy: Allow anonymous reads (track page + admin dashboard)
CREATE POLICY "anon_read" ON public.orders
  FOR SELECT TO anon
  USING (true);

-- 7. Policy: Allow anonymous updates (admin updating order status)
CREATE POLICY "anon_update" ON public.orders
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
