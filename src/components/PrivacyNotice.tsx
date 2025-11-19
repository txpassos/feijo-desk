import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const PrivacyNotice = () => {
  const [visible, setVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 12000);

    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className="fixed right-6 z-50 max-w-md animate-fade-in transition-all duration-300 ease-out"
      style={{ 
        top: `${Math.max(20, Math.min(window.innerHeight - 200, 120 + scrollPosition))}px`
      }}
    >
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-5 shadow-2xl border-2 border-red-500 animate-pulse-border">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-md animate-pulse"></div>
              <AlertTriangle className="relative h-8 w-8 text-orange-400 animate-pulse-glow" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-400 mb-2">
              Informação sobre rastreamento de dados
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Para fins de segurança e prevenção de agendamentos indevidos, este sistema registra <span className="text-orange-400 font-semibold">cookies, endereço IP e localização geográfica aproximada</span> do dispositivo. Os dados são tratados conforme nossa Política de Privacidade e a legislação aplicável (ex.: LGPD). 
            </p>
            <p className="text-xs text-orange-400 font-semibold mt-2">
              Por favor, agende somente se houver necessidade comprovada de atendimento técnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
