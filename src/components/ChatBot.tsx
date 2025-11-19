import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getBusinessHoursMessage, addBusinessDays } from "@/utils/timeUtils";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  options?: string[];
}

interface ChatBotProps {
  secretaria: string;
  onClose: () => void;
  onComplete: (data: any) => void;
}

const ChatBot = ({ secretaria, onClose, onComplete }: ChatBotProps) => {
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
    descricao: "",
    anexos: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getSteps = () => {
    if (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") {
      return [
        "subsecretaria", // Step especial para escolher sub-opção
        "Qual é o setor ou subsetor da sua solicitação?",
        "Qual é a sua função/cargo no setor?",
        "Por favor, informe seu nome completo:",
        "Informe seu endereço completo:",
        "Descreva detalhadamente o problema ou solicitação:",
        "Gostaria de anexar algum arquivo ou imagem? (opcional)"
      ];
    }
    
    return [
      "Qual é o setor ou subsetor da sua solicitação?",
      "Qual é a sua função/cargo no setor?",
      "Por favor, informe seu nome completo:",
      "Informe seu endereço completo:",
      "Descreva detalhadamente o problema ou solicitação:",
      "Gostaria de anexar algum arquivo ou imagem? (opcional)"
    ];
  };

  const steps = getSteps();

  useEffect(() => {
    // Verificar horário de funcionamento
    const hoursInfo = getBusinessHoursMessage();
    
    let initialMessage: string;
    let options: string[] | undefined;

    if (hoursInfo.type !== 'business-hours') {
      initialMessage = hoursInfo.message;
    } else if (secretaria === "Secretaria Municipal de Saúde") {
      initialMessage = `Olá! Bem-vindo ao Service Desk da ${secretaria}. Vou ajudá-lo a registrar sua solicitação.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'Posto de Saúde (UBS)', 'Balsa (UBS Fluvial)'];
    } else if (secretaria === "Secretaria Municipal de Educação") {
      initialMessage = `Olá! Bem-vindo ao Service Desk da ${secretaria}. Vou ajudá-lo a registrar sua solicitação.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'Escolas'];
    } else if (secretaria === "Secretaria Municipal de Administração") {
      initialMessage = `Olá! Bem-vindo ao Service Desk da ${secretaria}. Vou ajudá-lo a registrar sua solicitação.\n\nPor favor, escolha uma das opções abaixo:`;
      options = ['Própria Secretaria', 'RH', 'CPC', 'Contabilidade'];
    } else {
      initialMessage = `Olá! Bem-vindo ao Service Desk da ${secretaria}. Vou ajudá-lo a registrar sua solicitação.\n\n${steps[0]}`;
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

    // Simular delay do bot
    setTimeout(() => {
      processUserInput(currentInput);
      setCurrentInput("");
      setIsLoading(false);
    }, 1000);
  };

  const processUserInput = (input: string) => {
    const newUserData = { ...userData };

    // Verificar se é uma secretaria com sub-opções e se estamos no primeiro step
    if ((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") && currentStep === 0) {
      newUserData.subsecretaria = input;
      setUserData(newUserData);
      addMessage("Perfeito! " + steps[1], 'bot');
      setCurrentStep(1);
      return;
    }

    // Ajustar o índice do step para secretarias com sub-opções
    const stepIndex = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") 
      ? currentStep - 1 
      : currentStep;

    switch (stepIndex) {
      case 0:
        newUserData.setor = input;
        setUserData(newUserData);
        addMessage("Obrigado! " + steps[stepIndex + 2], 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 1:
        newUserData.funcao = input;
        setUserData(newUserData);
        addMessage("Perfeito! " + steps[stepIndex + 2], 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 2:
        newUserData.nome = input;
        setUserData(newUserData);
        addMessage("Ótimo! " + steps[stepIndex + 2], 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 3:
        newUserData.endereco = input;
        setUserData(newUserData);
        addMessage("Perfeito! " + steps[stepIndex + 2], 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 4:
        newUserData.descricao = input;
        setUserData(newUserData);
        addMessage(steps[stepIndex + 2], 'bot');
        setCurrentStep(currentStep + 1);
        break;
      case 5:
        // Finalizar cadastro
        finalizarCadastro(newUserData);
        break;
    }
  };

  const finalizarCadastro = (data: any) => {
    const protocolo = `OS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const prazo = addBusinessDays(new Date(), 3); // 3 dias úteis reais

    const solicitacao = {
      ...data,
      protocolo,
      dataRegistro: new Date(),
      prazo,
      status: 'Aguardando',
      anexos: userData.anexos
    };

    addMessage(
      `✅ Solicitação registrada com sucesso!\n\n` +
      `📋 Protocolo: ${protocolo}\n` +
      `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n` +
      `⏰ Prazo: 72h úteis (após confirmação)\n\n` +
      `Sua solicitação aguarda aprovação do administrador.`,
      'bot'
    );

    // Salvar no localStorage
    const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes') || '[]');
    solicitacoes.push(solicitacao);
    localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));

    toast({
      title: "Solicitação registrada!",
      description: `Protocolo: ${protocolo}`,
    });

    setTimeout(() => {
      onComplete(solicitacao);
    }, 2000);
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
      
      if (stepIndex === 5) {
        finalizarCadastro(userData);
      }
    }
  };

  const pularAnexo = () => {
    const stepIndex = (secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") 
      ? currentStep - 1 
      : currentStep;
    
    if (stepIndex === 5) {
      finalizarCadastro(userData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[80vh] glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-gradient">
            Chat - {secretaria}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'gradient-primary text-primary-foreground'
                        : 'glass border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className="block w-full text-left px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-xs opacity-70 block mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass border p-3 rounded-lg">
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

          <div className="mt-4 space-y-2">
            {userData.anexos.length > 0 && (
              <div className="glass p-2 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📎 {userData.anexos.length} arquivo(s) anexado(s)
                </p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <div className="flex-1 flex space-x-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="glass"
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
                {((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") ? currentStep - 1 : currentStep) === 5 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-hover"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !currentInput.trim()}
                className="gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
              
              {((secretaria === "Secretaria Municipal de Saúde" || secretaria === "Secretaria Municipal de Educação" || secretaria === "Secretaria Municipal de Administração") ? currentStep - 1 : currentStep) === 5 && (
                <Button 
                  variant="outline" 
                  onClick={pularAnexo}
                  className="glass-hover"
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

export default ChatBot;