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
    <section className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-hero"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full mb-8 border border-white/20 shadow-lg">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            {t('hero.title')}
            <span className="block mt-2 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>

          {/* Main value proposition */}
          <div className="mb-10 md:mb-12 max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 leading-relaxed font-medium">
              {t('hero.description1')} <span className="text-white font-semibold">{t('hero.description2')}</span> {t('hero.description3')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              {t('hero.description4')}
            </p>
            
            {/* Link preview */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 inline-block max-w-full shadow-lg">
              <span className="text-sm block text-white/80 mb-1">{t('hero.linkPreview')}</span>
              <span className="font-mono text-white font-semibold text-lg break-all">bookeasy.mx/@tuusername</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 shadow-2xl text-lg font-semibold group border-0 px-8 py-4 h-auto rounded-2xl hover:scale-105 transition-all duration-300"
              onClick={handleGetStarted}
            >
              {user ? t('hero.cta.dashboard') : t('hero.cta.create')}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;