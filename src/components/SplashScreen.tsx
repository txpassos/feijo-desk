import { useEffect, useState } from "react";
import logoImage from "@/assets/micronet-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  // Force green (dark) theme during splash and restore after
  useEffect(() => {
    const hadDark = document.documentElement.classList.contains('dark');
    if (!hadDark) document.documentElement.classList.add('dark');
    return () => {
      if (!hadDark) document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-gradient-to-br dark:from-background dark:to-muted bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="relative w-36 h-36 mx-auto">
          {/* Círculo com bordas verdes pulsantes */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-2 border-primary animate-ping"></div>
          
          {/* Logo circular */}
          <div className="absolute inset-4 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="Micronet Informática" 
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gradient">Service Desk de TI</h1>
          <p className="text-lg text-muted-foreground">Prefeitura de Feijó/AC</p>
          <p className="text-sm text-muted-foreground animate-slide-up">Inicializando Sistema de Atendimento...</p>
        </div>

        <div className="w-64 mx-auto">
          <div className="glass rounded-full h-2 overflow-hidden">
            <div 
              className="h-full gradient-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;