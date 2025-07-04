
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { toast } from "sonner";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import ServicesManager from "@/components/dashboard/ServicesManager";
import NotificationSettings from "@/components/dashboard/NotificationSettings";
import { useBookings } from "@/hooks/useBookings";
import MobileHeader from "@/components/dashboard/MobileHeader";
import MobileStats from "@/components/dashboard/MobileStats";
import MobileBookingsTable from "@/components/dashboard/MobileBookingsTable";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { stats, loading: statsLoading } = useBookings(provider?.id || '');

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
        .select('*, users!inner(email, full_name)')
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
    } else {
      toast.error("Necesitas configurar tu username primero");
    }
  };

  const viewProfile = () => {
    if (provider?.username) {
      navigate(`/${provider.username}`);
    } else {
      toast.error("Necesitas configurar tu username primero");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const refreshProvider = () => {
    checkProviderProfile();
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
      {/* Mobile-First Header */}
      <MobileHeader
        businessName={provider.business_name || "Proveedor"}
        onSignOut={handleSignOut}
        onCopyLink={copyLink}
        onViewProfile={viewProfile}
        username={provider.username}
        isMobile={isMobile}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className={`mb-6 animate-fade-in ${isMobile ? 'px-4' : ''}`}>
            <h1 className={`font-bold text-foreground mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Mi Dashboard
            </h1>
            <p className="text-muted-foreground font-inter">
              {isMobile ? 'Gestiona tus citas' : 'Gestiona tus citas y perfil profesional'}
            </p>
          </div>

          {/* Mobile-First Stats */}
          <MobileStats stats={stats} loading={statsLoading} isMobile={isMobile} />

          <div className={`grid gap-8 mb-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
            {/* Booking Link - Hidden on mobile (handled by FAB) */}
            {!isMobile && (
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
                      {provider.username ? `bookeasy.mx/${provider.username}` : 'Configura tu username primero'}
                    </p>
                  </div>
                  <Button 
                    onClick={copyLink}
                    className="w-full btn-primary shadow-lg touch-manipulation"
                    disabled={!provider.username}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-secondary touch-manipulation"
                    onClick={viewProfile}
                    disabled={!provider.username}
                  >
                    Ver Mi Perfil
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Mobile-First Bookings Management */}
            <div className={`animate-slide-up ${!isMobile ? 'lg:col-span-2' : ''}`} style={{ animationDelay: '0.5s' }}>
              <MobileBookingsTable providerId={provider.id} isMobile={isMobile} />
            </div>
          </div>

          {/* Profile, Services and Notification Management */}
          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'} ${isMobile ? 'pb-24' : ''}`}>
            <ProfileSettings provider={provider} onUpdate={refreshProvider} />
            <ServicesManager providerId={provider.id} />
            <NotificationSettings provider={provider} onUpdate={refreshProvider} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
