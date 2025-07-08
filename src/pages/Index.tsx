
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, LogOut, Instagram, Facebook, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/homepage/HeroSection";
import InteractiveDemoSection from "@/components/homepage/InteractiveDemoSection";
import ModernFeaturesSection from "@/components/homepage/ModernFeaturesSection";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className="enhanced-header sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="gradient-primary text-primary-foreground p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Calendar className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <div>
                <span className="text-xl md:text-3xl font-bold text-foreground font-poppins tracking-tight">Bookeasy.mx</span>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">Reservas profesionales</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageToggle />
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-full">
                    {t('header.hello', { name: user.user_metadata?.full_name || user.email })}
                  </span>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="default"
                    className="px-6 py-2 rounded-full hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    onClick={signOut}
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-3"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="default"
                  className="px-8 py-3 rounded-full hover:scale-105 transition-all duration-200 font-semibold text-base"
                >
                  {t('header.login')}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-3 rounded-lg hover:bg-secondary/80 transition-colors touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4 space-y-4 animate-slide-up">
              <div className="px-3">
                <LanguageToggle />
              </div>
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground px-3 break-words">
                    {t('header.hello', { name: user.user_metadata?.full_name || user.email })}
                  </div>
                  <div className="px-3 space-y-3">
                    <Button 
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      variant="default"
                      className="w-full h-12 touch-manipulation"
                    >
                      {t('header.dashboard')}
                    </Button>
                    <Button 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start h-12 touch-manipulation"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.logout')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="px-3">
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                    variant="default"
                    className="w-full h-12 touch-manipulation"
                  >
                    {t('header.login')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <HeroSection />
      <InteractiveDemoSection />
      <ModernFeaturesSection />

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 px-4 section-modern relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Crea tu perfil profesional y empieza a recibir reservas automáticamente
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="accent-gradient text-white hover:opacity-90 text-lg font-semibold px-10 py-5 h-auto rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={handleGetStarted}
              >
                Crear mi perfil ahora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 md:py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground to-foreground/95"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center space-x-3 mb-4">
                <div className="gradient-primary text-primary-foreground p-3 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">Bookeasy.mx</span>
              </div>
              <p className="text-background/70 max-w-sm mx-auto md:mx-0 leading-relaxed">
                Una nueva forma de reservar servicios locales
              </p>
            </div>
            
            {/* Social Media Section */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex justify-center space-x-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-background/10 hover:bg-background/20 p-3 rounded-full smooth-transition hover:scale-110"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://wa.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-background/10 hover:bg-background/20 p-3 rounded-full smooth-transition hover:scale-110"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Contact/Info Section */}
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-background/70 mb-2">
                hello@bookeasy.mx
              </p>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-6 text-center">
            <div className="text-background/60 text-sm">
              © 2025 Bookeasy.mx - Digitalizando servicios profesionales en México
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
