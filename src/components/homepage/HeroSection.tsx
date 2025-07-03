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
      navigate('/auth');
    }
  };


  return (
    <section className="relative py-12 md:py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero"></div>
      

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 accent-gradient text-accent-foreground px-4 py-2 md:px-6 md:py-3 rounded-full mb-6 md:mb-8 shadow-lg text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs md:text-sm font-bold">{t('hero.badge')}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight px-2">
            {t('hero.title')}
            <span className="block mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>

          {/* Main value proposition */}
          <div className="mb-8 md:mb-10 max-w-5xl mx-auto px-2">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-4 font-medium leading-relaxed">
              {t('hero.description1')} <span className="font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl">{t('hero.description2')}</span> {t('hero.description3')}
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 leading-relaxed">
              {t('hero.description4')}
            </p>
            
            {/* Link preview */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-3 md:px-6 md:py-4 text-sm md:text-lg border border-white/30 inline-block max-w-full">
              <span className="text-xs md:text-sm block text-white mb-1">{t('hero.linkPreview')}</span>
              <span className="font-mono text-white font-bold text-sm md:text-lg break-all">bookeasy.mx/@tuusername</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center px-4">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 shadow-xl text-base md:text-lg font-bold group border-0 hover-lift"
              onClick={handleGetStarted}
            >
              {user ? t('hero.cta.dashboard') : t('hero.cta.create')}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;