-- Add device and location tracking fields to solicitacoes
ALTER TABLE public.solicitacoes 
ADD COLUMN IF NOT EXISTS device_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS geolocation jsonb DEFAULT '{}'::jsonb;

-- Create table for real-time support chat (quick questions, not service requests)
CREATE TABLE IF NOT EXISTS public.support_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  name text NOT NULL,
  cpf text NOT NULL,
  phone text NOT NULL,
  device_info jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  geolocation jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for support chat messages
CREATE TABLE IF NOT EXISTS public.support_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.support_chats(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message text NOT NULL,
  read boolean DEFAULT false,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_chats
CREATE POLICY "Anyone can create support chats"
  ON public.support_chats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view support chats"
  ON public.support_chats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update support chats"
  ON public.support_chats FOR UPDATE
  USING (true);

-- RLS policies for support_chat_messages
CREATE POLICY "Anyone can create support messages"
  ON public.support_chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view support messages"
  ON public.support_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update support messages"
  ON public.support_chat_messages FOR UPDATE
  USING (true);

-- Enable realtime
ALTER TABLE public.support_chats REPLICA IDENTITY FULL;
ALTER TABLE public.support_chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'support_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chats;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'support_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_messages;
  END IF;
END $$;