import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Share2, Calendar, Clock, Smartphone, MessageCircle, Star, BarChart3 } from "lucide-react";

const ModernFeaturesSection = () => {
  const mainFeatures = [
    {
      icon: Link2,
      title: "Tu Link Personalizado",
      description: "bookeasy.mx/@tuusername - Fácil de recordar y compartir",
      highlight: "Más profesional que un número de teléfono",
      color: "primary"
    },
    {
      icon: Share2,
      title: "Comparte Donde Quieras",
      description: "WhatsApp, Instagram, Facebook - Tu link funciona en todas partes",
      highlight: "Una sola URL para todas tus redes",
      color: "accent"
    },
    {
      icon: Calendar,
      title: "Gestión Inteligente",
      description: "Calendario automático que se sincroniza con tus horarios",
      highlight: "Sin dobles reservas ni confusiones",
      color: "primary"
    }
  ];

  const additionalFeatures = [
    {
      icon: Smartphone,
      title: "100% Móvil",
      description: "Diseñado para que tus clientes reserven desde su celular"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integrado",
      description: "Confirmaciones automáticas directo al WhatsApp"
    },
    {
      icon: Star,
      title: "Sistema de Reseñas",
      description: "Construye tu reputación con reseñas verificadas"
    },
    {
      icon: BarChart3,
      title: "Estadísticas",
      description: "Ve cuántas personas visitan tu perfil y reservan"
    },
    {
      icon: Clock,
      title: "Disponibilidad 24/7",
      description: "Tus clientes pueden reservar cuando les convenga"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Características Premium - Gratis
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Herramientas profesionales diseñadas específicamente para barberos, estilistas 
            y profesionales de la belleza en México
          </p>
        </div>

        {/* Main features - Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index}
              className={`hover-lift border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in relative overflow-hidden ${
                index === 1 ? 'lg:row-span-1 lg:scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className={`${
                  feature.color === 'primary' ? 'gradient-primary' : 'gradient-accent'
                } text-primary-foreground p-4 rounded-2xl w-fit mb-4 shadow-lg animate-glow`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`${feature.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}
                >
                  {feature.highlight}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bento-card text-center hover-lift animate-scale-in"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="gradient-primary text-primary-foreground p-3 rounded-xl w-fit mx-auto mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison hint */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-border/50">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¿Por qué Bookeasy vs otras opciones?
            </h3>
            <p className="text-muted-foreground mb-4">
              A diferencia de Instagram o WhatsApp Business, tu perfil Bookeasy está 
              <span className="font-semibold text-foreground"> diseñado específicamente para reservas</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Badge variant="outline" className="mb-2">Instagram</Badge>
                <p className="text-muted-foreground">❌ Depende del algoritmo</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2">WhatsApp Business</Badge>
                <p className="text-muted-foreground">❌ Solo texto y contacto</p>
              </div>
              <div className="text-center">
                <Badge className="mb-2 bg-primary text-primary-foreground">Bookeasy</Badge>
                <p className="text-primary">✅ Reservas automáticas 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernFeaturesSection;