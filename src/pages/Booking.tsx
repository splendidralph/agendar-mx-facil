
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronLeft, Clock, Phone, Instagram, CheckCircle, Star, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { categoryLabels } from "@/utils/serviceCategories";
import UnifiedBookingCalendar from "@/components/booking/UnifiedBookingCalendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Provider {
  id: string;
  business_name: string;
  bio: string;
  category: string;
  address: string;
  instagram_handle: string;
  username: string;
  phone: string;
  colonia?: string;
  postal_code?: string;
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    colonia: "",
    postalCode: ""
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedService || !provider) {
      const errorMsg = 'Por favor selecciona un servicio';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!selectedDate || !selectedTime) {
      const errorMsg = 'Por favor selecciona fecha y hora';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const formattedDate = selectedDate.toISOString().split('T')[0];

    if (!clientData.name || !clientData.phone) {
      const errorMsg = 'Por favor completa tu nombre y teléfono';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setSubmitting(true);

    try {
      console.log("Creating booking:", {
        provider: provider.business_name,
        service: selectedService.name,
        date: formattedDate,
        time: selectedTime,
        client: { name: clientData.name, phone: clientData.phone, hasEmail: !!clientData.email }
      });

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          providerId: provider.id,
          serviceId: selectedService.id,
          bookingDate: formattedDate,
          bookingTime: selectedTime,
          clientData: clientData,
          isGuest: true
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Error connecting to booking service');
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Error al crear la reserva';
        console.error('Booking creation failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Booking created successfully:', data);
      setShowConfirmation(true);
      toast.success("¡Reserva creada exitosamente!");

    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.message || 'Error al crear la reserva. Inténtalo de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
    const formattedDate = selectedDate?.toISOString().split('T')[0] || '';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-border/50 shadow-2xl">
          <CardContent className="p-8">
            <div className="gradient-primary p-4 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary-foreground checkmark-animation" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">¡Reserva Creada Exitosamente!</h2>
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
                <span className="font-semibold text-foreground">{formattedDate}</span>
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
              Tu reserva ha sido guardada exitosamente. {provider.business_name} se pondrá en contacto contigo para confirmar la disponibilidad.
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
                     {(provider.colonia || provider.address) && (
                      <div className="flex items-center opacity-90 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {provider.colonia || provider.address}
                      </div>
                    )}
                    <div className="flex items-center opacity-90 text-sm">
                      <Star className="h-4 w-4 mr-2 fill-current" />
                      {provider.colonia ? `Profesional en ${provider.colonia}` : 'Nuevo en BookEasy'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-8">
            {/* Services Selection */}
            <Card className="animate-slide-up border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground">Selecciona un servicio</CardTitle>
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
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-xl cursor-pointer smooth-transition touch-manipulation ${
                          selectedService?.id === service.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1 mb-2">{service.description}</p>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration_minutes} minutos
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              ${service.price}
                            </div>
                            <div className="text-xs text-muted-foreground">MXN</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Calendar - Only show if service is selected */}
            {selectedService && (
              <div className="animate-slide-up">
                <UnifiedBookingCalendar
                  providerId={provider.id}
                  serviceId={selectedService.id}
                  serviceDuration={selectedService.duration_minutes}
                  onDateTimeSelect={(date, time) => {
                    setSelectedDate(date);
                    setSelectedTime(time);
                  }}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
              </div>
            )}

            {/* Client Details Form - Only show if date and time are selected */}
            {selectedService && selectedDate && selectedTime && (
              <Card className="animate-slide-up border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-foreground">Tus datos</CardTitle>
                  <CardDescription className="font-inter">
                    Completa la información para confirmar tu cita
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{error}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground font-medium">Nombre completo *</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={clientData.name}
                          onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                          className="border-border focus:border-primary mt-2 h-12"
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-foreground font-medium">Teléfono *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={clientData.phone}
                          onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                          className="border-border focus:border-primary mt-2 h-12"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground font-medium">Email (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientData.email}
                        onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                        className="border-border focus:border-primary mt-2 h-12"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="client-colonia" className="text-foreground font-medium">Tu colonia (opcional)</Label>
                      <Input
                        id="client-colonia"
                        value={clientData.colonia}
                        onChange={(e) => setClientData(prev => ({ ...prev, colonia: e.target.value }))}
                        className="border-border focus:border-primary mt-2 h-12"
                        placeholder="Ej. Roma Norte"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-foreground font-medium">Notas adicionales (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={clientData.notes}
                        onChange={(e) => setClientData(prev => ({ ...prev, notes: e.target.value }))}
                        className="border-border focus:border-primary mt-2"
                        placeholder="Cualquier información adicional..."
                        rows={3}
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 space-y-2">
                      <h4 className="font-medium text-foreground">Resumen de tu cita:</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Servicio:</span>
                          <span className="font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fecha:</span>
                          <span className="font-medium">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hora:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duración:</span>
                          <span className="font-medium">{selectedService.duration_minutes} min</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">${selectedService.price} MXN</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary h-12 text-lg font-semibold shadow-lg touch-manipulation"
                      disabled={!clientData.name || !clientData.phone || submitting}
                    >
                      {submitting ? 'Creando Reserva...' : 'Confirmar Reserva'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
