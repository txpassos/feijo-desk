import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, CheckCircle, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getBusinessHoursMessage as getConfiguredBusinessHours, addBusinessDays } from "@/utils/adminSettings";
import { useSupabaseSolicitacoes } from "@/hooks/useSupabaseSolicitacoes";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface WhatsAppChatProps {
  secretaria: string;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const WhatsAppChat = ({ secretaria, onClose, onComplete }: WhatsAppChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    secretaria,
    subsecretaria: "",
    setor: "",
    funcao: "",
    nome: "",
    endereco: "",
    sala: "",
    descricao: "",
    anexos: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { createSolicitacao } = useSupabaseSolicitacoes();
  const { toast } = useToast();

  const getSteps = () => {
    if (
      secretaria === "Secretaria Municipal de Saúde" ||
      secretaria === "Secretaria Municipal de Educação" ||
      secretaria === "Secretaria Municipal de Administração"
    ) {
      return [
        "subsecretaria",
        "Qual é o setor ou subsetor da sua solicitação?",
        "Qual é a sua função/cargo no setor?",
      "Por favor, informe seu nome completo:",
      "Informe o local de onde você deseja o atendimento (endereço completo: rua, bairro, município):",
      "Qual sala do prédio ou anexo?",
        "Descreva detalhadamente o problema ou solicitação:",
        "Deseja enviar algum anexo? Responda 'sim' ou 'não'."
      ];
    }
    
    return [
      "Qual é o setor ou subsetor da sua solicitação?",
      "Qual é a sua função/cargo no setor?",
      "Por favor, informe seu nome completo:",
      "Informe o local de onde você deseja o atendimento (endereço completo: rua, bairro, município):",
      "Qual sala do prédio ou anexo?",
      "Descreva detalhadamente o problema ou solicitação:",
      "Deseja enviar algum anexo? Responda 'sim' ou 'não'."
    ];
  };

  const steps = getSteps();

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const hoursInfo = getConfiguredBusinessHours();
    
    let initialMessage: string;
    let options: string[] | undefined;

    if (hoursInfo.type !== 'business-hours') {
      initialMessage = hoursInfo.message;
    } else if (secretaria === "Secretaria Municipal de Saúde") {
      initialMessage = `Olá! 👋 Bem-vindo ao Service Desk da ${secretaria}.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'Posto de Saúde (UBS)', 'Balsa (UBS Fluvial)'];
    } else if (secretaria === "Secretaria Municipal de Educação") {
      initialMessage = `Olá! 👋 Bem-vindo ao Service Desk da ${secretaria}.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'Escolas'];
    } else if (secretaria === "Secretaria Municipal de Administração") {
      initialMessage = `Olá! 👋 Bem-vindo ao Service Desk da ${secretaria}.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'RH', 'CPC', 'Contabilidade'];
    } else {
      initialMessage = `Olá! 👋 Bem-vindo ao Service Desk da ${secretaria}.\n\n${steps[0]}`;
    }

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: initialMessage,
      timestamp: new Date(),
      options
    };

    setMessages([welcomeMessage]);
  }, [secretaria]);

  const addMessage = (content: string, type: 'bot' | 'user', options?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, message]);
  };

  const handleOptionSelect = (option: string) => {
    addMessage(option, 'user');
    setIsLoading(true);

    setTimeout(() => {
      processUserInput(option);
      setIsLoading(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    setIsLoading(true);
    addMessage(currentInput, 'user');

    setTimeout(() => {
      processUserInput(currentInput);
      setCurrentInput("");
      setIsLoading(false);
    }, 1000);
  };

  const processUserInput = (input: string) => {
    const newUserData = { ...userData };
    
    // Filtrar respostas genéricas como "oi", "olá", etc - expandido para detectar melhor
    const isGenericGreeting = /^(oi|olá|ola|oie|hey|hi|hello|bom|boa|dia|tarde|noite|tudo|bem|como|vai|opa|e\s*ai)$/i.test(input.trim());
    
    if (isGenericGreeting) {
      addMessage("Por favor, responda à pergunta específica acima. 😊", 'bot');
      return;
    }

    if ((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") && currentStep === 0) {
      newUserData.subsecretaria = input;
      setUserData(newUserData);
      addMessage("Perfeito! ✅ " + steps[1], 'bot');
      setCurrentStep(1);
      return;
    }

    const stepIndex = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") 
      ? currentStep - 1 
      : currentStep;

    const isSpecial = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração");
    const nextLabel = (idx: number) => steps[(isSpecial ? (idx + 2) : (idx + 1))] || "";

    switch (stepIndex) {
      case 0:
        // Verificar se não é uma mensagem genérica também aqui
        if (/^(oi|olá|ola|oie|hey|hi|hello|bom|boa|dia|tarde|noite|tudo|bem|como|vai|opa|e\s*ai)$/i.test(input.trim())) {
          addMessage("Por favor, informe o setor ou subsetor da sua solicitação. 😊", 'bot');
          return;
        }
        newUserData.setor = input;
        setUserData(newUserData);
        addMessage("Obrigado! 👍 " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 1:
        newUserData.funcao = input;
        setUserData(newUserData);
        addMessage("Perfeito! ✨ " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 2:
        newUserData.nome = input;
        setUserData(newUserData);
        addMessage("Ótimo! 🎯 " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 3:
        newUserData.endereco = input;
        setUserData(newUserData);
        addMessage("Perfeito! 📍 " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 4:
        newUserData.sala = input;
        setUserData(newUserData);
        addMessage("Certo! 🧭 " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 5:
        newUserData.descricao = input;
        setUserData(newUserData);
        addMessage("📎 " + nextLabel(stepIndex), 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 6: {
        const answer = input.trim().toLowerCase();
        if (["sim", "s", "yes", "y"].includes(answer)) {
          addMessage("Ótimo! Use o botão de clipe para anexar os arquivos (📎).", 'bot');
          // não finaliza ainda, aguarda o upload
        } else if (["não", "nao", "n", "no"].includes(answer)) {
          finalizarCadastro(newUserData);
        } else {
          addMessage("Não entendi. Responda 'sim' ou 'não' ou use o botão de anexar (📎).", 'bot');
        }
        break;
      }
    }
  };

  const finalizarCadastro = async (data: any) => {
    const protocolo = `OS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const prazo = addBusinessDays(new Date(), 3);
    
    // Get client info from session
    const clientInfo = sessionStorage.getItem('client-info');
    const parsedClientInfo = clientInfo ? JSON.parse(clientInfo) : null;

    const solicitacao = {
      ...data,
      protocolo,
      dataRegistro: new Date(),
      prazo,
      status: 'Aguardando' as const,
      anexos: userData.anexos
    };

    addMessage(
      `✅ Solicitação registrada com sucesso!\n\n` +
      `📋 Protocolo: ${protocolo}\n` +
      `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n` +
      `⏰ Prazo: 72h úteis (após confirmação)\n\n` +
      `Sua solicitação aguarda aprovação do administrador. 🔄`,
      'bot'
    );

    try {
      // Pass client info to createSolicitacao
      await createSolicitacao(solicitacao, parsedClientInfo);

      toast({
        title: "Solicitação registrada! ✅",
        description: `Protocolo: ${protocolo}`,
      });

      setTimeout(() => {
        onComplete(solicitacao);
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUserData(prev => ({
        ...prev,
        anexos: [...prev.anexos, ...files]
      }));
      
      addMessage(`📎 ${files.length} arquivo(s) anexado(s): ${files.map(f => f.name).join(', ')}`, 'user');
      
      const stepIndex = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") 
        ? currentStep - 1 
        : currentStep;
      
      if (stepIndex === 6) {
        finalizarCadastro(userData);
      }
    }
  };

  const pularAnexo = () => {
    const stepIndex = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") 
      ? currentStep - 1 
      : currentStep;
    
    if (stepIndex === 6) {
      finalizarCadastro(userData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-md h-[80vh] flex flex-col bg-background/95 backdrop-blur-md border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* WhatsApp-like Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-primary text-primary-foreground">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary-dark text-white">
                TI
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Service Desk TI</h3>
              <p className="text-xs opacity-90">Online agora</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-dark h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-dark h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-dark h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-dark h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Chat Area */}
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-gradient-to-b from-muted/20 to-muted/10" type="always">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-primary text-white text-xs">
                            TI
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">Service Desk</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md ml-2'
                          : 'bg-background border rounded-bl-md mr-2'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      {message.options && (
                        <div className="mt-3 space-y-2">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionSelect(option)}
                              className="block w-full text-left px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        TI
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Service Desk</span>
                  </div>
                  <div className="bg-background border p-3 rounded-2xl rounded-bl-md mr-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background border-t">
            {userData.anexos.length > 0 && (
              <div className="mb-2 p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📎 {userData.anexos.length} arquivo(s) anexado(s)
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-2 bg-muted rounded-full px-4 py-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="border-0 bg-transparent focus-visible:ring-0 p-0"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                {((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") ? currentStep - 1 : currentStep) === 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 h-auto"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !currentInput.trim()}
                size="icon"
                className="rounded-full gradient-primary h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
              
              {((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") ? currentStep - 1 : currentStep) === 6 && (
                <Button 
                  variant="outline" 
                  onClick={pularAnexo}
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppChat;