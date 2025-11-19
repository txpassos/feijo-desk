// src/components/SupportChatWindow.tsx
import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupportChat } from "@/hooks/useSupportChat";
import { useToast } from "@/hooks/use-toast";

interface SupportChatWindowProps {
  onClose: () => void;
}

const SupportChatWindow = ({ onClose }: SupportChatWindowProps) => {
  const [step, setStep] = useState<"info" | "chat">("info");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, createChat, sendMessage } = useSupportChat(
    currentChatId || undefined
  );
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = async () => {
    if (!name || !cpf || !phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const chat = await createChat(name, cpf, phone);
      console.log("Resposta do createChat:", chat);

      if (!chat || !chat.id) {
        // evita o TypeError e mostra erro mais claro
        throw new Error("Resposta inválida ao criar chat de suporte");
      }

      setCurrentChatId(String(chat.id));
      setStep("chat");
      toast({
        title: "Chat iniciado",
        description: "Aguarde, um atendente responderá em breve.",
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Erro ao iniciar chat",
        description: "Não foi possível abrir o chat de suporte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatId || isClosed) return;
  
    try {
      await sendMessage(newMessage, "user");
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      const msg = error?.message || "Falha ao enviar mensagem";
  
      if (msg.includes("encerrado")) {
        setIsClosed(true);
        toast({
          title: "Atendimento encerrado",
          description:
            "Este chat foi encerrado. Se precisar, inicie um novo atendimento.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: "Tente novamente em instantes.",
          variant: "destructive",
        });
      }
    }
  };
  

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3"
      );
    }
    return value;
  };

  return (
    <Card className="fixed bottom-24 right-6 z-50 w-96 h-[500px] shadow-2xl animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <h3 className="font-semibold">Chat de Suporte</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      {step === "info" ? (
        <div className="flex-1 p-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Informações Básicas</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, preencha seus dados para iniciar o atendimento.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="text-sm font-medium">CPF</label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          <Button
            onClick={handleStartChat}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              "Iniciar Chat"
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aguardando atendente...
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender_type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            {isClosed ? (
              <div className="text-sm text-muted-foreground text-center">
                Este atendimento foi encerrado. Para falar novamente com a equipe,
                inicie um novo chat.
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default SupportChatWindow;
