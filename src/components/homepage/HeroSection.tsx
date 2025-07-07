import { Button } from "@/components/ui/button";
import { Calendar, Phone, Instagram, Users, Star, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?tab=signup');
    }
  };


  return (
    <section className="relative py-20 md:py-28 lg:py-36 px-4 overflow-hidden gradient-mesh">
      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-accent/15 to-primary/15 blur-lg animate-bounce-gentle"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="glass-card neon-glow inline-flex items-center gap-2 px-6 py-3 rounded-full mb-10 text-white font-medium">
            <TrendingUp className="h-5 w-5" />
            <span>Bookeasy.mx – Fase 1 Beta Ya Disponible</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
            Estamos comenzando donde más importa:
            <span className="block mt-3 text-gradient-primary">
              en tu colonia
            </span>
          </h1>

          {/* Main value proposition */}
          <div className="mb-12 md:mb-16 max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 leading-relaxed font-medium">
              Recibe reservas profesionales con tu propio <span className="text-gradient-accent font-semibold">link personalizado</span>. Gratis.
            </p>
            
            {/* Location Badge */}
            <div className="glass-card-strong p-6 mb-10 neon-glow-accent">
              <p className="text-lg font-semibold text-foreground mb-2">Activando solo en:</p>
              <p className="text-muted-foreground text-lg">
                Buenos Aires Norte, Buenos Aires Sur y Jardín Dorado – Tijuana, BC
              </p>
            </div>
            
            {/* Link preview */}
            <div className="glass-card p-8 inline-block max-w-full neon-glow">
              <span className="text-sm block text-muted-foreground mb-2">Tu link personalizado:</span>
              <span className="font-mono text-gradient-primary font-semibold text-xl break-all">bookeasy.mx/@tuusuario</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 text-xl font-semibold group border-0 px-12 py-6 h-auto rounded-2xl hover:scale-105 transition-all duration-300 neon-glow-accent"
              onClick={handleGetStarted}
            >
              Crear Mi Perfil – Totalmente Gratis
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <p className="text-sm text-muted-foreground font-medium">
              Cupos limitados en esta primera etapa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;