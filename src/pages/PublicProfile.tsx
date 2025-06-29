
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Instagram, Clock, DollarSign, ArrowLeft, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { categoryLabels } from '@/utils/serviceCategories';

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
        .maybeSingle();

      console.log('PublicProfile: Provider query result:', { providerData, providerError });

      if (providerError) {
        console.error('PublicProfile: Error fetching provider:', providerError);
        toast.error('Error cargando el perfil');
        setLoading(false);
        return;
      }

      if (!providerData) {
        console.log('PublicProfile: No provider data found');
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
      } else {
        setServices(servicesData || []);
        console.log('PublicProfile: Successfully loaded provider and services');
      }
    } catch (error) {
      console.error('PublicProfile: Unexpected error:', error);
      toast.error('Error inesperado cargando el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    toast.success(`Próximamente podrás reservar: ${service.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex items-center justify-center">
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
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2 rounded-xl">
              {provider.business_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xl font-bold text-foreground">{provider.business_name}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header - Similar to BookingDemo */}
          <Card className="mb-8 animate-fade-in border-border/50 shadow-lg overflow-hidden">
            <div className="gradient-primary p-6 text-primary-foreground">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-lg">
                  {provider.business_name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold mb-2">{provider.business_name}</h1>
                  <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                    {categoryLabels[provider.category as keyof typeof categoryLabels] || provider.category}
                  </Badge>
                  <p className="text-sm opacity-90 mb-2">@{provider.username}</p>
                  {provider.bio && (
                    <p className="opacity-90 mb-4 font-inter">{provider.bio}</p>
                  )}
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

          {/* Services Section - Similar to BookingDemo */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Servicios Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 border rounded-xl hover:border-primary/50 hover:shadow-sm smooth-transition relative">
                      <div className="flex justify-between items-start">
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
                          <div className="flex items-center gap-1 font-bold text-xl mb-2">
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
