-- ==============================================================================
-- TradeOS Master PostgreSQL & Supabase Database Migration
-- Multi-Tenant Schema for Nigerian Businesses (Retail, Pharmacy, Boutique, Agro, etc.)
-- Compatible with standalone Neon PostgreSQL and Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure auth schema and dummy uid helper exists for standalone PostgreSQL (e.g. Neon)
CREATE SCHEMA IF NOT EXISTS auth;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = 'auth'::regnamespace) THEN
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $func$
      SELECT '00000000-0000-0000-0000-000000000000'::uuid;
    $func$ LANGUAGE SQL STABLE;
  END IF;
END $$;

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  is_platform_admin BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUSINESSES (TENANTS)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  category TEXT NOT NULL, -- retail, boutique, supermarket, pharmacy, electronics, agro
  currency_code TEXT DEFAULT 'NGN',
  country_code TEXT DEFAULT 'NG',
  phone_number TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  subscription_plan_id TEXT DEFAULT 'plan_free',
  subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled
  subscription_expires_at TIMESTAMPTZ,
  invoice_prefix TEXT DEFAULT 'INV-',
  receipt_prefix TEXT DEFAULT 'REC-',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANCHES / OUTLETS
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  phone_number TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAFF & BRANCH ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL, -- owner, manager, cashier, stock_keeper, accountant
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT CATEGORIES & INVENTORY
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT,
  description TEXT,
  cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  quantity_on_hand NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  reorder_level NUMERIC(15, 2) DEFAULT 5.00,
  unit_of_measure TEXT DEFAULT 'pcs',
  is_service BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, sku)
);

-- 6. CUSTOMERS & SUPPLIERS (DEBTORS & CREDITORS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  credit_limit NUMERIC(15, 2) DEFAULT 0.00,
  outstanding_debt NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  outstanding_balance NUMERIC(15, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. POS SALES & SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  cashier_staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  change_returned NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL, -- cash, card, bank_transfer, credit, split
  payment_status TEXT NOT NULL, -- paid, partial, unpaid
  synced_from_offline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  sku_snapshot TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  cost_price NUMERIC(15, 2) NOT NULL,
  line_total NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICES & INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL,
  discount_amount NUMERIC(15, 2) DEFAULT 0.00,
  total_amount NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued', -- draft, issued, paid, overdue, canceled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  line_total NUMERIC(15, 2) NOT NULL
);

-- 9. EXPENSES & CASHBOOK ENTRIES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- rent, electricity, generator_fuel, salaries, logistics, etc.
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  date DATE NOT NULL,
  paid_to TEXT,
  payment_method TEXT DEFAULT 'cash',
  recorded_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_products_business_branch ON public.products(business_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_business_branch_created ON public.sales(business_id, branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id, due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON public.expenses(business_id, date DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND policyname = 'Users can manage businesses they own'
  ) THEN
    CREATE POLICY "Users can manage businesses they own" 
    ON public.businesses FOR ALL 
    USING (auth.uid() = owner_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can access products for their business'
  ) THEN
    CREATE POLICY "Users can access products for their business" 
    ON public.products FOR ALL 
    USING (
      business_id IN (
        SELECT id FROM public.businesses WHERE owner_user_id = auth.uid()
      )
    );
  END IF;
END $$;
