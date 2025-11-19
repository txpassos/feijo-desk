import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  acceptedAt: Date;
  onExpired?: () => void;
}

const CountdownTimer = ({ acceptedAt, onExpired }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const accepted = new Date(acceptedAt).getTime();
      const deadline = accepted + (72 * 60 * 60 * 1000); // 72 horas em milissegundos
      const remaining = deadline - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
        if (onExpired) {
          onExpired();
        }
      } else {
        setTimeRemaining(remaining);
        setIsExpired(false);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [acceptedAt, onExpired]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 px-3 py-2 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
        <span className="text-sm font-bold text-red-500">Serviço Atrasado - Tempo Esgotado</span>
      </div>
    );
  }

  const isAlmostExpired = timeRemaining < (24 * 60 * 60 * 1000); // Menos de 24 horas

  return (
    <div className={`flex items-center gap-2 ${isAlmostExpired ? 'bg-yellow-500/20 border-yellow-500' : 'bg-blue-500/20 border-blue-500'} border px-3 py-2 rounded-lg`}>
      <Clock className={`h-4 w-4 ${isAlmostExpired ? 'text-yellow-500' : 'text-blue-500'}`} />
      <div className="flex flex-col">
        <span className={`text-xs ${isAlmostExpired ? 'text-yellow-500' : 'text-blue-500'}`}>Tempo restante:</span>
        <span className={`text-sm font-bold font-orbitron ${isAlmostExpired ? 'text-yellow-500' : 'text-blue-500'}`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;