export interface AdminSettings {
  workingHours: {
    start: string;
    end: string;
    enabled: boolean;
  };
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  weekendMessage: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  afterHoursMessage: string;
  nonWorkingDayMessage: string;
}

export const getAdminSettings = (): AdminSettings => {
  const saved = localStorage.getItem('adminSettings');
  return saved ? JSON.parse(saved) : {
    workingHours: {
      start: "07:00",
      end: "17:00",
      enabled: true
    },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    weekendMessage: "Atendimento indisponível. Retorne em horário de expediente.",
    maintenanceMode: false,
    maintenanceMessage: "Sistema em manutenção. Tente novamente mais tarde.",
    afterHoursMessage: "Atendimento fora do horário. Sua solicitação foi registrada e será processada no próximo expediente.",
    nonWorkingDayMessage: "Atendimento indisponível hoje. Funcionamento apenas nos dias úteis configurados."
  };
};

export const saveAdminSettings = (settings: AdminSettings): void => {
  localStorage.setItem('adminSettings', JSON.stringify(settings));
};

export const isWithinConfiguredHours = (): boolean => {
  const settings = getAdminSettings();
  
  if (settings.maintenanceMode) {
    return false;
  }

  if (!settings.workingHours.enabled) {
    return true;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;
  
  const [startHour, startMinutes] = settings.workingHours.start.split(':').map(Number);
  const [endHour, endMinutes] = settings.workingHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinutes;
  const endTime = endHour * 60 + endMinutes;
  
  const currentDay = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[currentDay] as keyof typeof settings.workingDays;
  
  const isDayEnabled = settings.workingDays[currentDayName];
  
  return isDayEnabled && currentTime >= startTime && currentTime < endTime;
};

export const addBusinessDays = (date: Date, days: number): Date => {
  const settings = getAdminSettings();
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    
    const dayOfWeek = result.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as keyof typeof settings.workingDays;
    
    if (settings.workingDays[dayName]) {
      addedDays++;
    }
  }
  
  return result;
};

export const getBusinessHoursMessage = () => {
  const settings = getAdminSettings();
  const now = new Date();
  const currentDay = now.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[currentDay] as keyof typeof settings.workingDays;

  if (settings.maintenanceMode) {
    return {
      type: 'maintenance',
      message: settings.maintenanceMessage
    };
  }

  if (!settings.workingDays[currentDayName]) {
    return {
      type: 'non-working-day',
      message: settings.nonWorkingDayMessage
    };
  }

  if (!isWithinConfiguredHours()) {
    return {
      type: 'off-hours',
      message: settings.afterHoursMessage
    };
  }

  return {
    type: 'business-hours',
    message: '✅ Atendimento online. Nosso sistema está pronto para receber sua solicitação.'
  };
};