
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/homepage/HeroSection";
import InteractiveDemoSection from "@/components/homepage/InteractiveDemoSection";
import ModernFeaturesSection from "@/components/homepage/ModernFeaturesSection";
import FloatingCTA from "@/components/homepage/FloatingCTA";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Hola, {user.user_metadata?.full_name || user.email}
                  </span>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="hover-lift"
                  >
                    Dashboard
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
                  Iniciar Sesión
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-secondary/80 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4 space-y-3 animate-slide-up">
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground px-3">
                    Hola, {user.user_metadata?.full_name || user.email}
                  </div>
                  <Button 
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Iniciar Sesión
                </Button>
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
      <section className="py-20 px-4 gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-float"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para tu link profesional GRATIS?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Únete al beta testing y obtén acceso gratuito de por vida. 
            <span className="block mt-2 font-semibold">🚀 Sé parte de la próxima revolución en reservas</span>
          </p>
          <Button 
            size="lg" 
            className="accent-gradient text-white hover:opacity-90 px-8 py-6 text-lg font-semibold shadow-xl hover-lift"
            onClick={handleGetStarted}
          >
            Crear Mi Perfil - Completamente Gratis
          </Button>
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
              La plataforma de reservas #1 para profesionales de belleza en México
            </p>
          </div>
          <div className="border-t border-border/20 pt-6 text-center">
            <div className="text-sm text-muted">
              © 2024 Bookeasy.mx. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
};

export default Index;
