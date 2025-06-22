
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary shadow-lg"
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Tu link de reservas
              <span className="block gradient-primary bg-clip-text text-transparent animate-bounce-gentle">
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
                className="btn-accent shadow-xl px-8 py-6 text-lg font-semibold"
                onClick={() => navigate('/register')}
              >
                Crear Mi Perfil Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary px-8 py-6 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/booking/demo')}
              >
                Ver Demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{benefit}</span>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Social Proof Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Únete a más de 500+ profesionales
            </h3>
            <p className="text-muted-foreground mb-6">
              Ya están usando Bookeasy.mx para hacer crecer sus negocios
            </p>
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Profesionales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Citas Reservadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Satisfacción</div>
              </div>
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
            Únete a cientos de profesionales que ya están usando Bookeasy.mx 
            para gestionar sus citas de forma profesional.
          </p>
          <Button 
            size="lg" 
            className="bg-card text-primary hover:bg-card/90 px-8 py-6 text-lg font-semibold shadow-xl"
            onClick={() => navigate('/register')}
          >
            Empezar Ahora - Es Gratis
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
