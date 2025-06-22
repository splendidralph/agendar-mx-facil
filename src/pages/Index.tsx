
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Phone, Instagram } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-bookeasy-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-bookeasy-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary text-white p-2 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-bookeasy-800 font-poppins">Bookeasy.mx</span>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-primary hover:opacity-90 text-white smooth-transition"
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-bookeasy-900 mb-6 leading-tight">
              Tu link de reservas
              <span className="block text-gradient bg-gradient-primary bg-clip-text text-transparent">
                profesional
              </span>
            </h1>
            <p className="text-xl text-bookeasy-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Dile adiós a los DMs de Instagram y WhatsApp. Crea tu perfil profesional 
              y deja que tus clientes reserven contigo de forma fácil y rápida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg smooth-transition"
                onClick={() => navigate('/register')}
              >
                Crear Mi Perfil Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-bookeasy-300 text-bookeasy-700 px-8 py-4 text-lg smooth-transition hover:bg-bookeasy-50"
                onClick={() => navigate('/booking/demo')}
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-bookeasy-900 mb-12">
            Perfecto para profesionales de la belleza
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg smooth-transition animate-slide-up border-bookeasy-100">
                <CardHeader>
                  <div className="bg-gradient-primary text-white p-3 rounded-full w-fit mx-auto mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-bookeasy-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-bookeasy-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para profesionalizar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya están usando Bookeasy.mx 
            para gestionar sus citas de forma profesional.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-bookeasy-600 hover:bg-bookeasy-50 px-8 py-4 text-lg smooth-transition"
            onClick={() => navigate('/register')}
          >
            Empezar Ahora - Es Gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bookeasy-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="bg-white text-bookeasy-800 p-2 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Bookeasy.mx</span>
          </div>
          <p className="text-bookeasy-200 mb-4">
            La plataforma de reservas online diseñada para México
          </p>
          <div className="text-sm text-bookeasy-300">
            © 2024 Bookeasy.mx. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
