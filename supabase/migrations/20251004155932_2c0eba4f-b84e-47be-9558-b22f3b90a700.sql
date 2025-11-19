-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_secretaria ON public.solicitacoes(secretaria);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_data_registro ON public.solicitacoes(data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_solicitacao ON public.chat_messages(solicitacao_id);

-- Inserir configurações padrão do sistema
INSERT INTO public.system_settings (key, value) 
VALUES 
  ('mensagem_fora_horario', 'No momento estamos fora do horário de atendimento. Seu chamado será registrado e responderemos em breve.')
ON CONFLICT (key) DO NOTHING;