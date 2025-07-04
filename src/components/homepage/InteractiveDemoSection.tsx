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
        <div className="demo-card p-8 md:p-10 max-w-md mx-auto">
          <div className="text-center mb-8">
            <Avatar className="h-24 w-24 mx-auto mb-6 shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                MG
              </AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-bold text-foreground">María García</h3>
            <p className="text-muted-foreground text-lg">Estilista Profesional</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">4.9</span>
              <span className="text-muted-foreground">(127 reseñas)</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-base">Polanco, CDMX</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-base">+52 55 1234 5678</span>
            </div>
          </div>

          <Button 
            className="w-full mb-4 btn-accent py-3 text-base font-semibold"
            onClick={() => setActiveDemo('booking')}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Reservar Cita
          </Button>
          <Button variant="outline" className="w-full py-3 text-base font-medium hover:bg-muted/50">
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
        </div>
      )
    },
    booking: {
      title: "Sistema de Reservas",
      description: "Proceso simple para tus clientes",
      content: (
        <div className="demo-card p-8 md:p-10 max-w-md mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-foreground">Selecciona tu servicio</h3>
          
          <div className="space-y-4 mb-8">
            <div 
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                selectedService === 'haircut' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-border/60'
              }`}
              onClick={() => setSelectedService('haircut')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground text-lg">Corte y Peinado</h4>
                  <p className="text-muted-foreground mb-2">Corte profesional + styling</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">60 min</span>
                  </div>
                </div>
                <Badge variant={selectedService === 'haircut' ? 'default' : 'secondary'} className="text-base px-3 py-1">$350</Badge>
              </div>
            </div>
            
            <div 
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                selectedService === 'color' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-border/60'
              }`}
              onClick={() => setSelectedService('color')}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-foreground text-lg">Color Completo</h4>
                  <p className="text-muted-foreground mb-2">Aplicación de color + styling</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">120 min</span>
                  </div>
                </div>
                <Badge variant={selectedService === 'color' ? 'default' : 'secondary'} className="text-base px-3 py-1">$750</Badge>
              </div>
            </div>
          </div>

          <Button 
            className="w-full btn-primary py-3 text-base font-semibold"
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
        <div className="demo-card p-8 md:p-10 max-w-md mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-foreground">Horarios disponibles</h3>
          
          <div className="mb-6">
            <div className="text-base font-medium text-foreground mb-4">Viernes 15 Nov</div>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant={selectedTime === '09:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('09:00')}
              >
                09:00
              </Button>
              <Button variant="outline" size="sm" className="text-sm opacity-50 h-12" disabled>10:30</Button>
              <Button 
                variant={selectedTime === '12:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('12:00')}
              >
                12:00
              </Button>
              <Button 
                variant={selectedTime === '14:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('14:00')}
              >
                14:00
              </Button>
              <Button 
                variant={selectedTime === '15:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('15:30')}
              >
                15:30
              </Button>
              <Button 
                variant={selectedTime === '17:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('17:00')}
              >
                17:00
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-base font-medium text-foreground mb-4">Sábado 16 Nov</div>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant={selectedTime === '10:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('10:00')}
              >
                10:00
              </Button>
              <Button 
                variant={selectedTime === '11:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('11:30')}
              >
                11:30
              </Button>
              <Button variant="outline" size="sm" className="text-sm opacity-50 h-12" disabled>13:00</Button>
              <Button 
                variant={selectedTime === '14:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('14:30')}
              >
                14:30
              </Button>
              <Button 
                variant={selectedTime === '16:00' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('16:00')}
              >
                16:00
              </Button>
              <Button 
                variant={selectedTime === '17:30' ? 'default' : 'outline'} 
                size="sm" 
                className="text-sm h-12 touch-manipulation font-medium"
                onClick={() => setSelectedTime('17:30')}
              >
                17:30
              </Button>
            </div>
          </div>

          <Button 
            className="w-full btn-accent py-3 text-base font-semibold"
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
        <div className="demo-card p-8 md:p-10 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-500 text-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Check className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">¡Reserva Confirmada!</h3>
            <p className="text-muted-foreground text-lg">Tu cita ha sido agendada exitosamente</p>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="bg-muted/30 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6 text-base">
                <div>
                  <span className="text-muted-foreground block mb-1">Servicio:</span>
                  <p className="font-medium text-foreground">
                    {selectedService === 'haircut' ? 'Corte y Peinado' : 'Color Completo'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Precio:</span>
                  <p className="font-medium text-foreground">
                    {selectedService === 'haircut' ? '$350' : '$750'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Fecha:</span>
                  <p className="font-medium text-foreground">Viernes 15 Nov</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Hora:</span>
                  <p className="font-medium text-foreground">{selectedTime}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-base text-muted-foreground mb-2">
                📱 Confirmación enviada por WhatsApp
              </p>
              <p className="text-sm text-muted-foreground">
                ID de reserva: #BK2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full btn-accent py-3 text-base font-semibold"
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
              className="w-full py-3 text-base font-medium hover:bg-muted/50"
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
    <section className="py-20 md:py-28 px-4 section-modern">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
            Experimenta la diferencia
          </h2>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Ve cómo tus clientes interactúan con tu perfil profesional. Simple, rápido y efectivo.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Demo tabs */}
          <div className="flex justify-center mb-8 md:mb-12 border-b border-border/20 overflow-x-auto bg-card/50 backdrop-blur-sm rounded-t-2xl">
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
                  className={`modern-tab px-4 md:px-8 py-4 font-medium transition-all relative whitespace-nowrap text-base md:text-lg touch-manipulation rounded-t-xl ${
                    activeDemo === key 
                      ? 'modern-tab active text-primary font-semibold' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {demo.title}
                  {key === 'booking' && selectedService && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      1
                    </span>
                  )}
                  {key === 'schedule' && selectedTime && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      1
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Demo content */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].title}
            </h3>
            <p className="text-muted-foreground mb-10 text-lg">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].description}
            </p>
            
            <div className="animate-scale-in">
              {demoProfiles[activeDemo as keyof typeof demoProfiles].content}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 md:mt-16 px-4">
            <p className="text-muted-foreground mb-6 text-base md:text-lg">
              {showConfirmation 
                ? "¡Así de fácil es recibir reservas con Bookeasy!" 
                : "¿Listo para crear tu propio perfil profesional?"
              }
            </p>
            <Button 
              size="lg" 
              className="btn-accent w-full max-w-sm md:w-auto touch-manipulation px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                if (!showConfirmation) {
                  setActiveDemo('profile');
                  setSelectedService(null);
                  setSelectedTime(null);
                  setShowConfirmation(false);
                }
              }}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              {showConfirmation ? "Crear Mi Perfil Gratis" : "Probar Demo Completo"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;