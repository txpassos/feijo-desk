import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  X, 
  Trash2, 
  Edit, 
  Download, 
  AlertTriangle,
  Clock,
  MessageSquare,
  Send,
  Settings,
  BarChart3,
  Calendar,
  MapPin,
  User,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import AdminSettings from "@/components/AdminSettings";
import AdminReports from "@/components/AdminReports";
import AdminChatPanel from "@/components/AdminChatPanel";
import AdminSupportPanel from "@/components/AdminSupportPanel";
import AdminUserManager from "@/components/AdminUserManager";
import UserManager from "@/components/UserManager";
import { generatePDFComprovante } from "@/components/PDFGenerator";
import { useSupabaseSolicitacoes } from "@/hooks/useSupabaseSolicitacoes";
import CountdownTimer from "@/components/CountdownTimer";

interface Solicitacao {
  id?: string;
  protocolo: string;
  secretaria: string;
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
  nivel?: 'Nivel I' | 'Nivel II';
  acceptedAt?: Date;
  locked?: boolean;
  chat?: { 
    messages: {
      id: string;
      senderId: string;
      senderType: 'admin' | 'user';
      message: string;
      timestamp: Date;
      read: boolean;
    }[]; 
    isActive: boolean;
    lastActivity: Date;
  };
}

const EnhancedAdminDashboard = () => {
  const { solicitacoes, loading, updateSolicitacao, deleteSolicitacao: deleteSolicitacaoSupabase } = useSupabaseSolicitacoes();
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [systemOverloaded, setSystemOverloaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'reports'>('dashboard');
  const [editingData, setEditingData] = useState<Partial<Solicitacao>>({});
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const saveSolicitacao = async (solicitacao: Solicitacao) => {
    if (!solicitacao.id) return;
    await updateSolicitacao(solicitacao.id, solicitacao);
  };

  const updateStatus = async (protocolo: string, newStatus: Solicitacao['status'], dataAgendamento?: Date, nivel?: 'Nivel I' | 'Nivel II') => {
    const solicitacao = solicitacoes.find(s => s.protocolo === protocolo);
    if (!solicitacao || !solicitacao.id) return;

    const updates: Partial<Solicitacao> = { status: newStatus };
    
    if (newStatus === 'Aceita') {
      updates.prazo = new Date(Date.now() + (72 * 60 * 60 * 1000));
      updates.acceptedAt = new Date();
      if (dataAgendamento) {
        updates.dataAgendamento = dataAgendamento;
      }
      if (nivel) {
        updates.nivel = nivel;
      }
    }

    await updateSolicitacao(solicitacao.id, updates);

    let message = "";
    switch (newStatus) {
      case 'Aceita':
        message = "Sua solicitação foi confirmada. Aqui está seu comprovante em PDF.";
        break;
      case 'Cancelada':
        message = "Seu agendamento foi cancelado pelo administrador.";
        break;
      case 'Resolvida':
        message = "Sua solicitação foi resolvida com sucesso!";
        break;
    }

    toast({
      title: `Solicitação ${newStatus.toLowerCase()}`,
      description: `${protocolo} - ${message}`,
    });
  };

  const deleteSolicitacaoById = async (protocolo: string) => {
    const solicitacao = solicitacoes.find(s => s.protocolo === protocolo);
    if (!solicitacao || !solicitacao.id) return;
    
    await deleteSolicitacaoSupabase(solicitacao.id);
    
    toast({
      title: "Solicitação removida",
      description: "Solicitação foi removida do sistema.",
    });
  };

  const saveEditedSolicitacao = async () => {
    if (!selectedSolicitacao || !editingData || !selectedSolicitacao.id) return;

    await updateSolicitacao(selectedSolicitacao.id, editingData);
    
    setIsEditing(false);
    setSelectedSolicitacao(null);
    setEditingData({});
    
    toast({
      title: "Solicitação atualizada",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const generatePDF = (solicitacao: Solicitacao) => {
    try {
      generatePDFComprovante(solicitacao);
      toast({
        title: "Comprovante gerado",
        description: `PDF do protocolo ${solicitacao.protocolo} foi baixado.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o comprovante.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Aceita': return 'bg-green-500 hover:bg-green-600';
      case 'Cancelada': return 'bg-orange-500 hover:bg-orange-600';
      case 'Resolvida': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getButtonColor = (action: string) => {
    switch (action) {
      case 'accept': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancel': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'delete': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'edit': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return '';
    }
  };

  const groupedSolicitacoes = {
    aguardando: solicitacoes.filter(s => s.status === 'Aguardando'),
    aceitas: solicitacoes.filter(s => s.status === 'Aceita'),
    canceladas: solicitacoes.filter(s => s.status === 'Cancelada'),
    resolvidas: solicitacoes.filter(s => s.status === 'Resolvida')
  };

  const notificationCount = groupedSolicitacoes.aguardando.length;

  if (currentView === 'reports') {
    return (
      <div className="min-h-screen bg-black">
        <Header 
          isAdmin={true}
          onLogout={() => {
            sessionStorage.removeItem('adminAuth');
            sessionStorage.removeItem('adminUser');
            window.location.href = '/';
          }}
          onSettings={() => setShowSettings(true)}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="glass-hover"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
          <AdminReports solicitacoes={solicitacoes} />
        </main>
        {showSettings && <AdminSettings onClose={() => setShowSettings(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header 
        isAdmin={true}
        onLogout={() => {
          sessionStorage.removeItem('adminAuth');
          sessionStorage.removeItem('adminUser');
          window.location.href = '/';
        }}
        onSettings={() => setShowSettings(true)}
      />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Painel Administrativo
          </h1>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm flex-1 sm:flex-none"
              size="sm"
            >
              <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setCurrentView('reports')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm flex-1 sm:flex-none"
              size="sm"
            >
              <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Relatórios
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {solicitacoes.length}
              </div>
              <p className="text-sm text-white/70">Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {groupedSolicitacoes.aguardando.length}
              </div>
              <p className="text-sm text-white/70">Aguardando</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {groupedSolicitacoes.aceitas.length}
              </div>
              <p className="text-sm text-white/70">Aceitas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {groupedSolicitacoes.resolvidas.length}
              </div>
              <p className="text-sm text-white/70">Resolvidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-white/10">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-white/10">
              Chat Solicitações
            </TabsTrigger>
            <TabsTrigger value="support" className="text-white data-[state=active]:bg-white/10">
              Chat Suporte
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/10">
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Status Tabs */}
            <Tabs defaultValue="aguardando" className="space-y-4">
              <TabsList className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl">
                <TabsTrigger value="aguardando" className="text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                  Em Aberto ({groupedSolicitacoes.aguardando.length})
                </TabsTrigger>
                <TabsTrigger value="aceitas" className="text-white data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  Agendadas ({groupedSolicitacoes.aceitas.length})
                </TabsTrigger>
                <TabsTrigger value="resolvidas" className="text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Concluídas ({groupedSolicitacoes.resolvidas.length})
                </TabsTrigger>
                <TabsTrigger value="canceladas" className="text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Canceladas ({groupedSolicitacoes.canceladas.length})
                </TabsTrigger>
              </TabsList>

              {Object.entries(groupedSolicitacoes).map(([key, requests]) => (
                <TabsContent key={key} value={key}>
                  <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
                    <CardHeader>
                      <CardTitle className="capitalize text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>{key.replace('_', ' ')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EnhancedSolicitacoesList 
                        solicitacoes={requests}
                        onAccept={(protocolo, dataAgendamento, nivel) => updateStatus(protocolo, 'Aceita', dataAgendamento, nivel)}
                        onCancel={(protocolo) => updateStatus(protocolo, 'Cancelada')}
                        onDelete={deleteSolicitacaoById}
                        onEdit={(solicitacao) => {
                          setSelectedSolicitacao(solicitacao);
                          setEditingData(solicitacao);
                          setIsEditing(true);
                        }}
                        onGeneratePDF={generatePDF}
                        getStatusColor={getStatusColor}
                        getButtonColor={getButtonColor}
                        onUpdateSolicitacao={async (solicitacao: Solicitacao) => {
                          if (solicitacao.id) {
                            await updateSolicitacao(solicitacao.id, { status: 'Resolvida' });
                            toast({
                              title: "Status atualizado",
                              description: "Solicitação marcada como resolvida",
                            });
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="chat">
            <AdminChatPanel 
              solicitacoes={solicitacoes}
              onUpdateSolicitacao={async (solicitacao: Solicitacao) => {
                if (solicitacao.id) {
                  await updateSolicitacao(solicitacao.id, solicitacao);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="support">
            <AdminSupportPanel onUpdate={() => {}} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="legacy-users">
            <UserManager />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {isEditing && selectedSolicitacao && (
          <EditDialog
            solicitacao={selectedSolicitacao}
            editingData={editingData}
            setEditingData={setEditingData}
            onSave={saveEditedSolicitacao}
            onClose={() => {
              setIsEditing(false);
              setSelectedSolicitacao(null);
              setEditingData({});
            }}
          />
        )}
        
        {showSettings && <AdminSettings onClose={() => setShowSettings(false)} />}
      </main>
    </div>
  );
};

// Enhanced Solicitações List Component
const EnhancedSolicitacoesList = ({ 
  solicitacoes, 
  onAccept, 
  onCancel, 
  onDelete, 
  onEdit, 
  onGeneratePDF, 
  getStatusColor,
  getButtonColor,
  onUpdateSolicitacao
}: any) => {
  const [acceptingSolicitacao, setAcceptingSolicitacao] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [selectedNivel, setSelectedNivel] = useState<'Nivel I' | 'Nivel II'>('Nivel I');
  
  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma solicitação encontrada
      </div>
    );
  }

  const handleAccept = () => {
    if (acceptingSolicitacao && scheduledDate) {
      onAccept(acceptingSolicitacao, scheduledDate, selectedNivel);
      setAcceptingSolicitacao(null);
      setScheduledDate(undefined);
      setSelectedNivel('Nivel I');
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {solicitacoes.map((solicitacao: Solicitacao) => (
          <div key={solicitacao.protocolo} className="bg-transparent backdrop-blur-sm border border-white/10 p-6 rounded-2xl space-y-4 hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="font-bold text-lg text-primary">{solicitacao.protocolo}</h3>
                  <Badge className={cn("text-white", getStatusColor(solicitacao.status))}>
                    {solicitacao.status}
                  </Badge>
                  {solicitacao.nivel && (
                    <Badge 
                      className={`text-xs font-bold ${
                        solicitacao.nivel === 'Nivel I' 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {solicitacao.nivel}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="flex items-center text-foreground">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <strong>{solicitacao.nome}</strong>
                    </p>
                    <p className="flex items-center text-foreground">
                      <Building className="h-4 w-4 mr-2 text-primary" />
                      {solicitacao.funcao}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center text-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {solicitacao.setor}
                    </p>
                    <p className="text-primary/80">{solicitacao.secretaria}</p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="text-sm text-muted-foreground">
                  <p>{solicitacao.dataRegistro.toLocaleDateString('pt-BR')}</p>
                  {solicitacao.dataAgendamento && (
                    <p className="text-green-600">
                      Agendado: {solicitacao.dataAgendamento.toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                {solicitacao.acceptedAt && solicitacao.status === 'Aceita' && (
                  <CountdownTimer acceptedAt={solicitacao.acceptedAt} />
                )}
              </div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-1 text-foreground">Descrição:</p>
              <p className="text-sm text-foreground">{solicitacao.descricao}</p>
            </div>

            {solicitacao.responsavel && (
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Responsável:</strong> {solicitacao.responsavel}
                  {solicitacao.localAtendimento && (
                    <span className="ml-2">| <strong>Local:</strong> {solicitacao.localAtendimento}</span>
                  )}
                </p>
              </div>
            )}

            {/* Timer de 72 horas para solicitações aceitas */}
            {solicitacao.status === 'Aceita' && solicitacao.acceptedAt && (
              <CountdownTimer acceptedAt={solicitacao.acceptedAt} />
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              {solicitacao.status === 'Aguardando' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => setAcceptingSolicitacao(solicitacao.protocolo)}
                    className={getButtonColor('accept')}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Aceitar Agendamento
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onCancel(solicitacao.protocolo)}
                    className={getButtonColor('cancel')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              )}
              
              {solicitacao.status === 'Aceita' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateSolicitacao({ ...solicitacao, status: 'Resolvida' })}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Marcar como Resolvida
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onCancel(solicitacao.protocolo)}
                    className={getButtonColor('cancel')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar Agendamento
                  </Button>
                </>
              )}
              
              <Button 
                size="sm" 
                onClick={() => onEdit(solicitacao)}
                className={getButtonColor('edit')}
              >
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onGeneratePDF(solicitacao)}
                className="glass-hover"
              >
                <Download className="mr-1 h-4 w-4" />
                PDF
              </Button>
              
              <Button 
                size="sm" 
                onClick={() => onDelete(solicitacao.protocolo)}
                className={getButtonColor('delete')}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Deletar
              </Button>
              
              {solicitacao.status === 'Aceita' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="glass-hover"
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Chat em Tempo Real
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Dialog para aceitar agendamento */}
      {acceptingSolicitacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Confirmar Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Data Prevista para Atendimento</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white",
                        !scheduledDate && "text-white/70"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-white mb-2 block">Nível do Agendamento</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedNivel === 'Nivel I' ? 'default' : 'outline'}
                    className={selectedNivel === 'Nivel I' ? 'bg-primary text-white' : 'bg-white/10 border-white/20 text-white'}
                    onClick={() => setSelectedNivel('Nivel I')}
                  >
                    Nível I
                  </Button>
                  <Button
                    type="button"
                    variant={selectedNivel === 'Nivel II' ? 'default' : 'outline'}
                    className={selectedNivel === 'Nivel II' ? 'bg-primary text-white' : 'bg-white/10 border-white/20 text-white'}
                    onClick={() => setSelectedNivel('Nivel II')}
                  >
                    Nível II
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAccept}
                  disabled={!scheduledDate}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Confirmar
                </Button>
                <Button 
                  onClick={() => {
                    setAcceptingSolicitacao(null);
                    setScheduledDate(undefined);
                    setSelectedNivel('Nivel I');
                  }}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ScrollArea>
  );
};

// Edit Dialog Component
const EditDialog = ({ 
  solicitacao, 
  editingData, 
  setEditingData, 
  onSave, 
  onClose 
}: any) => {
  const [date, setDate] = useState<Date | undefined>(editingData.dataAgendamento);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl glass max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">
            Editar Solicitação - {solicitacao.protocolo}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome do Responsável</label>
              <Input
                value={editingData.responsavel || ''}
                onChange={(e) => setEditingData({...editingData, responsavel: e.target.value})}
                placeholder="Nome do responsável pelo atendimento"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Local de Atendimento</label>
              <Input
                value={editingData.localAtendimento || ''}
                onChange={(e) => setEditingData({...editingData, localAtendimento: e.target.value})}
                placeholder="Local onde será realizado o atendimento"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Secretaria/Órgão</label>
            <Input
              value={editingData.secretaria || solicitacao.secretaria}
              onChange={(e) => setEditingData({...editingData, secretaria: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data Prevista para Atendimento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setEditingData({...editingData, dataAgendamento: newDate});
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={editingData.descricao || solicitacao.descricao}
              onChange={(e) => setEditingData({...editingData, descricao: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={onSave} className="flex-1 gradient-primary">
              Salvar Alterações
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAdminDashboard;