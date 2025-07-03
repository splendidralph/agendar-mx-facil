import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Share2, Calendar } from "lucide-react";

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


  return (
    <section className="py-12 md:py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-4 accent-gradient text-accent-foreground border-0 text-xs md:text-sm px-3 py-1">
            ✨ Características Premium - GRATIS en Beta ✨
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 px-2">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto px-2">
            Herramientas profesionales diseñadas específicamente para barberos, estilistas 
            y profesionales de la belleza en México
          </p>
        </div>

        {/* Main features - Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index}
              className={`hover-lift border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in relative overflow-hidden ${
                index === 1 ? 'md:col-span-2 lg:col-span-1 lg:scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4 p-4 md:p-6">
                <div className={`${
                  feature.color === 'primary' ? 'gradient-primary' : 'accent-gradient'
                } text-primary-foreground p-3 md:p-4 rounded-2xl w-fit mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <CardTitle className="text-foreground text-lg md:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`${feature.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'} text-xs`}
                >
                  {feature.highlight}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Comparison hint */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-4 md:p-8 border border-border/50">
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              ¿Por qué Bookeasy vs otras opciones?
            </h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base px-2">
              A diferencia de Instagram o WhatsApp Business, tu perfil Bookeasy está 
              <span className="font-semibold text-foreground"> diseñado específicamente para reservas</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
              <div className="text-center">
                <Badge variant="outline" className="mb-2 text-xs">Instagram</Badge>
                <p className="text-muted-foreground">❌ Depende del algoritmo</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-2 text-xs">WhatsApp Business</Badge>
                <p className="text-muted-foreground">❌ Solo texto y contacto</p>
              </div>
              <div className="text-center">
                <Badge className="mb-2 bg-primary text-primary-foreground text-xs">Bookeasy</Badge>
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