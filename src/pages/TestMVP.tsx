import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TestBookingFlow } from '@/components/booking/TestBookingFlow';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Settings, Play } from 'lucide-react';

interface Provider {
  id: string;
  business_name: string;
  username: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  }>;
}

const TestMVP = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          business_name,
          username,
          services (
            id,
            name,
            price,
            duration_minutes
          )
        `)
        .eq('profile_completed', true)
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestBooking = (provider: Provider, service: any) => {
    setSelectedProvider(provider);
    setSelectedService(service);
  };

  if (selectedProvider && selectedService) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedProvider(null);
                setSelectedService(null);
              }}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <h1 className="text-3xl font-bold">Prueba de Reserva</h1>
            <p className="text-muted-foreground">
              Probando flujo de reserva con {selectedProvider.business_name}
            </p>
          </div>

          <TestBookingFlow
            providerId={selectedProvider.id}
            serviceId={selectedService.id}
            serviceName={selectedService.name}
            servicePrice={selectedService.price}
            serviceDuration={selectedService.duration_minutes}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Play className="h-8 w-8 text-primary" />
              Test MVP - BookEasy
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Onboarding</p>
                    <p className="text-sm text-muted-foreground">Crear perfil</p>
                  </div>
                  <Link to="/auth" className="ml-auto">
                    <Button size="sm">Probar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Dashboard</p>
                    <p className="text-sm text-muted-foreground">Panel de control</p>
                  </div>
                  <Link to="/dashboard" className="ml-auto">
                    <Button size="sm">Probar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Explore</p>
                    <p className="text-sm text-muted-foreground">Buscar profesionales</p>
                  </div>
                  <Link to="/explore" className="ml-auto">
                    <Button size="sm">Probar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-muted-foreground mb-6">
            {loading ? 'Cargando...' : `${providers.length} profesionales activos encontrados. Selecciona uno para probar el flujo de reserva.`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando profesionales...</p>
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No hay profesionales activos. ¿Quieres crear uno?
              </p>
              <Button onClick={() => navigate('/auth')}>
                Crear Perfil de Prueba
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{provider.business_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">@{provider.username}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      Servicios ({provider.services?.length || 0}):
                    </p>
                    {provider.services?.length > 0 ? (
                      <div className="space-y-2">
                        {provider.services.slice(0, 3).map((service) => (
                          <div key={service.id} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <p className="font-medium text-sm">{service.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {service.duration_minutes} min
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${service.price}</p>
                              <Button 
                                size="sm" 
                                onClick={() => handleTestBooking(provider, service)}
                                className="mt-1"
                              >
                                Reservar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin servicios</p>
                    )}

                    <div className="pt-2">
                      <Link to={`/${provider.username}`}>
                        <Button variant="outline" className="w-full">
                          Ver Perfil Público
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestMVP;