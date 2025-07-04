
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
import AvailabilityManager from "@/components/availability/AvailabilityManager";
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
      // First check if user is an admin - admins should go to admin dashboard
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error checking admin status:', adminError);
      }

      if (adminData) {
        console.log('Dashboard: Admin user detected, redirecting to admin dashboard');
        navigate('/admin');
        return;
      }

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
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Hero Background Elements */}
      <div className="absolute inset-0 gradient-hero-overlay"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Mobile-First Header */}
      <MobileHeader
        businessName={provider.business_name || "Proveedor"}
        onSignOut={handleSignOut}
        onCopyLink={copyLink}
        onViewProfile={viewProfile}
        username={provider.username}
        isMobile={isMobile}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className={`mb-8 animate-fade-in ${isMobile ? 'px-4' : ''}`}>
            <div className="glassmorphism rounded-2xl p-6 mb-6">
              <h1 className={`font-bold text-foreground mb-3 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Mi Dashboard
              </h1>
              <p className="text-muted-foreground font-inter text-lg">
                {isMobile ? 'Gestiona tus citas profesionalmente' : 'Gestiona tus citas y perfil profesional con elegancia'}
              </p>
            </div>
          </div>

          {/* Mobile-First Stats */}
          <MobileStats stats={stats} loading={statsLoading} isMobile={isMobile} />

          <div className={`grid gap-8 mb-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
            {/* Booking Link - Hidden on mobile (handled by FAB) */}
            {!isMobile && (
              <div className="lg:col-span-1 animate-scale-in glassmorphism rounded-2xl p-6 hover-lift" style={{ animationDelay: '0.4s' }}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Tu Link de Reservas</h3>
                  <p className="text-muted-foreground font-inter">
                    Comparte este link con tus clientes
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-mono text-foreground break-all">
                      {provider.username ? `bookeasy.mx/${provider.username}` : 'Configura tu username primero'}
                    </p>
                  </div>
                  <Button 
                    onClick={copyLink}
                    className="w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-lg touch-manipulation smooth-transition"
                    disabled={!provider.username}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-white/20 text-foreground hover:bg-white/10 hover:border-white/30 touch-manipulation smooth-transition"
                    onClick={viewProfile}
                    disabled={!provider.username}
                  >
                    Ver Mi Perfil
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile-First Bookings Management */}
            <div className={`animate-slide-up ${!isMobile ? 'lg:col-span-2' : ''}`} style={{ animationDelay: '0.5s' }}>
              <MobileBookingsTable providerId={provider.id} isMobile={isMobile} />
            </div>
          </div>

          {/* Profile, Services, Availability and Notification Management */}
          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} ${isMobile ? 'pb-24' : ''}`}>
            <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <ProfileSettings provider={provider} onUpdate={refreshProvider} />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
              <ServicesManager providerId={provider.id} />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.8s' }}>
              <AvailabilityManager providerId={provider.id} />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.9s' }}>
              <NotificationSettings provider={provider} onUpdate={refreshProvider} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
