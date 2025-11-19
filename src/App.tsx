import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import EnhancedAdminDashboard from "./components/EnhancedAdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState<'splash' | 'home' | 'admin-login' | 'admin-dashboard'>('splash');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar se já está logado como admin (somente por aba)
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAdmin(true);
    }

    // Verificar se deve ir direto para admin baseado na URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin-login');
    }
  }, []);

  const handleSplashComplete = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin-login');
    } else {
      setCurrentPage('home');
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setCurrentPage('admin-dashboard');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      case 'home':
        return <HomePage />;
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return isAdmin ? <EnhancedAdminDashboard /> : <AdminLogin onLogin={handleAdminLogin} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen">
          {renderCurrentPage()}
        </div>
        
        {/* Admin Access Button - Fixed position */}
        {currentPage === 'home' && (
          <button
            onClick={() => setCurrentPage('admin-login')}
            className="fixed bottom-4 right-4 w-3 h-3 bg-transparent border-none cursor-pointer opacity-0 hover:opacity-100"
            title="Acesso administrativo"
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
