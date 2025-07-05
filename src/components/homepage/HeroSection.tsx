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
    <section className="relative py-20 md:py-28 lg:py-36 px-4 overflow-hidden hero-modern">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 premium-badge text-white px-6 py-3 rounded-full mb-10 shadow-lg">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
            {t('hero.title')}
            <span className="block mt-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>

          {/* Main value proposition */}
          <div className="mb-12 md:mb-16 max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 leading-relaxed font-medium">
              {t('hero.description1')} <span className="text-foreground font-semibold">{t('hero.description2')}</span> {t('hero.description3')}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/80 mb-10 leading-relaxed">
              {t('hero.description4')}
            </p>
            
            {/* Link preview */}
            <div className="modern-card p-8 inline-block max-w-full">
              <span className="text-sm block text-muted-foreground mb-2">{t('hero.linkPreview')}</span>
              <span className="font-mono text-foreground font-semibold text-xl break-all">bookeasy.mx/@tuusername</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 text-xl font-semibold group border-0 px-12 py-6 h-auto rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl"
              onClick={handleGetStarted}
            >
              {user ? t('hero.cta.dashboard') : t('hero.cta.create')}
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;