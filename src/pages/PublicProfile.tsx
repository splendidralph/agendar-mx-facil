import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Instagram, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Provider {
  id: string;
  business_name: string;
  bio: string;
  category: string;
  address: string;
  instagram_handle: string;
  username: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
}

// Reserved route names that should not be treated as usernames
const RESERVED_ROUTES = [
  'auth', 'register', 'setup', 'onboarding', 'dashboard', 
  'booking', 'explore', 'admin', 'api', 'profile'
];

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('PublicProfile: Route params:', { username });
    console.log('PublicProfile: Current URL:', window.location.href);
    console.log('PublicProfile: Current pathname:', window.location.pathname);
    
    if (username) {
      // Check if username is a reserved route
      if (RESERVED_ROUTES.includes(username.toLowerCase())) {
        console.log('PublicProfile: Username matches reserved route, redirecting to 404');
        navigate('/not-found', { replace: true });
        return;
      }

      // Remove @ symbol if it exists in the username parameter
      const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
      console.log('PublicProfile: Clean username:', cleanUsername);
      fetchProviderData(cleanUsername);
    } else {
      console.error('PublicProfile: No username in route params');
      setLoading(false);
    }
  }, [username, navigate]);

  const fetchProviderData = async (cleanUsername: string) => {
    try {
      console.log('PublicProfile: Fetching provider data for username:', cleanUsername);
      
      // Fetch provider data
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('username', cleanUsername)
        .eq('profile_completed', true)
        .eq('is_active', true)
        .single();

      console.log('PublicProfile: Provider query result:', { providerData, providerError });

      if (providerError) {
        console.error('PublicProfile: Error fetching provider:', providerError);
        if (providerError.code === 'PGRST116') {
          console.log('PublicProfile: No provider found, showing not found message');
          toast.error('Perfil no encontrado');
        } else {
          toast.error('Error cargando el perfil');
        }
        setLoading(false);
        return;
      }

      if (!providerData) {
        console.log('PublicProfile: No provider data found');
        toast.error('Perfil no encontrado');
        setLoading(false);
        return;
      }

      console.log('PublicProfile: Provider found:', providerData);
      setProvider(providerData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerData.id)
        .eq('is_active', true);

      console.log('PublicProfile: Services query result:', { servicesData, servicesError });

      if (servicesError) {
        console.error('PublicProfile: Error fetching services:', servicesError);
        toast.error('Error cargando los servicios');
        setLoading(false);
        return;
      }

      setServices(servicesData || []);
      console.log('PublicProfile: Successfully loaded provider and services');
    } catch (error) {
      console.error('PublicProfile: Unexpected error:', error);
      toast.error('Error inesperado cargando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels = {
    corte_barberia: 'Corte y Barbería',
    unas: 'Uñas y Manicure',
    maquillaje_cejas: 'Maquillaje y Cejas',
    cuidado_facial: 'Cuidado Facial',
    masajes_relajacion: 'Masajes y Relajación',
    color_alisado: 'Color y Alisado'
  };

  const handleBookService = (service: Service) => {
    // For now, just show a toast. Later this can be expanded to booking functionality
    toast.success(`Próximamente podrás reservar: ${service.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Perfil no encontrado</h1>
          <p className="text-muted-foreground">
            El perfil @{username} no existe o no está disponible.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Provider Profile Card */}
          <Card className="border-border/50 shadow-lg mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{provider.business_name}</CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {categoryLabels[provider.category as keyof typeof categoryLabels] || provider.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground">@{provider.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {provider.bio && (
                <p className="text-muted-foreground">{provider.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {provider.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {provider.address}
                  </div>
                )}
                {provider.instagram_handle && (
                  <div className="flex items-center gap-1">
                    <Instagram className="h-4 w-4" />
                    @{provider.instagram_handle}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Servicios Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-start p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {service.description && (
                          <p className="text-muted-foreground mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration_minutes} min
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[service.category as keyof typeof categoryLabels] || service.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 font-semibold text-xl mb-2">
                          <DollarSign className="h-5 w-5" />
                          {service.price}
                        </div>
                        <Button 
                          onClick={() => handleBookService(service)}
                          className="btn-primary"
                        >
                          Reservar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
