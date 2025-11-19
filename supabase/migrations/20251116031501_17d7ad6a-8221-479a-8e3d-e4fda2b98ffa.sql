-- Adicionar campo locked na tabela solicitacoes
ALTER TABLE public.solicitacoes 
ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;