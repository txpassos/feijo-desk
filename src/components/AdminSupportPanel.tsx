// src/components/AdminSupportPanel.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface SupportChat {
  id: string;
  session_id?: string;
  name: string;
  cpf: string;
  phone: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at?: string | null;
  ip_address?: string | null;
  device_info?: string | null;
  geolocation?: string | null;
}

interface SupportMessage {
  id: string;
  chat_id: string;
  sender_type: "user" | "admin";
  message: string;
  timestamp: string;
  read?: number;
}

const AdminSupportPanel = () => {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // =====================
  // Carregar lista de chats
  // =====================
  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const res = await fetch(`${API_BASE}/support/chats`);
      if (!res.ok) {
        console.error("Erro ao carregar chats de suporte:", res.status);
        setChats([]);
        return;
      }
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar chats de suporte:", err);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // =====================
  // Carregar mensagens de um chat (função simples)
  // =====================
  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`${API_BASE}/support/chats/${chatId}/messages`);
      if (!res.ok) {
        console.error("Erro ao carregar mensagens do chat:", res.status);
        setMessages([]);
        return;
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar mensagens do chat:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chat: SupportChat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  // =====================
  // Auto-refresh das mensagens do chat selecionado
  // =====================
  useEffect(() => {
    if (!selectedChat) return;

    // carrega imediatamente ao trocar de chat
    fetchMessages(selectedChat.id);

    const interval = setInterval(() => {
      fetchMessages(selectedChat.id);
    }, 3000); // atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, [selectedChat?.id]); // depende do id do chat selecionado

  // =====================
  // Enviar mensagem como admin
  // =====================
  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      setSending(true);
      const res = await fetch(
        `${API_BASE}/support/chats/${selectedChat.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_type: "admin",
            message: newMessage,
          }),
        }
      );

      if (!res.ok) {
        console.error("Erro ao enviar mensagem de suporte (admin):", res.status);
        return;
      }

      const created = (await res.json()) as SupportMessage;
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch (err) {
      console.error("Erro ao enviar mensagem de suporte (admin):", err);
    } finally {
      setSending(false);
    }
  };

  // =====================
  // Fechar chat
  // =====================
  const handleCloseChat = async () => {
    if (!selectedChat) return;

    try {
      const res = await fetch(
        `${API_BASE}/support/chats/${selectedChat.id}/close`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        console.error("Erro ao fechar chat:", res.status);
        return;
      }

      const updated = (await res.json()) as SupportChat;

      setChats((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSelectedChat(updated);
    } catch (err) {
      console.error("Erro ao fechar chat:", err);
    }
  };

  // =====================
  // Derivados (evitam .filter em undefined)
  // =====================
  const openChats = (chats || []).filter((c) => c.status === "open");
  const closedChats = (chats || []).filter((c) => c.status === "closed");

  return (
    <div className="flex gap-4 h-full">
      {/* Lista de chats */}
      <Card className="w-1/3 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Atendimentos de Suporte</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChats}
            disabled={loadingChats}
          >
            {loadingChats ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar"
            )}
          </Button>
        </div>

        <Tabs defaultValue="open" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 m-4">
            <TabsTrigger value="open">Abertos</TabsTrigger>
            <TabsTrigger value="closed">Fechados</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="flex-1 px-4">
            <ScrollArea className="h-[360px]">
              <div className="space-y-2">
                {openChats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum chat aberto.
                  </p>
                ) : (
                  openChats.map((chat) => (
                    <Card
                      key={chat.id}
                      className={`p-3 cursor-pointer border ${
                        selectedChat?.id === chat.id
                          ? "border-primary"
                          : "border-border"
                      }`}
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{chat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            CPF: {chat.cpf}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Telefone: {chat.phone || "-"}
                          </p>
                        </div>
                        <span className="text-xs">
                          {new Date(chat.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="closed" className="flex-1 px-4">
            <ScrollArea className="h-[360px]">
              <div className="space-y-2">
                {closedChats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum chat fechado.
                  </p>
                ) : (
                  closedChats.map((chat) => (
                    <Card
                      key={chat.id}
                      className={`p-3 cursor-pointer border ${
                        selectedChat?.id === chat.id
                          ? "border-primary"
                          : "border-border"
                      }`}
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{chat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            CPF: {chat.cpf}
                          </p>
                        </div>
                        <span className="text-xs">
                          {new Date(chat.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Detalhes do chat selecionado */}
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Detalhes do Atendimento</h3>
            {selectedChat && (
              <p className="text-xs text-muted-foreground">
                {selectedChat.name} — CPF {selectedChat.cpf} —{" "}
                {selectedChat.phone || "sem telefone"}
              </p>
            )}
          </div>
          {selectedChat && selectedChat.status === "open" && (
            <Button variant="outline" size="sm" onClick={handleCloseChat}>
              Encerrar chat
            </Button>
          )}
        </div>

        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecione um chat de suporte na lista ao lado.
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Nenhuma mensagem ainda. Responda o usuário para iniciar o
                    atendimento.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === "user"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 text-sm ${
                          msg.sender_type === "user"
                            ? "bg-muted"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span className="text-[10px] opacity-70 mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          — {msg.sender_type === "user" ? "Usuário" : "Admin"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input do admin */}
            <div className="p-4 border-t flex gap-2">
              {selectedChat?.status !== "open" ? (
                <div className="text-sm text-muted-foreground">
                  Este atendimento foi encerrado. Não é possível enviar novas mensagens.
                </div>
              ) : (
                <>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !sending && handleSendMessage()
                    }
                    placeholder="Digite sua resposta para o usuário..."
                    disabled={sending}
                  />
                  <Button onClick={handleSendMessage} disabled={sending}>
                    {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Enviar
                  </Button>
                </>
              )}
            </div>

          </>
        )}
      </Card>
    </div>
  );
};

export default AdminSupportPanel;
