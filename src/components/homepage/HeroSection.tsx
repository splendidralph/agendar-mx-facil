import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <section className="relative py-16 md:py-24 px-4 overflow-hidden pt-20 md:pt-28 bg-gradient-to-b from-bookeasy-mint-50/50 via-bookeasy-orange-50/20 to-background">
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Tu agenda profesional
            <span className="block mt-2 bg-gradient-to-r from-bookeasy-mint-400 to-bookeasy-mint-500 bg-clip-text text-transparent">
              en un link
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crea tu perfil en 2 minutos. Tus clientes reservan solos.
          </p>
          
          {/* Link preview */}
          <div className="bg-gradient-to-br from-bookeasy-mint-100/80 to-bookeasy-orange-100/50 border-2 border-bookeasy-mint-200 p-6 rounded-2xl inline-block mb-10 max-w-full shadow-lg">
            <div className="font-mono text-lg md:text-xl break-all">
              <span className="text-muted-foreground">bookeasy.mx/</span>
              <span className="bg-gradient-to-r from-bookeasy-mint-500 to-bookeasy-mint-600 bg-clip-text text-transparent font-semibold">tuusuario</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-3">
            <Button 
              size="lg" 
              variant="bookeasy"
              className="text-lg font-semibold group px-8 py-6 h-auto rounded-full hover:scale-105 transition-all duration-200"
              onClick={handleGetStarted}
            >
              Crear mi perfil gratis
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
