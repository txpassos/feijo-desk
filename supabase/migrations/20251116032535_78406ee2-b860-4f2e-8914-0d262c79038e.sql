-- Prevent sending chat messages when the related solicitacao is locked
-- Create validation function and trigger on chat_messages
CREATE OR REPLACE FUNCTION public.prevent_chat_when_locked()
RETURNS trigger AS $$
DECLARE
  is_locked boolean;
BEGIN
  SELECT locked INTO is_locked FROM public.solicitacoes WHERE id = NEW.solicitacao_id;
  IF is_locked THEN
    RAISE EXCEPTION 'CONVERSATION_LOCKED: This conversation is locked by an administrator';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger (idempotent: drop if exists first)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prevent_chat_when_locked'
  ) THEN
    DROP TRIGGER trg_prevent_chat_when_locked ON public.chat_messages;
  END IF;
END $$;

CREATE TRIGGER trg_prevent_chat_when_locked
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_chat_when_locked();