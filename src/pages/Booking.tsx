
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronLeft, Clock, Phone, Instagram, CheckCircle, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { categoryLabels } from "@/utils/serviceCategories";

interface Provider {
  id: string;
  business_name: string;
  bio: string;
  category: string;
  address: string;
  instagram_handle: string;
  username: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
}

const Booking = () => {
  const { username, serviceId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  useEffect(() => {
    if (username) {
      fetchProviderData();
    }
  }, [username]);

  useEffect(() => {
    if (serviceId && services.length > 0) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [serviceId, services]);

  const fetchProviderData = async () => {
    try {
      console.log('Booking: Fetching provider data for username:', username);
      
      const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
      
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('username', cleanUsername)
        .eq('profile_completed', true)
        .eq('is_active', true)
        .maybeSingle();

      if (providerError) {
        console.error('Booking: Error fetching provider:', providerError);
        toast.error('Error cargando el proveedor');
        return;
      }

      if (!providerData) {
        console.log('Booking: No provider found');
        toast.error('Proveedor no encontrado');
        navigate('/');
        return;
      }

      setProvider(providerData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerData.id)
        .eq('is_active', true);

      if (servicesError) {
        console.error('Booking: Error fetching services:', servicesError);
        toast.error('Error cargando los servicios');
      } else {
        setServices(servicesData || []);
      }
    } catch (error) {
      console.error('Booking: Unexpected error:', error);
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error('Por favor selecciona un servicio');
      return;
    }
    
    console.log("Reserva:", { 
      provider: provider?.business_name,
      service: selectedService.name,
      date: selectedDate, 
      time: selectedTime, 
      client: clientData 
    });
    setShowConfirmation(true);
    toast.success("¡Reserva registrada! Te contactaremos pronto para confirmar.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando información de reserva...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Proveedor no encontrado</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-border/50 shadow-2xl">
          <CardContent className="p-8">
            <div className="gradient-primary p-4 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary-foreground checkmark-animation" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">¡Solicitud de Reserva Enviada!</h2>
            <div className="space-y-3 text-left bg-secondary/50 p-4 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Negocio:</span>
                <span className="font-semibold text-foreground">{provider.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-semibold text-foreground">{selectedService?.name}</span>
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
              Hemos enviado tu solicitud de reserva. {provider.business_name} se pondrá en contacto contigo para confirmar la disponibilidad.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/${provider.username}`)}
                variant="outline"
                className="w-full"
              >
                Ver Perfil
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="btn-primary w-full"
              >
                Finalizar
              </Button>
            </div>
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
            onClick={() => navigate(`/${provider.username}`)}
            className="mr-4 text-foreground hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Reservar - {provider.business_name}</span>
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
                  {provider.business_name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold mb-2">{provider.business_name}</h1>
                  <p className="opacity-90 mb-4 font-inter">{provider.bio || `${categoryLabels[provider.category as keyof typeof categoryLabels] || provider.category}`}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    {provider.phone && (
                      <div className="flex items-center opacity-90 text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {provider.phone}
                      </div>
                    )}
                    {provider.instagram_handle && (
                      <div className="flex items-center opacity-90 text-sm">
                        <Instagram className="h-4 w-4 mr-2" />
                        @{provider.instagram_handle}
                      </div>
                    )}
                    {provider.address && (
                      <div className="flex items-center opacity-90 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {provider.address}
                      </div>
                    )}
                    <div className="flex items-center opacity-90 text-sm">
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      Nuevo en BookEasy
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
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay servicios disponibles</p>
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-xl cursor-pointer smooth-transition ${
                        selectedService?.id === service.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration_minutes} min
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary">
                          ${service.price}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Solicitar Reserva</CardTitle>
                <CardDescription className="font-inter">
                  Completa los datos para solicitar tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <Label className="text-foreground font-semibold">Fecha Preferida *</Label>
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
                    <Label className="text-foreground font-semibold">Horario Preferido *</Label>
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
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="border-border focus:border-primary mt-2"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground font-semibold">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                      className="border-border focus:border-primary mt-2"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-accent py-6 text-lg font-semibold shadow-lg"
                    disabled={!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone}
                  >
                    Solicitar Reserva
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

export default Booking;
