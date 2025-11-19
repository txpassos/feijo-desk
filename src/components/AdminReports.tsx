import { useState, useMemo } from "react";
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Solicitacao {
  protocolo: string;
  secretaria: string;
  setor: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: 'Aguardando' | 'Aceita' | 'Cancelada' | 'Resolvida';
  anexos: File[];
  funcao: string;
}

interface AdminReportsProps {
  solicitacoes: Solicitacao[];
}

const AdminReports = ({ solicitacoes }: AdminReportsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSecretaria, setSelectedSecretaria] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-yellow-500/20 text-yellow-300';
      case 'aceita': return 'bg-green-500/20 text-green-300';
      case 'cancelada': return 'bg-red-500/20 text-red-300';
      case 'resolvida': return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Lista de secretarias únicas
  const secretarias = useMemo(() => {
    const unique = Array.from(new Set(solicitacoes.map(s => s.secretaria)));
    return ['all', ...unique];
  }, [solicitacoes]);

  // Lista de anos únicos
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const yearsArray = [];
    for (let year = currentYear; year >= startYear; year--) {
      yearsArray.push(year);
    }
    return ['all', ...yearsArray];
  }, []);

  const filteredSolicitacoes = useMemo(() => {
    let filtered = solicitacoes;
    
    // Filtro por período
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(s => s.dataRegistro >= startDate);
    }
    
    // Filtro por secretaria
    if (selectedSecretaria !== 'all') {
      filtered = filtered.filter(s => s.secretaria === selectedSecretaria);
    }
    
    // Filtro por mês
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(s => s.dataRegistro.getMonth() === parseInt(selectedMonth));
    }
    
    // Filtro por ano
    if (selectedYear !== 'all') {
      filtered = filtered.filter(s => s.dataRegistro.getFullYear() === parseInt(selectedYear));
    }
    
    return filtered;
  }, [solicitacoes, selectedPeriod, selectedSecretaria, selectedMonth, selectedYear]);

  const reportData = useMemo(() => {
    const secretarias = filteredSolicitacoes.reduce((acc, sol) => {
      if (!acc[sol.secretaria]) {
        acc[sol.secretaria] = {
          secretaria: sol.secretaria,
          total: 0,
          aguardando: 0,
          aceita: 0,
          cancelada: 0,
          resolvida: 0
        };
      }
      
      acc[sol.secretaria].total++;
      const statusKey = sol.status.toLowerCase() as 'aguardando' | 'aceita' | 'cancelada' | 'resolvida';
      acc[sol.secretaria][statusKey]++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(secretarias);
  }, [filteredSolicitacoes]);

  const exportReport = () => {
    try {
      import('@/utils/pdfReportGenerator').then(({ generateReportPDF }) => {
        const formattedSolicitacoes = filteredSolicitacoes.map(sol => ({
          protocolo: sol.protocolo,
          secretaria: sol.secretaria,
          setor: sol.setor || '',
          nome: sol.nome,
          endereco: sol.endereco,
          descricao: sol.descricao,
          dataRegistro: sol.dataRegistro,
          prazo: sol.prazo,
          status: sol.status,
          funcao: sol.funcao,
          device_info: (sol as any).device_info,
          ip_address: (sol as any).ip_address,
          geolocation: (sol as any).geolocation
        }));
        
        generateReportPDF(reportData, formattedSolicitacoes, {
          period: selectedPeriod,
          secretaria: selectedSecretaria,
          month: selectedMonth,
          year: selectedYear
        });
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          <BarChart3 className="mr-2 h-6 w-6" />
          Relatórios de Atendimento
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
          
          <select
            value={selectedSecretaria}
            onChange={(e) => setSelectedSecretaria(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          >
            <option value="all">Todas as secretarias</option>
            {secretarias.filter(s => s !== 'all').map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          >
            <option value="all">Todos os meses</option>
            <option value="0">Janeiro</option>
            <option value="1">Fevereiro</option>
            <option value="2">Março</option>
            <option value="3">Abril</option>
            <option value="4">Maio</option>
            <option value="5">Junho</option>
            <option value="6">Julho</option>
            <option value="7">Agosto</option>
            <option value="8">Setembro</option>
            <option value="9">Outubro</option>
            <option value="10">Novembro</option>
            <option value="11">Dezembro</option>
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm"
          >
            <option value="all">Todos os anos</option>
            {years.filter(y => y !== 'all').map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <Button onClick={exportReport} className="gradient-primary text-white">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {filteredSolicitacoes.length}
            </div>
            <p className="text-sm text-white/70">Total de Solicitações</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {filteredSolicitacoes.filter(s => s.status === 'Aguardando').length}
            </div>
            <p className="text-sm text-white/70">Aguardando</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {filteredSolicitacoes.filter(s => s.status === 'Aceita').length}
            </div>
            <p className="text-sm text-white/70">Aceitas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {filteredSolicitacoes.filter(s => s.status === 'Resolvida').length}
            </div>
            <p className="text-sm text-white/70">Resolvidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatório por Secretaria */}
      <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>Relatório por Secretaria</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {reportData.map((secretaria) => (
                <div key={secretaria.nome} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-white">{secretaria.nome}</h3>
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                      Total: {secretaria.total}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <Badge className={getStatusColor('aguardando')}>
                        {secretaria.aguardando}
                      </Badge>
                      <p className="text-xs mt-1">Aguardando</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={getStatusColor('aceita')}>
                        {secretaria.aceita}
                      </Badge>
                      <p className="text-xs mt-1">Aceitas</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={getStatusColor('cancelada')}>
                        {secretaria.cancelada}
                      </Badge>
                      <p className="text-xs mt-1">Canceladas</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={getStatusColor('resolvida')}>
                        {secretaria.resolvida}
                      </Badge>
                      <p className="text-xs mt-1">Resolvidas</p>
                    </div>
                  </div>
                  
                  {/* Barra de progresso visual */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(secretaria.aguardando / secretaria.total) * 100}%` }}
                      />
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(secretaria.aceita / secretaria.total) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(secretaria.cancelada / secretaria.total) * 100}%` }}
                      />
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${(secretaria.resolvida / secretaria.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;