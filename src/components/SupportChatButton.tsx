import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SupportChatWindow from "@/components/SupportChatWindow";

const SupportChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-50 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground p-0 transition-all duration-300 hover:scale-110 animate-fade-in"
        size="icon"
        aria-label="Chat de Suporte"
      >
        <MessageSquare className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
      </Button>

      {isOpen && <SupportChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default SupportChatButton;
