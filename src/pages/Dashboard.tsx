
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBookings } from "@/hooks/useBookings";
import MobileHeader from "@/components/dashboard/MobileHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatWidget from "@/components/ChatWidget";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/20"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Mobile-First Header */}
      <MobileHeader
        businessName={provider.business_name || "Proveedor"}
        onSignOut={handleSignOut}
        onCopyLink={copyLink}
        onViewProfile={viewProfile}
        username={provider.username}
        isMobile={isMobile}
        activeTab={activeTab}
        onTabChange={isMobile ? setActiveTab : undefined}
        provider={provider}
        onRefreshProvider={refreshProvider}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className={`mb-8 animate-fade-in ${isMobile ? 'px-4' : ''}`}>
            <div className="glassmorphism rounded-3xl p-6 mb-6">
              <h1 className={`font-bold text-foreground mb-3 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                Mi Dashboard
              </h1>
              <p className="text-muted-foreground font-inter text-lg">
                {isMobile ? 'Gestiona tus citas profesionalmente' : 'Gestiona tus citas y perfil profesional con elegancia'}
              </p>
            </div>
          </div>

          {/* Tabbed Dashboard */}
          <div className={isMobile ? 'pb-24' : ''}>
            <DashboardTabs
              provider={provider}
              stats={stats}
              statsLoading={statsLoading}
              onRefreshProvider={refreshProvider}
              onCopyLink={copyLink}
              onViewProfile={viewProfile}
              activeTab={isMobile ? activeTab : undefined}
              onTabChange={isMobile ? setActiveTab : undefined}
            />
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
