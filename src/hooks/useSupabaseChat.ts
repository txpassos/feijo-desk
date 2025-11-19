import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_SERVER } from "@/utils/api";

interface ChatMessage {
  id: string;
  solicitacao_id: string;
  sender_id: string;
  sender_type: 'admin' | 'user';
  message: string;
  timestamp: Date;
  read: boolean;
}

const API_BASE = API_SERVER;

export const useSupabaseChat = (solicitacaoId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mapFromApi = (row: any): ChatMessage => ({
    id: row.id,
    solicitacao_id: row.solicitacao_id,
    sender_id: row.sender_id,
    sender_type: row.sender_type,
    message: row.message,
    timestamp: new Date(row.timestamp),
    read: !!row.read,
  });

  const loadMessages = async () => {
    if (!solicitacaoId) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/solicitacoes/${solicitacaoId}/chat`);
      if (!resp.ok) throw new Error('Falha ao carregar mensagens');
      const data = await resp.json();
      setMessages(data.map(mapFromApi));
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao carregar mensagens',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [solicitacaoId]);

  const sendMessage = async (payload: {
    sender_id: string;
    sender_type: 'admin' | 'user';
    message: string;
  }) => {
    if (!solicitacaoId) return;
    try {
      const resp = await fetch(`${API_BASE}/solicitacoes/${solicitacaoId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Falha ao enviar mensagem');
      const created = mapFromApi(await resp.json());
      setMessages(prev => [...prev, created]);
      return created;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: loadMessages,
  };
};