
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, LogOut } from "lucide-react";
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
      {/* Header */}
      <header className="glassmorphism border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="gradient-primary text-primary-foreground p-2 md:p-2.5 rounded-xl shadow-lg">
                <Calendar className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-lg md:text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageToggle />
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {t('header.hello', { name: user.user_metadata?.full_name || user.email })}
                  </span>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="hover-lift"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    onClick={signOut}
                    variant="ghost"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="hover-lift"
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
                      variant="outline"
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
                    variant="outline"
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
      <section className="py-12 md:py-20 px-4 gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-float"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6 px-2">
            {t('finalCta.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed px-2">
            {t('finalCta.description')}
            <span className="block mt-2 font-semibold">{t('finalCta.subtitle')}</span>
          </p>
          <div className="px-4">
            <Button 
              size="lg" 
              className="accent-gradient text-white hover:opacity-90 px-6 py-4 md:px-8 md:py-6 text-base md:text-lg font-semibold shadow-xl hover-lift w-full max-w-md md:w-auto touch-manipulation"
              onClick={handleGetStarted}
            >
              {t('finalCta.button')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">Bookeasy.mx</span>
            </div>
            <p className="text-muted mb-6 max-w-md mx-auto">
              {t('footer.description')}
            </p>
          </div>
          <div className="border-t border-border/20 pt-6 text-center">
            <div className="text-sm text-muted">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
