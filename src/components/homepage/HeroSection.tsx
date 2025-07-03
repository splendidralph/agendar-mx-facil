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

  const stats = [
    { icon: Users, label: "Profesionales activos", value: "2,500+" },
    { icon: Calendar, label: "Citas programadas", value: "50,000+" },
    { icon: Star, label: "Calificación promedio", value: "4.9" },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="glassmorphism rounded-2xl p-4 animate-float">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="absolute top-32 right-20 hidden lg:block">
        <div className="glassmorphism rounded-2xl p-4 animate-float" style={{ animationDelay: '1s' }}>
          <Phone className="h-8 w-8 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-20 left-20 hidden lg:block">
        <div className="glassmorphism rounded-2xl p-4 animate-float" style={{ animationDelay: '2s' }}>
          <Instagram className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Plataforma #1 para profesionales de belleza</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Tu link de reservas
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow">
              profesional
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Crea tu perfil en <span className="font-semibold text-foreground">2 minutos</span>, 
            obtén tu link <span className="font-mono bg-primary/10 px-2 py-1 rounded text-primary">bookeasy.mx/@tuusername</span> 
            y empieza a recibir reservas al instante
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="floating-cta btn-accent shadow-xl px-8 py-6 text-lg font-semibold w-full sm:w-auto group"
              onClick={handleGetStarted}
            >
              {user ? 'Ir al Dashboard' : 'Crear Mi Perfil - Gratis'}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Preview link */}
            <div className="glassmorphism rounded-xl px-6 py-4 text-sm text-muted-foreground">
              <span className="text-xs block">Tu link será:</span>
              <span className="font-mono text-primary font-medium">bookeasy.mx/@tuusername</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bento-card text-center hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="gradient-primary text-primary-foreground p-3 rounded-xl w-fit mx-auto mb-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;