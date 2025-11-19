-- Criar tabela para solicitações
CREATE TABLE public.solicitacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE,
  secretaria TEXT NOT NULL,
  setor TEXT,
  funcao TEXT NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prazo TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Aguardando', 'Aceita', 'Cancelada', 'Resolvida')),
  responsavel TEXT,
  local_atendimento TEXT,
  data_agendamento TIMESTAMP WITH TIME ZONE,
  nivel TEXT CHECK (nivel IN ('Nivel I', 'Nivel II')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para mensagens de chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'user')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitacoes (acesso público para leitura e escrita - service desk público)
CREATE POLICY "Permitir leitura de todas solicitações"
ON public.solicitacoes
FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de solicitações"
ON public.solicitacoes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de solicitações"
ON public.solicitacoes
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de solicitações"
ON public.solicitacoes
FOR DELETE
USING (true);

-- Políticas para chat_messages
CREATE POLICY "Permitir leitura de mensagens"
ON public.chat_messages
FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de mensagens"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de mensagens"
ON public.chat_messages
FOR UPDATE
USING (true);

-- Políticas para system_settings
CREATE POLICY "Permitir leitura de configurações"
ON public.system_settings
FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de configurações"
ON public.system_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de configurações"
ON public.system_settings
FOR UPDATE
USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_solicitacoes_updated_at
BEFORE UPDATE ON public.solicitacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER TABLE public.solicitacoes REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.solicitacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;