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
    { icon: Users, label: "Beta Testers", value: "150+" },
    { icon: Calendar, label: "Early Adopters", value: "50+" },
    { icon: Star, label: "Growing Community", value: "🚀" },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero"></div>
      

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 accent-gradient text-accent-foreground px-6 py-3 rounded-full mb-6 shadow-lg">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold">🚀 OPEN FOR BETA TESTING NOW</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-7xl font-bold text-foreground mb-4 leading-tight">
            Tu link de reservas
            <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              profesional
            </span>
          </h1>

          {/* Beta subheadline */}
          <p className="text-lg text-muted-foreground mb-2">
            ✨ <span className="font-semibold text-primary">Join the Next Hottest Startup</span> ✨
          </p>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Crea tu perfil <span className="font-bold text-accent">GRATIS</span> en 2 minutos, 
            obtén tu link <span className="font-mono bg-primary/15 px-3 py-1 rounded-lg text-primary font-semibold">bookeasy.mx/@tuusername</span> 
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