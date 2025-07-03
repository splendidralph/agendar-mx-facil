import { Button } from "@/components/ui/button";
import { Calendar, Phone, Instagram, Users, Star, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };


  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero"></div>
      

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 accent-gradient text-accent-foreground px-6 py-3 rounded-full mb-8 shadow-lg">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold">🚀 OPEN FOR BETA TESTING NOW</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu link de reservas
            <span className="block mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              profesional
            </span>
          </h1>

          {/* Main value proposition */}
          <div className="mb-10 max-w-5xl mx-auto">
            <p className="text-2xl md:text-3xl text-white mb-4 font-medium leading-relaxed">
              Crea tu perfil <span className="font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent text-3xl md:text-4xl">GRATIS</span> en 2 minutos
            </p>
            <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed">
              y empieza a recibir reservas al instante
            </p>
            
            {/* Link preview */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-lg border border-white/30 inline-block">
              <span className="text-sm block text-white mb-1">Tu link será:</span>
              <span className="font-mono text-white font-bold text-lg">bookeasy.mx/@tuusername</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-xl px-10 py-6 text-xl font-bold group border-0 hover-lift"
              onClick={handleGetStarted}
            >
              {user ? 'Ir al Dashboard' : 'Crear Mi Perfil - Gratis'}
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;