
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Link, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkProviderProfile();
    }
  }, [user]);

  const checkProviderProfile = async () => {
    if (!user) return;

    try {
      const { data: providerData, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching provider:', error);
        return;
      }

      if (!providerData || !providerData.profile_completed) {
        navigate('/onboarding');
        return;
      }

      setProvider(providerData);
    } catch (error) {
      console.error('Error checking provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (provider?.username) {
      const bookingUrl = `https://bookeasy.mx/${provider.username}`;
      navigator.clipboard.writeText(bookingUrl);
      toast.success("¡Link copiado al portapapeles!");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground hidden sm:inline font-inter">
              ¡Hola, {provider.business_name}!
            </span>
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mi Dashboard
            </h1>
            <p className="text-muted-foreground font-inter">
              Gestiona tus citas y perfil profesional
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="animate-slide-up border-border/50 shadow-lg card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Citas Hoy</p>
                    <p className="text-3xl font-bold text-foreground">0</p>
                    <p className="text-xs text-muted-foreground font-medium">Sin citas programadas</p>
                  </div>
                  <div className="gradient-primary p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Esta Semana</p>
                    <p className="text-3xl font-bold text-foreground">0</p>
                    <p className="text-xs text-muted-foreground font-medium">Sin citas</p>
                  </div>
                  <div className="gradient-accent p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Clientes</p>
                    <p className="text-3xl font-bold text-foreground">0</p>
                    <p className="text-xs text-muted-foreground font-medium">Sin clientes</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 shadow-lg card-hover" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold">Ingresos</p>
                    <p className="text-3xl font-bold text-foreground">$0</p>
                    <p className="text-xs text-muted-foreground font-medium">Esta semana</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Link */}
            <Card className="lg:col-span-1 animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Tu Link de Reservas</CardTitle>
                <CardDescription className="font-inter">
                  Comparte este link con tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <p className="text-sm font-mono text-foreground break-all">
                    bookeasy.mx/{provider.username}
                  </p>
                </div>
                <Button 
                  onClick={copyLink}
                  className="w-full btn-primary shadow-lg"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary"
                  onClick={() => window.open(`https://bookeasy.mx/${provider.username}`, '_blank')}
                >
                  Ver Mi Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card className="lg:col-span-2 animate-slide-up border-border/50 shadow-lg" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-foreground">Citas Recientes</CardTitle>
                <CardDescription className="font-inter">
                  Tus próximas citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-inter">No tienes citas programadas</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Las citas aparecerán aquí cuando los clientes hagan reservas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
