import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, MapPin, Phone, MessageCircle, ExternalLink, Check, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState('profile');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const demoProfiles = {
    profile: {
      title: "Perfil Profesional",
      description: "Así se ve tu perfil para tus clientes",
      content: (
        <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 max-w-sm mx-auto">
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

          <Button 
            className="w-full mb-3 btn-accent"
            onClick={() => setActiveDemo('booking')}
          >
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
        <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 max-w-sm mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Selecciona tu servicio</h3>
          
          <div className="space-y-3 mb-6">
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                selectedService === 'haircut' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedService('haircut')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">Corte y Peinado</h4>
                  <p className="text-sm text-muted-foreground">Corte profesional + styling</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">60 min</span>
                  </div>
                </div>
                <Badge variant={selectedService === 'haircut' ? 'default' : 'secondary'}>$350</Badge>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                selectedService === 'color' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedService('color')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground">Color Completo</h4>
                  <p className="text-sm text-muted-foreground">Aplicación de color + styling</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">120 min</span>
                  </div>
                </div>
                <Badge variant={selectedService === 'color' ? 'default' : 'secondary'}>$750</Badge>
              </div>
            </div>
          </div>

          <Button 
            className="w-full btn-primary"
            disabled={!selectedService}
            onClick={() => selectedService && setActiveDemo('schedule')}
          >
            Seleccionar Horario
          </Button>
        </div>
      )
    },
    schedule: {
      title: "Calendario Inteligente",
      description: "Horarios disponibles en tiempo real",
      content: (
        <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 max-w-sm mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Horarios disponibles</h3>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-foreground mb-2">Viernes 15 Nov</div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedTime === '09:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('09:00')}
              >
                09:00
              </Button>
              <Button variant="outline" size="sm" className="text-xs opacity-50 h-10" disabled>10:30</Button>
              <Button 
                variant={selectedTime === '12:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('12:00')}
              >
                12:00
              </Button>
              <Button 
                variant={selectedTime === '14:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('14:00')}
              >
                14:00
              </Button>
              <Button 
                variant={selectedTime === '15:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('15:30')}
              >
                15:30
              </Button>
              <Button 
                variant={selectedTime === '17:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('17:00')}
              >
                17:00
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-2">Sábado 16 Nov</div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedTime === '10:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('10:00')}
              >
                10:00
              </Button>
              <Button 
                variant={selectedTime === '11:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('11:30')}
              >
                11:30
              </Button>
              <Button variant="outline" size="sm" className="text-xs opacity-50 h-10" disabled>13:00</Button>
              <Button 
                variant={selectedTime === '14:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('14:30')}
              >
                14:30
              </Button>
              <Button 
                variant={selectedTime === '16:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('16:00')}
              >
                16:00
              </Button>
              <Button 
                variant={selectedTime === '17:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-xs h-10 touch-manipulation"
                onClick={() => setSelectedTime('17:30')}
              >
                17:30
              </Button>
            </div>
          </div>

          <Button 
            className="w-full btn-accent"
            disabled={!selectedTime || isLoading}
            onClick={async () => {
              if (selectedTime) {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setIsLoading(false);
                setShowConfirmation(true);
                setActiveDemo('confirmation');
              }
            }}
          >
            {isLoading ? 'Procesando...' : selectedTime ? `Confirmar: ${selectedTime}` : 'Selecciona horario'}
          </Button>
        </div>
      )
    },
    confirmation: {
      title: "¡Reserva Confirmada!",
      description: "Tu cita ha sido agendada exitosamente",
      content: (
        <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/50 max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="bg-green-500 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">¡Reserva Confirmada!</h3>
            <p className="text-muted-foreground">Tu cita ha sido agendada</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Servicio:</span>
                  <p className="font-medium">
                    {selectedService === 'haircut' ? 'Corte y Peinado' : 'Color Completo'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio:</span>
                  <p className="font-medium">
                    {selectedService === 'haircut' ? '$350' : '$750'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <p className="font-medium">Viernes 15 Nov</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Hora:</span>
                  <p className="font-medium">{selectedTime}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                📱 Confirmación enviada por WhatsApp
              </p>
              <p className="text-xs text-muted-foreground">
                ID de reserva: #BK2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full btn-accent"
              onClick={() => {
                setActiveDemo('profile');
                setSelectedService(null);
                setSelectedTime(null);
                setShowConfirmation(false);
              }}
            >
              Nueva Reserva
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setActiveDemo('profile');
                setSelectedService(null);
                setSelectedTime(null);
                setShowConfirmation(false);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Perfil
            </Button>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-12 md:py-16 px-4 gradient-hero-overlay">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-4 px-2">
            Experimenta la diferencia
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-2">
            Ve cómo tus clientes interactúan con tu perfil profesional. Simple, rápido y efectivo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Demo tabs */}
          <div className="flex justify-center mb-6 md:mb-8 border-b border-border overflow-x-auto">
            <div className="flex min-w-max px-4 md:px-0">
              {Object.entries(demoProfiles).filter(([key]) => key !== 'confirmation').map(([key, demo]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveDemo(key);
                    if (key === 'profile') {
                      setSelectedService(null);
                      setSelectedTime(null);
                      setShowConfirmation(false);
                    }
                  }}
                  className={`px-3 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap text-sm md:text-base touch-manipulation ${
                    activeDemo === key 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {demo.title}
                  {key === 'booking' && selectedService && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      1
                    </span>
                  )}
                  {key === 'schedule' && selectedTime && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>
              ))}
            </div>
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
          <div className="text-center mt-8 md:mt-12 px-4">
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              {showConfirmation 
                ? "¡Así de fácil es recibir reservas con Bookeasy!" 
                : "¿Listo para crear tu propio perfil profesional?"
              }
            </p>
            <Button 
              size="lg" 
              className="btn-accent w-full max-w-xs md:w-auto touch-manipulation"
              onClick={() => {
                if (!showConfirmation) {
                  setActiveDemo('profile');
                  setSelectedService(null);
                  setSelectedTime(null);
                  setShowConfirmation(false);
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {showConfirmation ? "Crear Mi Perfil Gratis" : "Probar Demo Completo"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;