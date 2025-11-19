-- Enable realtime for solicitacoes and chat_messages and ensure proper replica identity
-- 1) Set REPLICA IDENTITY FULL so updates stream full row data
ALTER TABLE public.solicitacoes REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- 2) Add tables to supabase_realtime publication (idempotent)
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.solicitacoes';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;