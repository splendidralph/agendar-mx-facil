
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, Clock, Phone, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BookingDemo = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientData, setClientData] = useState({
    name: "",
    phone: ""
  });

  const services = [
    { id: 1, name: "Corte de Cabello", price: 150, duration: 30 },
    { id: 2, name: "Barba", price: 80, duration: 20 },
    { id: 3, name: "Corte + Barba", price: 200, duration: 45 }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reserva:", { selectedService, selectedDate, selectedTime, clientData });
    toast.success("¡Reserva confirmada! Recibirás un SMS de confirmación.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bookeasy-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-bookeasy-100">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 text-bookeasy-700 hover:bg-bookeasy-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary text-white p-2 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-bookeasy-800">Demo - Barbería José</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 animate-fade-in border-bookeasy-100">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  BJ
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold text-bookeasy-900">Barbería José</h1>
                  <p className="text-bookeasy-600 mb-4">Cortes modernos y tradicionales</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                    <div className="flex items-center text-bookeasy-600 text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      +52 55 1234 5678
                    </div>
                    <div className="flex items-center text-bookeasy-600 text-sm">
                      <Instagram className="h-4 w-4 mr-2" />
                      @barberia_jose
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Services */}
            <Card className="animate-slide-up border-bookeasy-100">
              <CardHeader>
                <CardTitle className="text-bookeasy-800">Selecciona un Servicio</CardTitle>
                <CardDescription>
                  Elige el servicio que deseas reservar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer smooth-transition ${
                      selectedService === service.name
                        ? "border-bookeasy-400 bg-bookeasy-50"
                        : "border-bookeasy-200 hover:border-bookeasy-300"
                    }`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-bookeasy-800">{service.name}</h3>
                        <div className="flex items-center text-sm text-bookeasy-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                      <div className="text-lg font-bold text-bookeasy-700">
                        ${service.price}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="animate-slide-up border-bookeasy-100">
              <CardHeader>
                <CardTitle className="text-bookeasy-800">Reservar Cita</CardTitle>
                <CardDescription>
                  Completa los datos para confirmar tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label className="text-bookeasy-700">Fecha *</Label>
                    <Input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border-bookeasy-200 focus:border-bookeasy-400"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label className="text-bookeasy-700">Horario Disponible *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time 
                            ? "bg-gradient-primary text-white border-none" 
                            : "border-bookeasy-200 text-bookeasy-600 hover:bg-bookeasy-50"
                          }
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-bookeasy-700">Tu Nombre *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={clientData.name}
                      onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                      className="border-bookeasy-200 focus:border-bookeasy-400"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-bookeasy-700">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="border-bookeasy-200 focus:border-bookeasy-400"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90 text-white smooth-transition"
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
