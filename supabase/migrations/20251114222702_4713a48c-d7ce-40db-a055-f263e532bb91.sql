-- Atualizar políticas para permitir operações sem autenticação
-- (já que o sistema usa admin via sessionStorage, não Supabase Auth)

-- Remover políticas antigas de admin
DROP POLICY IF EXISTS "Admins can update all requests" ON public.solicitacoes;
DROP POLICY IF EXISTS "Admins can delete requests" ON public.solicitacoes;
DROP POLICY IF EXISTS "Admins can update messages" ON public.chat_messages;

-- Criar novas políticas permitindo operações públicas
CREATE POLICY "Anyone can update requests"
  ON public.solicitacoes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete requests"
  ON public.solicitacoes
  FOR DELETE
  USING (true);

CREATE POLICY "Anyone can update messages"
  ON public.chat_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete messages"
  ON public.chat_messages
  FOR DELETE
  USING (true);