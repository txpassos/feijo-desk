import { useState, useEffect } from "react";
import { Send, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generatePDFComprovante } from "@/components/PDFGenerator";

// usa o hook já existente (adaptado para API local)
import { useSupabaseChat } from "@/hooks/useSupabaseChat";

interface ChatMessage {
  id: string;
  solicitacao_id: string;
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
}

interface PersistentChatProps {
  solicitacao: Solicitacao;
  onClose: () => void;
  onUpdate: (updated: Solicitacao) => void;
}

const PersistentChat = ({ solicitacao, onClose }: PersistentChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(solicitacao.locked || false);
  const { toast } = useToast();

  // hook de chat que já está falando com a API local
  const { messages, sendMessage: sendChatMessage } = useSupabaseChat(
    solicitacao.id
  );

  // sempre que a solicitação mudar, atualiza o lock
  useEffect(() => {
    setIsLocked(solicitacao.locked || false);
  }, [solicitacao.locked]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !solicitacao.id) return;

    if (isLocked) {
      toast({
        title: "Conversa Finalizada",
        description: "Esta conversa foi trancada pelo administrador.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // mesma interface que usamos no AdminChatPanel
      await sendChatMessage({
        sender_id: solicitacao.id || "user",
        sender_type: "user",
        message: newMessage,
      });

      setNewMessage("");

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadComprovante = () => {
    try {
      generatePDFComprovante(solicitacao);
      toast({
        title: "Comprovante baixado",
        description: "PDF baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível baixar o comprovante",
        variant: "destructive",
      });
    }
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "Aguardando":
        return "Aguardando aprovação";
      case "Aceita":
        return "Agendamento confirmado";
      case "Cancelada":
        return "Cancelado";
      case "Resolvida":
        return "Resolvido";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
      <Card className="w-full max-w-md h-[85vh] sm:h-[80vh] flex flex-col bg-background/95 backdrop-blur-md border shadow-2xl">
        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3 bg-primary text-primary-foreground">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarFallback className="bg-primary-dark text-white text-xs sm:text-sm">
                TI
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs sm:text-sm truncate">
                Service Desk TI
              </h3>
              <p className="text-[10px] sm:text-xs opacity-90 truncate">
                {solicitacao.protocolo}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <Badge
              className={`text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 ${getStatusColor(
                solicitacao.status
              )}`}
            >
              {getStatusText(solicitacao.status)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-dark h-7 w-7 sm:h-8 sm:w-8"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* CONTEÚDO */}
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-2 sm:p-4 bg-gradient-to-b from-muted/20 to-muted/10">
            <div className="space-y-4">
              {/* BLOCO INICIAL */}
              <div className="flex justify-start">
                <div className="max-w-[85%] order-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        TI
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Service Desk
                    </span>
                  </div>
                  <div className="bg-background border rounded-2xl rounded-bl-md mr-2 p-3">
                    <p className="text-sm mb-2">
                      📋 <strong>Solicitação Registrada</strong>
                    </p>
                    <p className="text-sm">
                      <strong>Protocolo:</strong> {solicitacao.protocolo}
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong> {getStatusText(solicitacao.status)}
                    </p>
                    <p className="text-sm">
                      <strong>Secretaria:</strong> {solicitacao.secretaria}
                    </p>
                    {solicitacao.subsecretaria && (
                      <p className="text-sm">
                        <strong>Área:</strong> {solicitacao.subsecretaria}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>Setor:</strong> {solicitacao.setor}
                    </p>
                    <p className="text-sm">
                      <strong>Descrição:</strong> {solicitacao.descricao}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {solicitacao.dataRegistro.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>

              {/* MENSAGENS */}
              {messages.map((message: ChatMessage) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[85%]">
                    {message.sender_type === "admin" && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary text-white text-xs">
                            TI
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          Service Desk
                        </span>
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        message.sender_type === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md ml-2"
                          : "bg-background border rounded-bl-md mr-2"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.message}
                      </p>

                      {message.message.includes("comprovante") &&
                        message.sender_type === "admin" && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={downloadComprovante}
                              className="w-full"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Baixar Comprovante
                            </Button>
                          </div>
                        )}

                      <div className="text-xs opacity-60 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border p-3 rounded-2xl rounded-bl-md mr-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* INPUT (se não estiver resolvida/cancelada) */}
          {solicitacao.status !== "Resolvida" &&
            solicitacao.status !== "Cancelada" && (
              <div className="p-3 bg-background border-t">
                {isLocked && (
                  <p className="text-center text-xs text-muted-foreground mb-1">
                    Esta conversa foi trancada pelo administrador.
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      isLocked ? "Conversa trancada..." : "Digite..."
                    }
                    disabled={isLoading || isLocked}
                    className="flex-1"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isLocked && sendMessage()
                    }
                  />

                  <Button
                    size="icon"
                    className="rounded-full gradient-primary"
                    disabled={isLocked || isLoading || !newMessage.trim()}
                    onClick={sendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersistentChat;