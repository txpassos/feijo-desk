import jsPDF from "jspdf";
import logoImage from "@/assets/micronet-logo-new.png";
import nivelIBadge from "@/assets/nivel-i-badge.png";
import nivelIIBadge from "@/assets/nivel-ii-badge.png";
import emailIcon from "@/assets/email-icon.png";
import instagramIcon from "@/assets/instagram-icon.png";

interface SolicitacaoData {
  protocolo: string;
  secretaria: string;
  setor: string;
  funcao: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: string;
  dataAgendamento?: Date;
  nivel?: string;
}

export const generatePDFComprovante = (solicitacao: SolicitacaoData) => {
  const doc = new jsPDF();
  
  // Background escuro
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Cabeçalho com fundo escuro (mesmo padrão do site), sem roxo
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, 10, 190, 45, 5, 5, 'F');
  
  // Borda verde neon 3D (degradê simulado com múltiplas linhas)
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133); // hsl(152 70% 45%)
  doc.roundedRect(10, 10, 190, 45, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, 10.5, 189, 44, 5, 5, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.roundedRect(11, 11, 188, 43, 5, 5, 'S');
  
  // Logo circular com borda verde e fundo transparente
  const logoX = 30;
  const logoY = 32.5;
  const logoRadius = 12;
  
  // Criar círculo de fundo escuro primeiro
  doc.setFillColor(25, 25, 25);
  doc.circle(logoX, logoY, logoRadius, 'F');
  
  // Borda verde neon 3D ao redor do logo
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.circle(logoX, logoY, logoRadius, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.circle(logoX, logoY, logoRadius - 0.3, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.circle(logoX, logoY, logoRadius - 0.6, 'S');
  
  // Adicionar novo logo (PNG com transparência)
  const img = new Image();
  img.src = logoImage;
  
  // Usar addImage sem clipping para preservar transparência
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
  
  // Título principal
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MICRONET SOLUÇÕES EM INFORMÁTICA", 105, 25, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("COMPROVANTE DE ORDEM DE SERVIÇO", 105, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(120, 220, 150);
  doc.text("SERVICE DESK DE TI", 105, 43, { align: "center" });
  
  // Card de informações com borda verde neon 3D
  let yPosition = 65;
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, yPosition, 190, 110, 5, 5, 'F');
  
  // Borda verde neon 3D
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, yPosition, 190, 110, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, yPosition + 0.5, 189, 109, 5, 5, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.roundedRect(11, yPosition + 1, 188, 108, 5, 5, 'S');
  
  yPosition += 10;
  const lineHeight = 8;
  
  const addField = (label: string, value: string) => {
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label + ":", 20, yPosition);
    
    doc.setTextColor(240, 240, 240);
    doc.setFont("helvetica", "normal");
    doc.text(value, 75, yPosition);
    
    yPosition += lineHeight;
  };
  
  addField("Protocolo", solicitacao.protocolo);
  addField("Data de Registro", solicitacao.dataRegistro.toLocaleDateString('pt-BR'));
  addField("Prazo de Atendimento", solicitacao.prazo.toLocaleDateString('pt-BR'));
  addField("Status", solicitacao.status);
  
  if (solicitacao.dataAgendamento) {
    addField("Data Agendada", solicitacao.dataAgendamento.toLocaleDateString('pt-BR'));
  }
  
  if (solicitacao.nivel) {
    const nivelColor = solicitacao.nivel === "Nivel I" ? [255, 215, 0] : [147, 51, 234];
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Nível:", 20, yPosition);
    
    doc.setTextColor(nivelColor[0], nivelColor[1], nivelColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(solicitacao.nivel, 75, yPosition);
    
    // Adicionar badge de nível como imagem (maior e ao lado do nível)
    const nivelBadgeImg = new Image();
    nivelBadgeImg.src = solicitacao.nivel === "Nivel I" ? nivelIBadge : nivelIIBadge;
    doc.addImage(nivelBadgeImg, 'PNG', 95, yPosition - 8, 20, 20);
    
    yPosition += lineHeight;
  }
  
  // Card de dados da secretaria com borda verde neon 3D
  yPosition += 10;
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, yPosition, 190, 45, 5, 5, 'F');
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, yPosition, 190, 45, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, yPosition + 0.5, 189, 44, 5, 5, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.roundedRect(11, yPosition + 1, 188, 43, 5, 5, 'S');
  
  yPosition += 10;
  
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Secretaria:", 20, yPosition);
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "normal");
  doc.text(solicitacao.secretaria, 75, yPosition);
  yPosition += lineHeight;
  
  // Verificar se setor não é uma mensagem de chat
  const setorValue = solicitacao.setor && !solicitacao.setor.match(/^(oi|olá|ola|oie|hey|hi|hello|bom|boa|dia|tarde|noite|tudo|bem|como|vai|opa|e\s*ai)$/i) 
    ? solicitacao.setor 
    : "Não informado";
  
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("Setor/Subsetor:", 20, yPosition);
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "normal");
  doc.text(setorValue, 75, yPosition);
  yPosition += lineHeight;
  
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("Função/Cargo:", 20, yPosition);
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "normal");
  doc.text(solicitacao.funcao, 75, yPosition);
  yPosition += lineHeight;
  
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("Solicitante:", 20, yPosition);
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "normal");
  doc.text(solicitacao.nome, 75, yPosition);
  
  // Card de descrição com borda verde neon 3D
  yPosition += 15;
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, yPosition, 190, 50, 5, 5, 'F');
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, yPosition, 190, 50, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, yPosition + 0.5, 189, 49, 5, 5, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.roundedRect(11, yPosition + 1, 188, 48, 5, 5, 'S');
  
  yPosition += 10;
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("Descrição da Solicitação:", 20, yPosition);
  yPosition += 8;
  
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const splitDescription = doc.splitTextToSize(solicitacao.descricao, 170);
  doc.text(splitDescription, 20, yPosition);
  yPosition += splitDescription.length * 5;
  
  // Rodapé com borda verde neon 3D
  yPosition = Math.max(yPosition + 15, 260);
  doc.setFillColor(25, 25, 25);
  doc.roundedRect(10, yPosition, 190, 25, 5, 5, 'F');
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 197, 133);
  doc.roundedRect(10, yPosition, 190, 25, 5, 5, 'S');
  doc.setDrawColor(40, 210, 145);
  doc.roundedRect(10.5, yPosition + 0.5, 189, 24, 5, 5, 'S');
  doc.setDrawColor(46, 223, 157);
  doc.roundedRect(11, yPosition + 1, 188, 23, 5, 5, 'S');
  
  yPosition += 8;
  doc.setTextColor(120, 220, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("MICRONET SOLUÇÕES EM INFORMÁTICA", 105, yPosition, { align: "center" });
  
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("CNPJ: 52.026.347/0001-07 | Feijó - Acre", 105, yPosition, { align: "center" });
  
  yPosition += 5;
  
  // Adicionar ícones de email e Instagram
  const emailImg = new Image();
  emailImg.src = emailIcon;
  const instagramImg = new Image();
  instagramImg.src = instagramIcon;
  
  doc.addImage(emailImg, 'PNG', 45, yPosition - 2, 4, 4);
  doc.setFontSize(7);
  doc.text("micronetinfo.suporte@gmail.com", 50, yPosition, { align: "left" });
  
  doc.addImage(instagramImg, 'PNG', 125, yPosition - 2, 4, 4);
  doc.text("@micronet.ac", 130, yPosition, { align: "left" });
  
  yPosition += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(`Comprovante gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`, 105, yPosition, { align: "center" });
  
  // Baixar o PDF
  doc.save(`Comprovante-${solicitacao.protocolo}.pdf`);
};

export default generatePDFComprovante;