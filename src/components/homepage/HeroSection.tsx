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
    <section className="relative py-20 md:py-28 lg:py-36 px-4 overflow-hidden gradient-mesh pattern-dots">
      {/* Geometric pattern elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent/10"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-primary/5"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="solid-card-primary inline-flex items-center gap-2 px-6 py-3 rounded-full mb-10 font-medium">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-foreground">{t('hero.badge')}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
            {t('hero.title')}
            <span className="block mt-3 text-gradient-primary">
              {t('hero.subtitle')}
            </span>
            <span className="block mt-2 text-gradient-accent text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {t('hero.subtitle2')}
            </span>
          </h1>

          {/* Supporting content */}
          <div className="mb-12 md:mb-16 max-w-4xl mx-auto">
            
            {/* Location Badge */}
            <div className="solid-card-accent p-6 mb-10">
              <p className="text-lg font-semibold text-foreground mb-2">{t('hero.locationBadge')}</p>
              <p className="text-muted-foreground text-lg">
                {t('hero.location')}
              </p>
            </div>
            
            {/* Link preview */}
            <div className="solid-card-strong p-8 inline-block max-w-full">
              <span className="text-sm block text-muted-foreground mb-2">{t('hero.linkPreview')}</span>
              <div className="font-mono text-xl break-all">
                <span className="text-gradient-primary font-semibold">bookeasy.mx/</span>
                <span className="text-gradient-accent font-bold bg-accent/10 px-2 py-1 rounded-md border border-accent/20">tuusuario</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 text-xl font-semibold group border-0 px-12 py-6 h-auto rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleGetStarted}
            >
              {t('hero.cta.create')}
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <p className="text-sm text-muted-foreground font-medium">
              {t('hero.limitedSpots')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;