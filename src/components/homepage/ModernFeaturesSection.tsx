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
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <Badge className="mb-6 bg-accent/10 text-accent border border-accent/20 text-sm px-4 py-2 rounded-full">
            ✨ Características Premium - GRATIS en Beta ✨
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Herramientas profesionales diseñadas específicamente para barberos, estilistas 
            y profesionales de la belleza en México
          </p>
        </div>

        {/* Main features - Enhanced Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-2 border-0 bg-card shadow-lg backdrop-blur-sm transition-all duration-500 relative overflow-hidden rounded-3xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 p-6 md:p-8">
                <div className={`${
                  feature.color === 'primary' ? 'gradient-primary' : 'accent-gradient'
                } text-primary-foreground p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <CardTitle className="text-foreground text-xl md:text-2xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed text-base md:text-lg">
                  {feature.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`${feature.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/10 text-accent border-accent/20'} text-sm px-3 py-1 rounded-full border`}
                >
                  {feature.highlight}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced comparison section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-card via-card/80 to-card/60 rounded-3xl p-8 md:p-12 border border-border/50 shadow-lg backdrop-blur-sm max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Por qué Bookeasy vs otras opciones?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
              A diferencia de Instagram o WhatsApp Business, tu perfil Bookeasy está 
              <span className="font-semibold text-foreground"> diseñado específicamente para reservas</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center p-6 rounded-2xl bg-background/50 border border-border/30">
                <Badge variant="outline" className="mb-4 text-sm px-3 py-1">Instagram</Badge>
                <p className="text-muted-foreground text-base">❌ Depende del algoritmo</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-background/50 border border-border/30">
                <Badge variant="outline" className="mb-4 text-sm px-3 py-1">WhatsApp Business</Badge>
                <p className="text-muted-foreground text-base">❌ Solo texto y contacto</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <Badge className="mb-4 bg-primary text-primary-foreground text-sm px-3 py-1">Bookeasy</Badge>
                <p className="text-primary font-medium text-base">✅ Reservas automáticas 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernFeaturesSection;