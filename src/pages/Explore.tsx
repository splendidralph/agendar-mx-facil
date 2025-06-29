
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight, Link2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Explore = () => {
  const navigate = useNavigate();

  const comingSoonFeatures = [
    {
      icon: Search,
      title: "Buscar Profesionales",
      description: "Encuentra barberos, estilistas y más cerca de ti"
    },
    {
      icon: Calendar,
      title: "Reservar Directamente",
      description: "Agenda citas con tus profesionales favoritos"
    },
    {
      icon: Users,
      title: "Reviews y Ratings",
      description: "Lee reseñas de otros clientes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-background">
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
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="hidden sm:flex"
              >
                Inicio
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="btn-primary"
              >
                Obtener Mi Link
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Coming Soon Hero */}
        <div className="text-center mb-16">
          <div className="gradient-primary text-primary-foreground p-6 rounded-2xl w-fit mx-auto mb-8 shadow-lg">
            <Users className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Marketplace
            <span className="block text-2xl md:text-3xl text-muted-foreground mt-2">
              Próximamente
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Pronto podrás descubrir y reservar con los mejores profesionales de belleza en tu ciudad. 
            Mientras tanto, si eres profesional, ¡obtén tu link personalizado!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="btn-accent shadow-xl px-8 py-6 text-lg font-semibold"
            >
              Soy Profesional - Obtener Mi Link
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* What's Coming */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            ¿Qué viene próximamente?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            El marketplace conectará a clientes con profesionales verificados
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-card/50 rounded-xl border border-border/50">
                <div className="gradient-primary text-primary-foreground p-4 rounded-xl w-fit mx-auto mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Current Focus */}
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
            <div className="gradient-primary text-primary-foreground p-4 rounded-xl w-fit mx-auto mb-6">
              <Link2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Mientras tanto... ¡Obtén tu link personal!
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Si eres barbero, estilista o profesional de la belleza, puedes crear tu perfil 
              y obtener tu link bookeasy.mx/@tuusername para empezar a recibir reservas.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="btn-primary px-8 py-4"
            >
              Crear Mi Perfil Gratis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
