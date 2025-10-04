import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, BarChart3, Calendar, Settings, ClipboardList, Share2 } from "lucide-react";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import ServicesManager from "@/components/dashboard/ServicesManager";
import NotificationSettings from "@/components/dashboard/NotificationSettings";
import AvailabilityManager from "@/components/availability/AvailabilityManager";
import MobileStats from "@/components/dashboard/MobileStats";
import MobileBookingsTable from "@/components/dashboard/MobileBookingsTable";
import MobileProfileCard from "@/components/dashboard/MobileProfileCard";
import PromotionManager from "@/components/dashboard/PromotionManager";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardTabsProps {
  provider: any;
  stats: any;
  statsLoading: boolean;
  onRefreshProvider: () => void;
  onCopyLink: () => void;
  onViewProfile: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardTabs = ({ 
  provider, 
  stats, 
  statsLoading, 
  onRefreshProvider, 
  onCopyLink, 
  onViewProfile,
  activeTab: externalActiveTab,
  onTabChange 
}: DashboardTabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <MobileStats stats={stats} loading={statsLoading} isMobile={isMobile} />
            
            {/* Mobile Profile Card */}
            {isMobile && (
              <MobileProfileCard
                provider={provider}
                onRefreshProvider={onRefreshProvider}
                onCopyLink={onCopyLink}
                onViewProfile={onViewProfile}
                onSettingsClick={() => setActiveTab("settings")}
              />
            )}
            
            {/* Desktop Booking Link Card */}
            {!isMobile && (
              <Card className="glassmorphism hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Tu Link de Reservas
                  </CardTitle>
                  <CardDescription>
                    Comparte este link con tus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-mono text-foreground break-all">
                      {provider.username ? `bookeasy.mx/${provider.username}` : 'Configura tu username primero'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={onCopyLink}
                      className="flex-1 gradient-primary text-primary-foreground hover:opacity-90 shadow-lg"
                      disabled={!provider.username}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-white/20 text-foreground hover:bg-white/10 hover:border-white/30"
                      onClick={onViewProfile}
                      disabled={!provider.username}
                    >
                      Ver Mi Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case "appointments":
        return <MobileBookingsTable providerId={provider.id} isMobile={isMobile} />;
      
      case "services":
        return <ServicesManager providerId={provider.id} />;
      
      case "availability":
        return <AvailabilityManager providerId={provider.id} />;
      
      
      case "settings":
        return (
          <div className="space-y-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
              <ProfileSettings provider={provider} onUpdate={onRefreshProvider} />
              <NotificationSettings provider={provider} onUpdate={onRefreshProvider} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Tabs */}
      {!isMobile ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 glassmorphism mb-8 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Citas
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="appointments">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="services">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="availability">
            {renderTabContent()}
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      ) : (
        // Mobile: Direct content based on activeTab
        <div className="w-full">
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default DashboardTabs;