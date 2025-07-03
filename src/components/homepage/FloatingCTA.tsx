import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling 50% of viewport height
      if (window.scrollY > window.innerHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  if (isHidden || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="glassmorphism rounded-2xl p-4 border border-border/50 shadow-2xl max-w-xs">
        <button
          onClick={() => setIsHidden(true)}
          className="absolute -top-2 -right-2 bg-muted text-muted-foreground rounded-full p-1 hover:bg-muted/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="text-sm text-foreground font-medium mb-2">
          ¿Listo para empezar?
        </div>
        <div className="text-xs text-muted-foreground mb-4">
          Crea tu perfil en menos de 2 minutos
        </div>
        
        <Button 
          onClick={handleGetStarted}
          className="w-full btn-accent text-sm floating-cta group"
        >
          {user ? 'Ir al Dashboard' : 'Crear Mi Perfil'}
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default FloatingCTA;