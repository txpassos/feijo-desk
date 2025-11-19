import { Settings, User, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import logoGreen from "@/assets/micronet-logo.png";
import logoPurple from "@/assets/micronet-logo-purple-alt.png";

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onSettings?: () => void;
  onAdminLogin?: () => void;
}

const Header = ({ isAdmin = false, onLogout, onSettings, onAdminLogin }: HeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-primary/30 backdrop-blur-xl sticky top-4 z-40 mx-4 rounded-2xl shadow-2xl shadow-primary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <img 
                src={isDarkMode ? logoGreen : logoPurple} 
                alt="Micronet Informática" 
                className="w-12 h-12 rounded-full relative z-10 ring-2 ring-primary/50"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                SERVICE DESK TI
              </h1>
              <p className="text-xs text-primary/70 font-rajdhani tracking-wider">
                MICRONET SOLUÇÕES EM INFORMÁTICA
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {!isAdmin && onAdminLogin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAdminLogin}
                className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 hover:border-primary hover:bg-primary/30 transition-all duration-300 font-rajdhani font-semibold"
              >
                <Shield className="mr-2 h-4 w-4" />
                ADMIN
              </Button>
            )}
            
            {isAdmin && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClear={clearNotification}
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/20 transition-all duration-300">
                  <User className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gradient-to-br from-gray-900 to-black border border-primary/30 backdrop-blur-xl">
                {isAdmin && (
                  <DropdownMenuItem onClick={onSettings} className="hover:bg-primary/20 cursor-pointer font-rajdhani">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                )}
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout} className="hover:bg-primary/20 cursor-pointer font-rajdhani">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;