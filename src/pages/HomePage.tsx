import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SecretariaCard from "@/components/SecretariaCard";
import WhatsAppChat from "@/components/WhatsAppChat";
import PersistentChat from "@/components/PersistentChat";
import UserChatList from "@/components/UserChatList";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import SupportChatButton from "@/components/SupportChatButton";
import CookieConsent from "@/components/CookieConsent";
import ModernTechBackground from "@/components/ModernTechBackground";
import ModernLightTechBackground from "@/components/ModernLightTechBackground";
import Footer from "@/components/Footer";
import PrivacyNotice from "@/components/PrivacyNotice";
import AdminLogin from "@/pages/AdminLogin";
import EnhancedAdminDashboard from "@/components/EnhancedAdminDashboard";
import logoImage from "@/assets/micronet-logo.png";
import { useSupabaseSolicitacoes } from "@/hooks/useSupabaseSolicitacoes";

const secretarias = [
  "Secretaria Municipal de Planejamento e Finanças",
  "Secretaria Municipal de Saúde",
  "Secretaria Municipal de Obras, Viação e Urbanismo",
  "Secretaria Municipal de Educação",
  "Secretaria Municipal de Cidadania e Inclusão Social",
  "Secretaria Municipal de Cultura, Esporte, Turismo e Lazer",
  "Controladoria Interna",
  "Secretaria Municipal de Agricultura e Agronegócio",
  "Coordenadoria de Proteção e Defesa Civil",
  "Gabinete do Prefeito",
  "Secretaria Municipal de Administração",
  "Secretaria Municipal de Meio Ambiente",
  "Secretaria de Comunicação",
  "Contabilidade",
  "RH",
  "CPC",
  "Vigilância Sanitária",
  "Cadastro",
  "Patrimônio"
];

const HomePage = () => {
  const [selectedSecretaria, setSelectedSecretaria] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [userSolicitacao, setUserSolicitacao] = useState<any>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPersistentChat, setShowPersistentChat] = useState(false);
  const [selectedOpenSolicitacao, setSelectedOpenSolicitacao] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();
  const { solicitacoes, loading: loadingSolicitacoes } = useSupabaseSolicitacoes();

  // Detectar tema atual
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Observar mudanças no tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      const adminAuth = sessionStorage.getItem('adminAuth');
      if (adminAuth === 'true') {
        setIsAdmin(true);
      }
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Sincronizar chat persistente em tempo real quando houver atualizações
  useEffect(() => {
    if (selectedOpenSolicitacao) {
      const latest = solicitacoes.find((s: any) => s.protocolo === selectedOpenSolicitacao.protocolo);
      if (latest) {
        setSelectedOpenSolicitacao(latest);
      }
    }
  }, [solicitacoes, selectedOpenSolicitacao?.protocolo]);

  const handleSecretariaClick = (secretaria: string) => {
    console.log('Clicando na secretaria:', secretaria);
    setSelectedSecretaria(secretaria);

    // Verificar se tem conversas abertas dessa secretaria
    const openChats = solicitacoes.filter((s: any) => 
      s.secretaria === secretaria && 
      (s.status === 'Aguardando' || s.status === 'Aceita')
    );

    console.log('Conversas em aberto:', openChats);

    // Se não tem conversas abertas, abre o chat novo
    if (openChats.length === 0) {
      setShowChat(true);
      setShowPersistentChat(false);
      setSelectedOpenSolicitacao(null);
    }
    // Se tem conversas, não faz nada, deixa o usuário escolher na lista lateral
  };

  const handleSelectChatFromList = (solicitacao: any) => {
    setSelectedOpenSolicitacao(solicitacao);
    setShowPersistentChat(true);
    setShowChat(false);
  };

  const handleChatComplete = (data: any) => {
    setUserSolicitacao(data);
    setShowChat(false);
    
    // Abrir chat persistente imediatamente após criar a solicitação
    setSelectedOpenSolicitacao(data);
    setShowPersistentChat(true);
    
    toast({
      title: "Sucesso!",
      description: `Solicitação ${data.protocolo} registrada com sucesso.`,
    });
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUser');
  };

  // Loading screen dark theme com logo circular e bordas verdes pulsantes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gradient-to-br dark:from-background dark:to-muted bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative w-32 h-32 mx-auto">
            {/* Círculo com bordas verdes pulsantes */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-2 border-primary animate-ping"></div>
            
            {/* Logo circular */}
            <div className="absolute inset-4 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <img 
                src={logoImage}
                alt="Micronet Informática" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gradient">Service Desk TI</h2>
            <p className="text-muted-foreground">MICRONET SOLUÇÕES EM INFORMÁTICA</p>
            <p className="text-sm text-muted-foreground animate-slide-up">Inicializando sistema...</p>
          </div>
          
          <div className="w-64 mx-auto">
            <div className="glass rounded-full h-2 overflow-hidden">
              <div className="h-full gradient-primary animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated
  if (isAdmin) {
    return <EnhancedAdminDashboard />;
  }

  // Show admin login modal
  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen relative">
      {isDarkMode ? <ModernTechBackground /> : <ModernLightTechBackground />}
      <Header onAdminLogin={() => setShowAdminLogin(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Service Desk TI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema de atendimento técnico e suporte para todas as secretarias municipais.
            Registre sua solicitação e acompanhe o andamento do seu chamado.
          </p>
        </div>

        {/* Layout com lista de conversas e cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de conversas - aparece se tiver secretaria selecionada E tem conversas */}
          {selectedSecretaria && solicitacoes.filter((s: any) => s.secretaria === selectedSecretaria).length > 0 && (
            <div className="lg:col-span-1">
              <UserChatList
                secretaria={selectedSecretaria}
                solicitacoes={solicitacoes}
                onSelectChat={handleSelectChatFromList}
                onNewChamado={() => {
                  setShowChat(true);
                  setShowPersistentChat(false);
                  setSelectedOpenSolicitacao(null);
                }}
              />
            </div>
          )}

          {/* Cards de secretarias */}
          <div className={`${selectedSecretaria && solicitacoes.filter((s: any) => s.secretaria === selectedSecretaria).length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secretarias.map((secretaria) => (
                <SecretariaCard
                  key={secretaria}
                  nome={secretaria}
                  onClick={() => handleSecretariaClick(secretaria)}
                />
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />

      {/* Botão flutuante do WhatsApp */}
      <WhatsAppFloatingButton />
      
      {/* Notificação de privacidade */}
      <PrivacyNotice />

      {showChat && (
        <WhatsAppChat
          secretaria={selectedSecretaria}
          onClose={() => {
            setShowChat(false);
            setSelectedSecretaria("");
          }}
          onComplete={handleChatComplete}
        />
      )}

      {showPersistentChat && selectedOpenSolicitacao && (
        <PersistentChat
          solicitacao={selectedOpenSolicitacao}
          onClose={() => {
            setShowPersistentChat(false);
            setSelectedOpenSolicitacao(null);
          }}
          onUpdate={(updated) => {
            setSelectedOpenSolicitacao(updated);
          }}
        />
      )}

      <WhatsAppFloatingButton />
      <SupportChatButton />
      <PrivacyNotice />
      <CookieConsent />
    </div>
  );
};

export default HomePage;