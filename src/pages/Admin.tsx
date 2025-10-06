import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, MapPin, TrendingUp, Calendar, DollarSign, LogOut } from "lucide-react";
import { toast } from "sonner";
import AdminOverview from "@/components/admin/AdminOverview";
import ColoniaAnalytics from "@/components/admin/ColoniaAnalytics";
import ProviderAnalytics from "@/components/admin/ProviderAnalytics";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import { BannerManager } from "@/components/admin/BannerManager";

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !adminData) {
        toast.error("Acceso denegado - No tienes permisos de administrador");
        navigate('/');
        return;
      }

      setAdminUser(adminData);
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error("Error verificando acceso de administrador");
      navigate('/');
    } finally {
      setLoading(false);
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
          <p>Verificando acceso de administrador...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Admin Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-poppins">Admin Dashboard</span>
              <p className="text-sm text-muted-foreground">Bookeasy.mx Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {adminUser.role}
            </Badge>
            <span className="text-muted-foreground hidden sm:inline font-inter">
              {user?.email}
            </span>
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="border-border text-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground font-inter">
              Métricas clave y análisis de crecimiento para Bookeasy.mx
            </p>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="providers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Proveedores</span>
              </TabsTrigger>
              <TabsTrigger value="colonias" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Colonias</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresos</span>
              </TabsTrigger>
              <TabsTrigger value="banner" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Banner</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="providers" className="space-y-6">
              <ProviderAnalytics />
            </TabsContent>

            <TabsContent value="colonias" className="space-y-6">
              <ColoniaAnalytics />
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueAnalytics />
            </TabsContent>

            <TabsContent value="banner" className="space-y-6">
              <BannerManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;