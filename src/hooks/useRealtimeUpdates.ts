import { useEffect, useState } from 'react';

interface Solicitacao {
  protocolo: string;
  secretaria: string;
  setor: string;
  funcao: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: 'Aguardando' | 'Aceita' | 'Cancelada' | 'Resolvida';
  anexos: File[];
  responsavel?: string;
  localAtendimento?: string;
  dataAgendamento?: Date;
  nivel?: 'Nivel I' | 'Nivel II';
  acceptedAt?: Date;
  chat?: {
    messages: {
      id: string;
      senderId: string;
      senderType: 'admin' | 'user';
      message: string;
      timestamp: Date;
      read: boolean;
    }[];
    isActive: boolean;
    lastActivity: Date;
  };
}

export const useRealtimeUpdates = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [channel] = useState(() => {
    // Verificar se BroadcastChannel está disponível (pode não estar em alguns browsers mobile)
    if (typeof BroadcastChannel !== 'undefined') {
      return new BroadcastChannel('solicitacoes-updates');
    }
    return null;
  });

  useEffect(() => {
    // Carregar dados iniciais
    const loadData = () => {
      const saved = localStorage.getItem('solicitacoes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((s: any) => {
            const chat = s.chat ? {
              ...s.chat,
              lastActivity: s.chat.lastActivity ? new Date(s.chat.lastActivity) : undefined,
              messages: Array.isArray(s.chat.messages)
                ? s.chat.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                  }))
                : []
            } : undefined;

            return {
              ...s,
              dataRegistro: new Date(s.dataRegistro),
              prazo: new Date(s.prazo),
              dataAgendamento: s.dataAgendamento ? new Date(s.dataAgendamento) : undefined,
              acceptedAt: s.acceptedAt ? new Date(s.acceptedAt) : undefined,
              chat
            };
          });
          setSolicitacoes(parsed);
        } catch (error) {
          console.error('Erro ao carregar solicitações:', error);
          setSolicitacoes([]);
        }
      }
    };

    loadData();

    // Escutar mudanças do BroadcastChannel (se disponível)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_SOLICITACOES') {
        loadData(); // Recarregar do localStorage
      }
    };

    if (channel) {
      channel.addEventListener('message', handleMessage);
    }

    // Escutar mudanças no localStorage (principal método para compatibilidade mobile)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'solicitacoes') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling adicional para garantir sincronização (especialmente em mobile)
    const pollInterval = setInterval(() => {
      loadData();
    }, 3000); // Recarregar a cada 3 segundos

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [channel]);

  const updateSolicitacoes = (newSolicitacoes: Solicitacao[]) => {
    try {
      localStorage.setItem('solicitacoes', JSON.stringify(newSolicitacoes));
      setSolicitacoes(newSolicitacoes);
      
      // Notificar outras abas/componentes (se BroadcastChannel disponível)
      if (channel) {
        channel.postMessage({ type: 'UPDATE_SOLICITACOES', data: newSolicitacoes });
      }
      
      // Disparar evento customizado para garantir sincronização
      window.dispatchEvent(new CustomEvent('solicitacoes-updated', { 
        detail: newSolicitacoes 
      }));
    } catch (error) {
      console.error('Erro ao atualizar solicitações:', error);
    }
  };

  return { solicitacoes, updateSolicitacoes };
};