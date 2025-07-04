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
    <section className="py-20 md:py-28 px-4 section-modern">
      <div className="container mx-auto">
        <div className="text-center mb-20 md:mb-24">
          <Badge className="mb-8 bg-accent/10 text-accent border border-accent/20 px-6 py-3 rounded-full text-base font-medium shadow-sm">
            ✨ Características Premium - GRATIS en Beta ✨
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Herramientas profesionales diseñadas específicamente para barberos, estilistas 
            y profesionales de la belleza en México
          </p>
        </div>

        {/* Main features - Enhanced Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-20 md:mb-24">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index}
              className="modern-card group p-8 md:p-10 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className={`${
                  feature.color === 'primary' ? 'gradient-primary' : 'accent-gradient'
                } text-primary-foreground p-5 rounded-2xl w-fit mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 md:h-9 md:w-9" />
                </div>
                <h3 className="text-foreground text-2xl md:text-3xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed text-lg md:text-xl">
                  {feature.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`${feature.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent/10 text-accent border-accent/20'} px-4 py-2 rounded-full border font-medium`}
                >
                  {feature.highlight}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced comparison section */}
        <div className="text-center">
          <div className="modern-card p-10 md:p-16 max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ¿Por qué Bookeasy vs otras opciones?
            </h3>
            <p className="text-muted-foreground mb-12 text-xl leading-relaxed max-w-3xl mx-auto">
              A diferencia de Instagram o WhatsApp Business, tu perfil Bookeasy está 
              <span className="font-semibold text-foreground"> diseñado específicamente para reservas</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              <div className="text-center p-8 rounded-2xl bg-background/50 border border-border/30 transition-all hover:shadow-md">
                <Badge variant="outline" className="mb-6 px-4 py-2 text-base">Instagram</Badge>
                <p className="text-muted-foreground text-lg">❌ Depende del algoritmo</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-background/50 border border-border/30 transition-all hover:shadow-md">
                <Badge variant="outline" className="mb-6 px-4 py-2 text-base">WhatsApp Business</Badge>
                <p className="text-muted-foreground text-lg">❌ Solo texto y contacto</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20 transition-all hover:shadow-md">
                <Badge className="mb-6 bg-primary text-primary-foreground px-4 py-2 text-base">Bookeasy</Badge>
                <p className="text-primary font-medium text-lg">✅ Reservas automáticas 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernFeaturesSection;