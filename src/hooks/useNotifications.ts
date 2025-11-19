import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  type: 'login' | 'deadline' | 'new_request' | 'chat_message' | 'support_message';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  metadata?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Real-time subscriptions
    const solicitacoesChannel = supabase
      .channel('notifications-solicitacoes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'solicitacoes'
        },
        (payload) => {
          const newNotification: Notification = {
            id: `new-request-${payload.new.id}`,
            type: 'new_request',
            title: 'Nova Solicitação',
            description: `Nova solicitação aguardando: ${payload.new.protocolo}`,
            timestamp: new Date(),
            read: false,
            metadata: payload.new
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'solicitacoes'
        },
        (payload) => {
          // Check if deadline is approaching (3 days)
          const prazo = new Date(payload.new.prazo);
          const now = new Date();
          const daysUntilDeadline = Math.ceil((prazo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0 && payload.new.status !== 'Resolvida') {
            const newNotification: Notification = {
              id: `deadline-${payload.new.id}-${Date.now()}`,
              type: 'deadline',
              title: 'Prazo Próximo',
              description: `Solicitação ${payload.new.protocolo} vence em ${daysUntilDeadline} dia(s)`,
              timestamp: new Date(),
              read: false,
              metadata: payload.new
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel('notifications-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.new.sender_type === 'user') {
            const newNotification: Notification = {
              id: `chat-${payload.new.id}`,
              type: 'chat_message',
              title: 'Nova Mensagem no Chat',
              description: `Nova mensagem em solicitação`,
              timestamp: new Date(payload.new.timestamp),
              read: false,
              metadata: payload.new
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    const supportChannel = supabase
      .channel('notifications-support')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages'
        },
        (payload) => {
          if (payload.new.sender_type === 'user') {
            const newNotification: Notification = {
              id: `support-${payload.new.id}`,
              type: 'support_message',
              title: 'Nova Mensagem no Suporte',
              description: `Nova mensagem no chat de suporte`,
              timestamp: new Date(payload.new.timestamp),
              read: false,
              metadata: payload.new
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(solicitacoesChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(supportChannel);
    };
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      // Load recent solicitacoes for deadline checking
      const { data: solicitacoes } = await supabase
        .from('solicitacoes')
        .select('*')
        .in('status', ['Aguardando', 'Aceita', 'Agendada'])
        .order('created_at', { ascending: false })
        .limit(50);

      const deadlineNotifications: Notification[] = [];
      const now = new Date();

      solicitacoes?.forEach((sol) => {
        const prazo = new Date(sol.prazo);
        const daysUntilDeadline = Math.ceil((prazo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
          deadlineNotifications.push({
            id: `deadline-${sol.id}`,
            type: 'deadline',
            title: 'Prazo Próximo',
            description: `Solicitação ${sol.protocolo} vence em ${daysUntilDeadline} dia(s)`,
            timestamp: new Date(sol.updated_at),
            read: false,
            metadata: sol
          });
        }
      });

      setNotifications(deadlineNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
};
