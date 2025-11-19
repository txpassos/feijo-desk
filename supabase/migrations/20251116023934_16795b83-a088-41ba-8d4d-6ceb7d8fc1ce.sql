-- Criar tabela para credenciais de administradores
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_master BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT
);

-- Habilitar RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar credenciais
CREATE POLICY "Only admins can manage credentials"
ON public.admin_credentials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Criar função para hash de senha (bcrypt simulado com crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para verificar credenciais
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  is_master BOOLEAN,
  active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.username,
    ac.is_master,
    ac.active
  FROM public.admin_credentials ac
  WHERE ac.username = p_username
    AND ac.password_hash = crypt(p_password, ac.password_hash)
    AND ac.active = true;
    
  -- Atualizar último login se encontrado
  UPDATE public.admin_credentials
  SET last_login = now()
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash)
    AND active = true;
END;
$$;

-- Inserir credencial master padrão (usuario: neto.meireles, senha: suporte@280115)
INSERT INTO public.admin_credentials (username, password_hash, is_master, active)
VALUES ('neto.meireles', crypt('suporte@280115', gen_salt('bf')), true, true)
ON CONFLICT (username) DO NOTHING;