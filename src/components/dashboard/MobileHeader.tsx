import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X, Link, Share2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
interface MobileHeaderProps {
  businessName: string;
  onSignOut: () => void;
  onCopyLink: () => void;
  onViewProfile: () => void;
  username?: string;
  isMobile: boolean;
}

const MobileHeader = ({ businessName, onSignOut, onCopyLink, onViewProfile, username, isMobile }: MobileHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) {
    return (
      <header className="glassmorphism border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary text-primary-foreground p-2.5 rounded-xl shadow-lg animate-glow">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-foreground font-poppins">Bookeasy.mx</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground hidden sm:inline font-inter">
              ¡Hola, {businessName}!
            </span>
            <Button 
              variant="outline"
              onClick={onSignOut}
              className="border-white/20 text-foreground hover:bg-white/10 hover:border-white/30 smooth-transition"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="glassmorphism border-b border-white/10 sticky top-0 z-50 touch-manipulation">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="gradient-primary text-primary-foreground p-2 rounded-lg animate-glow">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground font-poppins">Bookeasy</span>
              <p className="text-xs text-muted-foreground truncate max-w-32">
                {businessName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {username && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyLink}
                className="p-2 touch-manipulation"
              >
                <Link className="h-5 w-5" />
              </Button>
            )}
            
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
          </div>
        </div>
      </header>

      {/* Mobile FAB for Quick Link Access */}
      {username && (
        <div className="fixed bottom-6 right-4 z-40 md:hidden">
          <Button
            onClick={onCopyLink}
            className="h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-2xl touch-manipulation floating-cta animate-glow hover:scale-110 smooth-transition"
          >
            <Link className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
};

export default MobileHeader;