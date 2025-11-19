import { useState, useEffect } from "react";
import {
  Send,
  Search,
  MessageSquare,
  Clock,
  Download,
  Lock,
  Unlock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { generatePDFComprovante } from "@/components/PDFGenerator";
import { useSupabaseChat } from "@/hooks/useSupabaseChat"; // já convertido para API local
import { API_SERVER } from "@/utils/api";

const API_BASE = API_SERVER;

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: "admin" | "user";
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Solicitacao {
  id?: string;
  protocolo: string;
  secretaria: string;
  subsecretaria?: string;
  setor: string;
  funcao: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: "Aguardando" | "Aceita" | "Cancelada" | "Resolvida";
  anexos: File[];
  responsavel?: string;
  localAtendimento?: string;
  dataAgendamento?: Date;
  locked?: boolean;
  chat?: {
    messages: ChatMessage[];
    isActive: boolean;
    lastActivity: Date;
  };
}

interface AdminChatPanelProps {
  solicitacoes: Solicitacao[];
  onUpdateSolicitacao: (updated: Solicitacao) => Promise<void>;
}

const AdminChatPanel = ({
  solicitacoes,
  onUpdateSolicitacao,
}: AdminChatPanelProps) => {
  const [selectedChat, setSelectedChat] = useState<Solicitacao | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Hook de chat – agora via API local
  const { messages, sendMessage: sendChatMessage } = useSupabaseChat(
    selectedChat?.id
  );

  // -- Mantém comportamento atual --
  useEffect(() => {
    if (selectedChat) {
      const updatedChat = solicitacoes.find(
        (s) => s.protocolo === selectedChat.protocolo
      );
      if (
        updatedChat &&
        JSON.stringify(updatedChat.chat) !== JSON.stringify(selectedChat.chat)
      ) {
        setSelectedChat(updatedChat);
      }
    }
  }, [solicitacoes, selectedChat?.protocolo]);

  // -- Filtragem --
  const activeChats = solicitacoes.filter(
    (s) => s.status !== "Resolvida" && s.status !== "Cancelada"
  );

  const filteredChats = activeChats.filter((chat) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      chat.nome.toLowerCase().includes(t) ||
      chat.protocolo.toLowerCase().includes(t) ||
      chat.secretaria.toLowerCase().includes(t) ||
      chat.setor.toLowerCase().includes(t)
    );
  });

  // ============================
  //  ⬇️  ENVIAR MENSAGEM (LOCAL)
  // ============================

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !selectedChat.id) return;

    if (selectedChat.locked) {
      toast({
        title: "Conversa Finalizada",
        description:
          "Esta conversa foi trancada. Destranque para enviar mensagens.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendChatMessage({
        sender_id: sessionStorage.getItem("adminId") || "admin",
        sender_type: "admin",
        message: newMessage,
      });

      setNewMessage("");

      toast({
        title: "Mensagem enviada",
        description: `Mensagem enviada para ${selectedChat.nome}`,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  // =====================================================
  //  ⬇️  ALTERAR LOCK DA CONVERSA (AGORA 100% LOCAL)
  // =====================================================

  const toggleLock = async (solicitacao: Solicitacao) => {
    if (!solicitacao.id) return;

    try {
      const newLocked = !solicitacao.locked;

      const resp = await fetch(
        `${API_BASE}/solicitacoes/${solicitacao.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locked: newLocked }),
        }
      );

      if (!resp.ok) throw new Error("Falha ao atualizar lock");

      const updated = {
        ...solicitacao,
        locked: newLocked,
      };

      await onUpdateSolicitacao(updated);

      toast({
        title: newLocked ? "Conversa trancada" : "Conversa destrancada",
        description: newLocked
          ? "O usuário não pode mais enviar mensagens."
          : "O usuário pode enviar mensagens novamente.",
      });

      if (selectedChat?.id === solicitacao.id) setSelectedChat(updated);
    } catch (error) {
      console.error("Erro ao trancar/destrancar conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da conversa",
        variant: "destructive",
      });
    }
  };

  // =====================================================
  //  ⬇️  PDF
  // =====================================================

  const generateComprovante = (s: Solicitacao) => {
    try {
      generatePDFComprovante(s);
      toast({
        title: "Comprovante gerado",
        description: "PDF baixado com sucesso",
      });
    } catch (e) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive",
      });
    }
  };

  // Helpers visuais
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aguardando":
        return "bg-yellow-500";
      case "Aceita":
        return "bg-green-500";
      case "Cancelada":
        return "bg-orange-500";
      case "Resolvida":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLastMessage = (chat?: { messages: ChatMessage[] }) => {
    if (!chat || chat.messages.length === 0) return "Nenhuma mensagem";
    return chat.messages[chat.messages.length - 1].message.substring(0, 50);
  };

  const getUnreadCount = (chat?: { messages: ChatMessage[] }) => {
    if (!chat) return 0;
    return chat.messages.filter(
      (m) => m.sender_type === "user" && !m.read
    ).length;
  };

  // =====================================================
  //  ⬇️  INTERFACE
  // =====================================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

      {/* LISTA DE CONVERSAS */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Conversas Ativas
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredChats.map((chat) => {
              const unread = getUnreadCount(chat.chat);
              const selected = selectedChat?.protocolo === chat.protocolo;

              return (
                <div
                  key={chat.protocolo}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b cursor-pointer transition-all 
                    hover:bg-muted/50
                    ${selected ? "bg-primary/10 border-primary/30" : ""}
                    ${chat.locked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {chat.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium truncate">
                            {chat.nome}
                          </h4>
                          {chat.locked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unread}
                            </Badge>
                          )}
                          <Badge
                            className={`text-white ${getStatusColor(
                              chat.status
                            )}`}
                          >
                            {chat.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {chat.protocolo} • {chat.secretaria}
                      </p>

                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {getLastMessage(chat.chat)}
                      </p>

                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {chat.chat?.lastActivity
                          ? new Date(
                              chat.chat.lastActivity
                            ).toLocaleString("pt-BR")
                          : chat.dataRegistro.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ÁREA DO CHAT */}
      <Card className="glass lg:col-span-2">
        {selectedChat ? (
          <>
            {/* HEADER */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarFallback>
                        {selectedChat.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedChat.nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.protocolo} • {selectedChat.setor}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={selectedChat.locked ? "destructive" : "outline"}
                    onClick={() => toggleLock(selectedChat)}
                  >
                    {selectedChat.locked ? (
                      <>
                        <Lock className="mr-1 h-4 w-4" />
                        Trancada
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-1 h-4 w-4" />
                        Aberta
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateComprovante(selectedChat)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>

                  <Badge
                    className={`text-white ${getStatusColor(
                      selectedChat.status
                    )}`}
                  >
                    {selectedChat.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* MENSAGENS */}
            <CardContent className="flex flex-col h-[400px] p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Mensagem de abertura */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">
                        📋 Nova Solicitação
                      </p>
                      <p className="text-sm">
                        <strong>Descrição:</strong> {selectedChat.descricao}
                      </p>
                      <p className="text-sm">
                        <strong>Local:</strong> {selectedChat.endereco}
                      </p>
                      <p className="text-sm">
                        <strong>Função:</strong> {selectedChat.funcao}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedChat.dataRegistro.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Chat */}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          m.sender_type === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{m.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {m.timestamp.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* ENVIAR MENSAGEM */}
              <div className="p-4 border-t">
                {selectedChat.locked && (
                  <div className="mb-2 text-sm text-muted-foreground text-center">
                    Esta conversa está trancada. Destranque para enviar
                    mensagens.
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      selectedChat.locked
                        ? "Conversa trancada..."
                        : "Digite sua mensagem..."
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      !selectedChat.locked &&
                      sendMessage()
                    }
                    disabled={selectedChat.locked}
                    className="flex-1"
                  />

                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || selectedChat.locked}
                    className="gradient-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminChatPanel;