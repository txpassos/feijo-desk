import jsPDF from "jspdf";
import logoImage from "@/assets/micronet-logo-new.png";

interface ReportData {
  secretaria: string;
  total: number;
  aguardando: number;
  aceita: number;
  cancelada: number;
  resolvida: number;
}

interface Solicitacao {
  protocolo: string;
  secretaria: string;
  setor: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: string;
  funcao?: string;
  device_info?: any;
  ip_address?: string;
  geolocation?: any;
}

export const generateReportPDF = (
  reportData: ReportData[],
  solicitacoes: Solicitacao[],
  filterInfo: {
    period: string;
    secretaria: string;
    month: string;
    year: string;
  }
): void => {
  const doc = new jsPDF();
  
  // Background escuro
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Cabeçalho
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, 10, 190, 45, 5, 5, 'F');
  
  // Borda verde neon
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, 10, 190, 45, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, 10.5, 189, 44, 5, 5, 'S');
  
  // Logo
  const logoX = 30;
  const logoY = 32.5;
  const logoRadius = 12;
  
  doc.setFillColor(25, 25, 25);
  doc.circle(logoX, logoY, logoRadius, 'F');
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.circle(logoX, logoY, logoRadius, 'S');
  
  const img = new Image();
  img.src = logoImage;
  
  doc.addImage(
    img,
    'PNG',
    logoX - (logoRadius - 1),
    logoY - (logoRadius - 1),
    (logoRadius - 1) * 2,
    (logoRadius - 1) * 2,
    undefined,
    'NONE'
  );
  
  // Título
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MICRONET SOLUÇÕES EM INFORMÁTICA", 105, 25, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE SOLICITAÇÕES", 105, 35, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(120, 220, 150);
  doc.text("SERVICE DESK DE TI", 105, 43, { align: "center" });
  
  // Informações de filtro
  let yPos = 65;
  doc.setFontSize(10);
  doc.setTextColor(240, 240, 240);
  
  const filterText = [];
  if (filterInfo.period !== 'all') {
    const periodNames: Record<string, string> = {
      today: 'Hoje',
      week: 'Última Semana',
      month: 'Último Mês'
    };
    filterText.push(`Período: ${periodNames[filterInfo.period] || filterInfo.period}`);
  }
  if (filterInfo.secretaria !== 'all') {
    filterText.push(`Secretaria: ${filterInfo.secretaria}`);
  }
  if (filterInfo.month !== 'all') {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    filterText.push(`Mês: ${monthNames[parseInt(filterInfo.month)]}`);
  }
  if (filterInfo.year !== 'all') {
    filterText.push(`Ano: ${filterInfo.year}`);
  }
  
  if (filterText.length > 0) {
    doc.setTextColor(120, 220, 150);
    doc.text(`Filtros: ${filterText.join(' | ')}`, 105, yPos, { align: "center" });
    yPos += 10;
  }
  
  doc.setTextColor(240, 240, 240);
  doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 105, yPos, { align: "center" });
  yPos += 5;
  doc.text(`Total de solicitações: ${solicitacoes.length}`, 105, yPos, { align: "center" });
  yPos += 15;
  
  // Tabela de resumo
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, yPos, 190, 10 + (reportData.length * 8), 5, 5, 'F');
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, yPos, 190, 10 + (reportData.length * 8), 5, 5, 'S');
  
  // Cabeçalho da tabela
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  
  const colWidths = [70, 20, 25, 20, 25, 25];
  const colX = [15, 85, 105, 130, 150, 175];
  
  yPos += 7;
  doc.text("Secretaria", colX[0], yPos);
  doc.text("Total", colX[1], yPos);
  doc.text("Aguardando", colX[2], yPos);
  doc.text("Aceita", colX[3], yPos);
  doc.text("Cancelada", colX[4], yPos);
  doc.text("Resolvida", colX[5], yPos);
  
  // Dados
  doc.setFont("helvetica", "normal");
  doc.setTextColor(240, 240, 240);
  yPos += 5;
  
  reportData.forEach(row => {
    doc.text(row.secretaria.substring(0, 30), colX[0], yPos);
    doc.text(String(row.total), colX[1], yPos);
    doc.text(String(row.aguardando), colX[2], yPos);
    doc.text(String(row.aceita), colX[3], yPos);
    doc.text(String(row.cancelada), colX[4], yPos);
    doc.text(String(row.resolvida), colX[5], yPos);
    yPos += 8;
  });
  
  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(120, 220, 150);
  doc.text("MICRONET SOLUÇÕES EM INFORMÁTICA - Service Desk", 105, 285, { align: "center" });
  doc.text("www.micronetinformatica.com.br", 105, 290, { align: "center" });
  
  // Salvar
  const fileName = `relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};