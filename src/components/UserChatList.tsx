import { useState, useEffect } from "react";
import { MessageSquare, Clock, AlertCircle, CheckCircle, XCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'admin' | 'user';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Solicitacao {
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
  status: 'Aguardando' | 'Aceita' | 'Cancelada' | 'Resolvida';
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

interface UserChatListProps {
  secretaria: string;
  solicitacoes: Solicitacao[];
  onSelectChat: (solicitacao: Solicitacao) => void;
  onNewChamado: () => void;
}

const UserChatList = ({ secretaria, solicitacoes, onSelectChat, onNewChamado }: UserChatListProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filtrar conversas da secretaria atual
  const secretariaChats = solicitacoes.filter(s => s.secretaria === secretaria);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando': return 'bg-yellow-500';
      case 'Aceita': return 'bg-green-500';
      case 'Cancelada': return 'bg-orange-500';
      case 'Resolvida': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aguardando': return <Clock className="h-4 w-4" />;
      case 'Aceita': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelada': return <XCircle className="h-4 w-4" />;
      case 'Resolvida': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getLastMessage = (chat?: { messages: ChatMessage[] }) => {
    if (!chat || chat.messages.length === 0) return "Nenhuma mensagem ainda";
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.message.substring(0, 50) + (lastMsg.message.length > 50 ? "..." : "");
  };

  const getUnreadCount = (chat?: { messages: ChatMessage[] }) => {
    if (!chat) return 0;
    return chat.messages.filter(m => m.senderType === 'admin' && !m.read).length;
  };

  const handleChatClick = (solicitacao: Solicitacao) => {
    // Se está cancelado, resolvido ou trancado, não abre
    if (solicitacao.status === 'Cancelada' || solicitacao.status === 'Resolvida' || solicitacao.locked) {
      return;
    }
    setSelectedId(solicitacao.protocolo);
    onSelectChat(solicitacao);
  };

  const getChatMessage = (solicitacao: Solicitacao) => {
    if (solicitacao.locked) {
      return (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Esta conversa foi finalizada pelo administrador
          </AlertDescription>
        </Alert>
      );
    }
    if (solicitacao.status === 'Cancelada') {
      return (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Este agendamento foi cancelado
          </AlertDescription>
        </Alert>
      );
    }
    if (solicitacao.status === 'Resolvida') {
      return (
        <Alert className="mt-2 bg-blue-500/10 border-blue-500">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-500">
            Este chamado já foi finalizado
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Conversas - {secretaria}
          </CardTitle>
          <Button
            size="sm"
            onClick={onNewChamado}
            className="gradient-primary h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Chamado
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {secretariaChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma conversa nesta secretaria</p>
            </div>
          ) : (
            secretariaChats.map((solicitacao) => {
              const unreadCount = getUnreadCount(solicitacao.chat);
              const isSelected = selectedId === solicitacao.protocolo;
              const isClickable = solicitacao.status !== 'Cancelada' && solicitacao.status !== 'Resolvida' && !solicitacao.locked;
              
              return (
                <div key={solicitacao.protocolo}>
                  <div
                    onClick={() => handleChatClick(solicitacao)}
                    className={`p-4 border-b transition-colors ${
                      isClickable ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed opacity-30'
                    } ${isSelected ? 'bg-primary/10 border-primary/30' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {solicitacao.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate text-sm">{solicitacao.nome}</h4>
                          <div className="flex items-center space-x-1">
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs h-5">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-white text-xs ${getStatusColor(solicitacao.status)}`}>
                            {getStatusIcon(solicitacao.status)}
                            <span className="ml-1">{solicitacao.status}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground truncate">
                            {solicitacao.protocolo}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {getLastMessage(solicitacao.chat)}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {solicitacao.chat?.lastActivity 
                            ? new Date(solicitacao.chat.lastActivity).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(solicitacao.dataRegistro).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  {getChatMessage(solicitacao)}
                </div>
              );
            })
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserChatList;
