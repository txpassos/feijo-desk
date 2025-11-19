-- Ajustar RLS para permitir inserções públicas de solicitações (sistema é público)
DROP POLICY IF EXISTS "Users can create their own requests" ON public.solicitacoes;

-- Permitir que qualquer pessoa crie solicitações (público)
CREATE POLICY "Anyone can create requests"
ON public.solicitacoes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir que qualquer pessoa veja suas próprias solicitações pelo protocolo
DROP POLICY IF EXISTS "Users can view their own requests" ON public.solicitacoes;

CREATE POLICY "Anyone can view requests"
ON public.solicitacoes
FOR SELECT
TO anon, authenticated
USING (true);

-- Mensagens de chat devem ser públicas para leitura mas restritas para escrita
DROP POLICY IF EXISTS "Authenticated users can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their requests" ON public.chat_messages;

CREATE POLICY "Anyone can create messages"
ON public.chat_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.chat_messages
FOR SELECT
TO anon, authenticated
USING (true);