import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Link2, CalendarDays, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/homepage/HeroSection";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatWidget from "@/components/ChatWidget";
import { AnimatedBanner } from "@/components/homepage/AnimatedBanner";
import { LogoIcon } from "@/components/branding/LogoIcon";
import { LogoText } from "@/components/branding/LogoText";

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
      {/* Animated Banner - Homepage Only */}
      <AnimatedBanner />
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-bookeasy-mint-50 to-bookeasy-orange-50/30 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8" />
              <LogoText />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageToggle />
              {user ? (
                <>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="default"
                    className="rounded-full"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    onClick={signOut}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="default"
                  className="rounded-full px-6"
                >
                  {t('header.login')}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
              <LanguageToggle />
              {user ? (
                <>
                  <Button 
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    variant="default"
                    className="w-full"
                  >
                    {t('header.dashboard')}
                  </Button>
                  <Button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.logout')}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  variant="default"
                  className="w-full"
                >
                  {t('header.login')}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Simple Feature Cards */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-bookeasy-mint-50/30 to-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-background border-2 border-bookeasy-mint-200/50 rounded-2xl p-6 text-center hover:shadow-xl hover:border-bookeasy-mint-300 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-bookeasy-mint-300 to-bookeasy-mint-400 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{t('home.features.link.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.features.link.description')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background border-2 border-bookeasy-orange-200/50 rounded-2xl p-6 text-center hover:shadow-xl hover:border-bookeasy-orange-300 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-bookeasy-orange-300 to-bookeasy-orange-400 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{t('home.features.calendar.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.features.calendar.description')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background border-2 border-bookeasy-mint-200/50 rounded-2xl p-6 text-center hover:shadow-xl hover:border-bookeasy-mint-300 transition-all hover:-translate-y-1">
              <div className="bg-gradient-to-br from-bookeasy-mint-400 to-bookeasy-mint-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{t('home.features.whatsapp.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.features.whatsapp.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA + Footer Combined */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('home.cta.description')}
            </p>
            <Button 
              size="lg" 
              className="text-lg font-semibold px-8 py-6 h-auto rounded-full hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={handleGetStarted}
            >
              {t('home.cta.button')}
            </Button>
          </div>

          {/* Footer */}
          <footer className="border-t pt-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center space-x-2">
                <LogoIcon className="h-6 w-6" />
                <LogoText />
              </div>
              <p className="text-sm text-muted-foreground">
                hello@bookeasy.mx
              </p>
              <p className="text-xs text-muted-foreground">
                {t('home.footer.copyright')}
              </p>
              
              {/* Powered by strip */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {t('home.footer.poweredBy')}{' '}
                  <a 
                    href="https://newbizmarketing.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Newbiz Marketing
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </section>
      <ChatWidget />
    </div>
  );
};

export default Index;
