import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, Calendar, ClipboardList, Settings, Menu, X, Link, Share2 } from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  businessName: string;
  onSignOut: () => void;
  onCopyLink: () => void;
  onViewProfile: () => void;
  username?: string;
}

const MobileNavigation = ({ 
  activeTab, 
  onTabChange, 
  businessName, 
  onSignOut, 
  onCopyLink, 
  onViewProfile, 
  username 
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "appointments", label: "Citas", icon: Calendar },
    { id: "services", label: "Servicios", icon: ClipboardList },
    { id: "availability", label: "Horarios", icon: Calendar },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 touch-manipulation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Hola, {businessName}
            </p>
          </div>
          
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">NAVEGACIÓN</h3>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start touch-manipulation h-12"
                      onClick={() => handleTabChange(item.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {username && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">ACCIONES RÁPIDAS</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start touch-manipulation h-12"
                    onClick={() => {
                      onCopyLink();
                      setIsOpen(false);
                    }}
                  >
                    <Link className="h-4 w-4 mr-3" />
                    Copiar Link
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start touch-manipulation h-12"
                    onClick={() => {
                      onViewProfile();
                      setIsOpen(false);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-3" />
                    Ver Mi Perfil
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border">
            <Button 
              variant="destructive"
              className="w-full touch-manipulation h-12"
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;