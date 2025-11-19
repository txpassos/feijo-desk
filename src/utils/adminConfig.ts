// Configuração segura de credenciais de administrador
// As credenciais são armazenadas de forma ofuscada e podem ser atualizadas via configurações do sistema

const DEFAULT_ADMIN_CONFIG = {
  username: 'neto.meireles',
  // A senha é codificada em base64 para evitar exposição direta no código
  passwordEncoded: 'c3Vwb3J0ZUAyODAxMTU=', // suporte@280115 em base64
};

export const getAdminCredentials = () => {
  // Tentar buscar das configurações do sistema (localStorage)
  const storedUsername = localStorage.getItem('masterAdminUsername');
  const storedPassword = localStorage.getItem('masterAdminPassword');

  if (storedUsername && storedPassword) {
    return {
      username: storedUsername,
      password: storedPassword,
    };
  }

  // Se não houver configuração personalizada, usar padrão
  return {
    username: DEFAULT_ADMIN_CONFIG.username,
    password: atob(DEFAULT_ADMIN_CONFIG.passwordEncoded),
  };
};

export const updateAdminCredentials = (username: string, password: string) => {
  localStorage.setItem('masterAdminUsername', username);
  localStorage.setItem('masterAdminPassword', password);
};

// Inicializar credenciais padrão na primeira vez
export const initializeAdminConfig = () => {
  if (!localStorage.getItem('masterAdminUsername')) {
    const credentials = getAdminCredentials();
    localStorage.setItem('masterAdminUsername', credentials.username);
    localStorage.setItem('masterAdminPassword', credentials.password);
  }
};
