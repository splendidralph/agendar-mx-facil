
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, Clock, Phone, Instagram, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BookingDemo = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    phone: ""
  });

  const services = [
    { id: 1, name: "Corte de Cabello", price: 150, duration: 30, popular: true },
    { id: 2, name: "Barba", price: 80, duration: 20, popular: false },
    { id: 3, name: "Corte + Barba", price: 200, duration: 45, popular: true }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reserva:", { selectedService, selectedDate, selectedTime, clientData });
    setShowConfirmation(true);
    toast.success("¡Reserva confirmada! Recibirás un SMS de confirmación.");
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-border/50 shadow-2xl">
          <CardContent className="p-8">
            <div className="gradient-primary p-4 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary-foreground checkmark-animation" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">¡Reserva Confirmada!</h2>
            <div className="space-y-3 text-left bg-secondary/50 p-4 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-semibold text-foreground">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-semibold text-foreground">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span className="font-semibold text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-foreground">{clientData.name}</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 font-inter">
              Te enviaremos un SMS de confirmación y un recordatorio 2 horas antes de tu cita.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="btn-primary w-full"
            >
              Finalizar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 text-foreground hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Demo - Barbería José</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 animate-fade-in border-border/50 shadow-lg overflow-hidden">
            <div className="gradient-primary p-6 text-primary-foreground">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-lg">
                  BJ
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold mb-2">Barbería José</h1>
                  <p className="opacity-90 mb-4 font-inter">Cortes modernos y tradicionales</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <div className="flex items-center opacity-90 text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      +52 55 1234 5678
                    </div>
                    <div className="flex items-center opacity-90 text-sm">
                      <Instagram className="h-4 w-4 mr-2" />
                      @barberia_jose
                    </div>
                    <div className="flex items-center opacity-90 text-sm">
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      4.9 (127 reseñas)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Services */}
            <Card className="animate-slide-up border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Selecciona un Servicio</CardTitle>
                <CardDescription className="font-inter">
                  Elige el servicio que deseas reservar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-xl cursor-pointer smooth-transition relative ${
                      selectedService === service.name
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    {service.popular && (
                      <div className="absolute -top-2 -right-2">
                        <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-semibold">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${service.price}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Reservar Cita</CardTitle>
                <CardDescription className="font-inter">
                  Completa los datos para confirmar tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <Label className="text-foreground font-semibold">Fecha *</Label>
                    <Input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border-border focus:border-primary mt-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label className="text-foreground font-semibold">Horario Disponible *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time 
                            ? "btn-primary" 
                            : "border-border text-foreground hover:bg-secondary"
                          }
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-foreground font-semibold">Tu Nombre *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={clientData.name}
                      onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                      className="border-border focus:border-primary mt-2"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-foreground font-semibold">Teléfono *</Label>
                    <CustomPhoneInput
                      value={clientData.phone}
                      onChange={(value) => setClientData(prev => ({ ...prev, phone: value || "" }))}
                      placeholder="(55) 1234-5678"
                      defaultCountry="MX"
                      className="border-border focus:border-primary mt-2"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-accent py-6 text-lg font-semibold shadow-lg"
                    disabled={!selectedService || !selectedDate || !selectedTime}
                  >
                    Confirmar Reserva
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDemo;
