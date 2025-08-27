
-- Enable Row Level Security
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_transactions ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_personal BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  direction VARCHAR(3) CHECK (direction IN ('IN', 'OUT')) NOT NULL,
  description TEXT,
  payee_phone VARCHAR(20),
  category_id UUID REFERENCES public.categories(id),
  transaction_type VARCHAR(20) DEFAULT 'MPESA',
  reference VARCHAR(50),
  is_personal BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'COMPLETED',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SMS transactions table
CREATE TABLE IF NOT EXISTS public.sms_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sms_text TEXT NOT NULL,
  sender_number VARCHAR(20),
  sim_card VARCHAR(10),
  account_type VARCHAR(20) DEFAULT 'personal',
  is_processed BOOLEAN DEFAULT false,
  parsed_amount DECIMAL(10,2),
  transaction_code VARCHAR(20),
  recipient_name VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security Policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own SMS transactions" ON public.sms_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMS transactions" ON public.sms_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SMS transactions" ON public.sms_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.categories (name, color, is_personal) VALUES
  ('Food & Supplies', '#10B981', false),
  ('Room Service', '#3B82F6', false),
  ('Cleaning Supplies', '#8B5CF6', false),
  ('Maintenance', '#F59E0B', false),
  ('Utilities', '#EF4444', false),
  ('Marketing', '#06B6D4', false),
  ('Transportation', '#84CC16', false),
  ('Office Supplies', '#6366F1', false)
ON CONFLICT DO NOTHING;
