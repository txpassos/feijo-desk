import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <Card className="max-w-xl w-full shadow-lg">
        <div className="p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Nós usamos cookies</h3>
          <p className="text-sm text-muted-foreground">
            Utilizamos cookies para melhorar sua experiência e para registrar informações de uso
            do sistema no seu dispositivo. Você pode aceitar ou recusar o uso de cookies.
          </p>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleDecline} variant="outline" className="flex-1">
              Recusar
            </Button>
            <Button onClick={handleAccept} className="flex-1">
              Aceitar e Continuar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
