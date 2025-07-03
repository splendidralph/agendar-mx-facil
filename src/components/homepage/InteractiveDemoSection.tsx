import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, MapPin, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState('profile');

  const demoProfiles = {
    profile: {
      title: "Perfil Profesional",
      description: "Así se ve tu perfil para tus clientes",
      content: (
        <div className="bg-card rounded-2xl p-6 border border-border/50 max-w-sm mx-auto">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                MG
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-foreground">María García</h3>
            <p className="text-muted-foreground">Estilista Profesional</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.9</span>
              <span className="text-muted-foreground text-sm">(127 reseñas)</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Polanco, CDMX</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+52 55 1234 5678</span>
            </div>
          </div>

          <Button className="w-full mb-3 btn-accent">
            <Calendar className="h-4 w-4 mr-2" />
            Reservar Cita
          </Button>
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      )
    },
    booking: {
      title: "Sistema de Reservas",
      description: "Proceso simple para tus clientes",
      content: (
        <div className="bg-card rounded-2xl p-6 border border-border/50 max-w-sm mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Selecciona tu servicio</h3>
          
          <div className="space-y-3 mb-6">
            <div className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">Corte y Peinado</h4>
                  <p className="text-sm text-muted-foreground">Corte profesional + styling</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">60 min</span>
                  </div>
                </div>
                <Badge variant="secondary">$350</Badge>
              </div>
            </div>
            
            <div className="border-2 border-primary rounded-lg p-3 bg-primary/5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">Color Completo</h4>
                  <p className="text-sm text-muted-foreground">Aplicación de color + styling</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">120 min</span>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">$750</Badge>
              </div>
            </div>
          </div>

          <Button className="w-full btn-primary">
            Seleccionar Horario
          </Button>
        </div>
      )
    },
    schedule: {
      title: "Calendario Inteligente",
      description: "Horarios disponibles en tiempo real",
      content: (
        <div className="bg-card rounded-2xl p-6 border border-border/50 max-w-sm mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Horarios disponibles</h3>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-foreground mb-2">Viernes 15 Nov</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">09:00</Button>
              <Button variant="outline" size="sm" className="text-xs opacity-50" disabled>10:30</Button>
              <Button variant="outline" size="sm" className="text-xs">12:00</Button>
              <Button size="sm" className="text-xs btn-primary">14:00</Button>
              <Button variant="outline" size="sm" className="text-xs">15:30</Button>
              <Button variant="outline" size="sm" className="text-xs">17:00</Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-2">Sábado 16 Nov</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">10:00</Button>
              <Button variant="outline" size="sm" className="text-xs">11:30</Button>
              <Button variant="outline" size="sm" className="text-xs opacity-50" disabled>13:00</Button>
              <Button variant="outline" size="sm" className="text-xs">14:30</Button>
              <Button variant="outline" size="sm" className="text-xs">16:00</Button>
              <Button variant="outline" size="sm" className="text-xs">17:30</Button>
            </div>
          </div>

          <Button className="w-full btn-accent">
            Confirmar: Viernes 14:00
          </Button>
        </div>
      )
    }
  };

  return (
    <section className="py-16 px-4 gradient-hero-overlay">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Experimenta la diferencia
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ve cómo tus clientes interactúan con tu perfil profesional. Simple, rápido y efectivo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Demo tabs */}
          <div className="flex justify-center mb-8 border-b border-border">
            {Object.entries(demoProfiles).map(([key, demo]) => (
              <button
                key={key}
                onClick={() => setActiveDemo(key)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeDemo === key 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>

          {/* Demo content */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].title}
            </h3>
            <p className="text-muted-foreground mb-8">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].description}
            </p>
            
            <div className="animate-scale-in">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].content}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              ¿Listo para crear tu propio perfil profesional?
            </p>
            <Button size="lg" className="btn-accent">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Demo Completo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;