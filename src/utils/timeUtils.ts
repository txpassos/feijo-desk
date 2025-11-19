export const isWithinBusinessHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = domingo, 6 = sábado
  
  // Segunda a Sexta (1-5), das 7h às 17h
  return day >= 1 && day <= 5 && hour >= 7 && hour < 17;
};

export const getBusinessHoursMessage = () => {
  const now = new Date();
  const day = now.getDay();
  
  if (day === 0 || day === 6) {
    return {
      type: 'weekend',
      message: '🕐 Atendimento indisponível. Retorne em horário de expediente (Seg-Sex das 07h às 17h).'
    };
  } else if (!isWithinBusinessHours()) {
    return {
      type: 'off-hours',
      message: '🕐 Atendimento fora do horário. Sua solicitação será registrada e processada no próximo expediente.'
    };
  } else {
    return {
      type: 'business-hours',
      message: '✅ Atendimento online. Nosso sistema está pronto para receber sua solicitação.'
    };
  }
};

export const addBusinessDays = (date: Date, days: number) => {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    
    // Se não for fim de semana, conta como dia útil
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
};

export const formatBusinessDeadline = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};