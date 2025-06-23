import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram, CheckCircle, Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Gestión de Citas",
      description: "Agenda y administra tus citas de forma profesional"
    },
    {
      icon: Clock,
      title: "Horarios Flexibles",
      description: "Define tu disponibilidad según tu conveniencia"
    },
    {
      icon: Phone,
      title: "Notificaciones SMS",
      description: "Confirmaciones y recordatorios automáticos"
    },
    {
      icon: Instagram,
      title: "Integración Social",
      description: "Conecta con tus redes sociales existentes"
    }
  ];

  const benefits = [
    "Sin costos de configuración",
    "Cobros automáticos",
    "Recordatorios por SMS",
    "Dashboard móvil",
    "Link personalizado",
    "Soporte en español"
  ];

  const handleAuthClick = () => {
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
              <Button 
                variant="ghost"
                onClick={() => navigate('/explore')}
                className="text-foreground hover:text-primary"
              >
                Explorar
              </Button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Hola, {user.user_metadata?.full_name || user.email}
                  </span>
                  <Button 
                    onClick={handleAuthClick}
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
                  onClick={handleAuthClick}
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
              <Button 
                variant="ghost"
                onClick={() => {
                  navigate('/explore');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start text-foreground hover:text-primary"
              >
                Explorar Profesionales
              </Button>
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground px-3">
                    Hola, {user.user_metadata?.full_name || user.email}
                  </div>
                  <Button 
                    onClick={() => {
                      handleAuthClick();
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
                    handleAuthClick();
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
              Dile adiós a los DMs de Instagram y WhatsApp. Crea tu perfil profesional 
              y deja que tus clientes reserven contigo de forma fácil y rápida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="btn-accent shadow-xl px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                {user ? 'Ir al Dashboard' : 'Crear Mi Perfil Gratis'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary px-8 py-6 text-lg font-semibold hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                onClick={() => navigate('/explore')}
              >
                Explorar Profesionales
              </Button>
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
            Perfecto para profesionales de la belleza
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Diseñado especialmente para barberos, estilistas y profesionales de la belleza en México
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

      {/* Waitlist Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl max-w-4xl mx-auto">
            <div className="gradient-primary text-primary-foreground p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¡Próximamente en Julio 2025!
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Únete a nuestra lista de espera y sé de los primeros en revolucionar tu negocio
            </p>
            <Button 
              size="lg" 
              className="btn-accent shadow-xl px-8 py-6 text-lg font-semibold mb-6"
              onClick={() => navigate('/auth')}
            >
              Unirme a la Lista de Espera
            </Button>
            <div className="text-sm text-muted-foreground">
              Recibe notificaciones exclusivas sobre el lanzamiento y ofertas especiales
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para profesionalizar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-inter">
            Prepárate para el futuro de las reservas online. 
            Únete a nuestra lista de espera y obtén acceso temprano.
          </p>
          <Button 
            size="lg" 
            className="bg-card text-primary hover:bg-card/90 px-8 py-6 text-lg font-semibold shadow-xl"
            onClick={() => navigate('/auth')}
          >
            Reservar Mi Lugar - Gratis
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
              La plataforma de reservas online diseñada para México
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
