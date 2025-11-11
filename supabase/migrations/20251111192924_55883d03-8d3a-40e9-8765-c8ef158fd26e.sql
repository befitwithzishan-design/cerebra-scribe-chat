-- Create telegram_users table to store user information
CREATE TABLE public.telegram_users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table for storing chat history (for future use)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT REFERENCES public.telegram_users(telegram_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for bot to function, can be restricted later)
CREATE POLICY "Allow service role full access to telegram_users"
  ON public.telegram_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to conversations"
  ON public.conversations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_telegram_users_telegram_id ON public.telegram_users(telegram_id);
CREATE INDEX idx_conversations_telegram_user_id ON public.conversations(telegram_user_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for telegram_users
CREATE TRIGGER update_telegram_users_updated_at
  BEFORE UPDATE ON public.telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();