// src/hooks/useSupportChat.ts
import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3001/api";

export interface SupportMessage {
  id: string;
  chat_id: string;
  sender_type: "user" | "admin";
  message: string;
  timestamp: string;
  read?: number;
}

export interface SupportChat {
  id: string;
  session_id: string;
  name: string;
  cpf: string;
  phone: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at?: string | null;
}

/**
 * Hook de chat de suporte
 */
export function useSupportChat(chatId?: string) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  // Carrega mensagens periodicamente quando já existe chatId
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/support/chats/${chatId}/messages`
        );
        if (!response.ok) return;

        const data = await response.json();
        // backend retorna ARRAY direto (não { messages: [] })
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar mensagens do suporte:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  /**
   * Cria um novo chat de suporte
   */
  const createChat = useCallback(
    async (name: string, cpf: string, phone: string) => {
      // gera um session_id local (pra preencher o backend)
      const sessionId =
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)) + "-support";

      const body = {
        session_id: sessionId,
        cpf,
        name,
        phone,
      };

      const response = await fetch(`${API_BASE}/support/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error("Erro HTTP ao criar chat:", response.status);
        throw new Error("Falha ao criar chat de suporte");
      }

      const data = await response.json();
      console.log("Resposta bruta do backend em createChat:", data);

      let chat: SupportChat | undefined;

      if (Array.isArray(data)) {
        // se o backend retornou lista de chats, pegamos o último (mais recente)
        chat = data[data.length - 1] as SupportChat;
      } else if (data && typeof data === "object") {
        // se retornou um objeto único
        chat = data as SupportChat;
      }

      if (!chat || !chat.id) {
        console.error("Resposta inesperada ao criar chat:", data);
        throw new Error("Resposta inválida ao criar chat de suporte");
      }

      // ao criar, ainda não há mensagens
      setMessages([]);

      return chat;
    },
    []
  );

  /**
   * Envia uma mensagem em um chat existente
   */
  const sendMessage = useCallback(
    async (message: string, sender: "user" | "admin") => {
      if (!chatId) {
        throw new Error("Chat não iniciado");
      }

      const response = await fetch(
        `${API_BASE}/support/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_type: sender, // casa com o backend
            message,
          }),
        }
      );

      if (!response.ok) {
        let errorMsg = "Falha ao enviar mensagem";
        try {
          const data = await response.json();
          if (data && data.error) {
            errorMsg = data.error;
          }
        } catch {
          // ignora erro de parse
        }
        throw new Error(errorMsg);
      }

      const created = (await response.json()) as SupportMessage;
      setMessages((prev) => [...prev, created]);
    },
    [chatId]
  );

  return {
    messages,
    createChat,
    sendMessage,
  };
}
