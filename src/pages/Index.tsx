
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram, CheckCircle, Menu, X, LogOut, Link2, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Link2,
      title: "Tu Link Personal",
      description: "Obtén tu URL única bookeasy.mx/@tuusername para compartir"
    },
    {
      icon: Share2,
      title: "Fácil de Compartir",
      description: "Comparte tu link en WhatsApp, Instagram y redes sociales"
    },
    {
      icon: Calendar,
      title: "Gestión de Citas",
      description: "Administra tus reservas desde tu dashboard personal"
    },
    {
      icon: Clock,
      title: "Disponibilidad Flexible",
      description: "Define tus horarios según tu conveniencia"
    }
  ];

  const benefits = [
    "Link personalizado bookeasy.mx/@tuusername",
    "Sin costos de configuración",
    "Perfil profesional completo",
    "Integración con WhatsApp",
    "Dashboard móvil",
    "Soporte en español"
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
            <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4 space-y-3">
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Tu link de reservas
              <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-bounce-gentle">
                profesional
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-inter">
              Obtén tu link personalizado <span className="font-semibold">bookeasy.mx/@tuusername</span> y deja que tus clientes 
              reserven contigo directamente. Comparte tu link en WhatsApp, Instagram y todas tus redes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="btn-accent shadow-xl px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                onClick={handleGetStarted}
              >
                {user ? 'Ir al Dashboard' : 'Obtener Mi Link Gratis'}
              </Button>

              {/* Example Link Preview */}
              <div className="bg-card/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-muted-foreground">
                <span className="text-xs">Tu link será:</span><br />
                <span className="font-mono text-primary">bookeasy.mx/@tuusername</span>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center sm:justify-start space-x-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-center sm:text-left">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Perfecto para profesionales independientes
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Diseñado para barberos, estilistas, cosmetólogos y profesionales de la belleza en México
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center card-hover border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-4">
                  <div className="gradient-primary text-primary-foreground p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-foreground text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground font-inter">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Coming Soon Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl max-w-4xl mx-auto">
            <div className="gradient-primary text-primary-foreground p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Marketplace - Próximamente
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Pronto podrás ser descubierto por nuevos clientes en nuestro marketplace. 
              Por ahora, enfócate en compartir tu link personal.
            </p>
            <div className="text-sm text-muted-foreground">
              Mientras tanto, comparte tu link bookeasy.mx/@tuusername en todas tus redes sociales
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para obtener tu link profesional?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-inter">
            Crea tu perfil en minutos y comienza a recibir reservas a través de tu link personalizado. 
            Compártelo en WhatsApp, Instagram y donde quieras.
          </p>
          <Button 
            size="lg" 
            className="bg-card text-primary hover:bg-card/90 px-8 py-6 text-lg font-semibold shadow-xl"
            onClick={handleGetStarted}
          >
            Crear Mi Perfil - Gratis
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
              Links de reserva profesionales para México
            </p>
          </div>
          <div className="border-t border-border/20 pt-6 text-center">
            <div className="text-sm text-muted">
              © 2024 Bookeasy.mx. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
