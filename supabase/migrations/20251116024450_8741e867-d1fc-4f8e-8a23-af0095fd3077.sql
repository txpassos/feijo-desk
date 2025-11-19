-- Criar função para adicionar novo usuário admin
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar se usuário já existe
  IF EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = p_username) THEN
    RAISE EXCEPTION 'Usuário já existe';
  END IF;
  
  -- Inserir novo usuário
  INSERT INTO public.admin_credentials (username, password_hash, is_master, active)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), false, true)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$;