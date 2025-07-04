
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, Phone, Instagram, CheckCircle, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { categoryLabels } from "@/utils/serviceCategories";
import ProgressiveBookingFlow from "@/components/booking/ProgressiveBookingFlow";
import ServiceSelectionStep from "@/components/booking/steps/ServiceSelectionStep";
import DateTimeStep from "@/components/booking/steps/DateTimeStep";
import ClientDetailsStep from "@/components/booking/steps/ClientDetailsStep";
import { useIsMobile } from "@/hooks/use-mobile";
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
  category?: string;
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
  const isMobile = useIsMobile();

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
    <div>
      {/* Header - Only show on desktop */}
      {!isMobile && (
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
      )}

      {/* Profile Header - Only show on desktop */}
      {!isMobile && (
        <div className="bg-gradient-to-br from-secondary to-background py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="animate-fade-in border-border/50 shadow-lg overflow-hidden">
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
            </div>
          </div>
        </div>
      )}

      {/* Progressive Booking Flow */}
      <ProgressiveBookingFlow
        services={services}
        providerId={provider.id}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        clientData={clientData}
        onServiceSelect={(service) => setSelectedService(service)}
        onDateTimeSelect={(date, time) => {
          setSelectedDate(date);
          setSelectedTime(time);
        }}
        onClientDataChange={setClientData}
        onSubmit={() => handleBooking({ preventDefault: () => {} } as React.FormEvent)}
      >
        <ServiceSelectionStep
          services={services}
          selectedService={selectedService}
          onServiceSelect={(service) => setSelectedService(service)}
          isMobile={isMobile}
        />
        
        <DateTimeStep
          providerId={provider.id}
          serviceId={selectedService?.id}
          serviceDuration={selectedService?.duration_minutes}
          onDateTimeSelect={(date, time) => {
            setSelectedDate(date);
            setSelectedTime(time);
          }}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
        
        <ClientDetailsStep
          clientData={clientData}
          onClientDataChange={setClientData}
          selectedService={selectedService}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          error={error}
          isMobile={isMobile}
        />
      </ProgressiveBookingFlow>
    </div>
  );
};

export default Booking;
