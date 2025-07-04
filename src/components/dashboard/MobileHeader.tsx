import { Button } from "@/components/ui/button";
import { Calendar, Link } from "lucide-react";
import MobileNavigation from "./MobileNavigation";
import ProfilePictureUpload from "./ProfilePictureUpload";

interface MobileHeaderProps {
  businessName: string;
  onSignOut: () => void;
  onCopyLink: () => void;
  onViewProfile: () => void;
  username?: string;
  isMobile: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  provider?: any;
  onRefreshProvider?: () => void;
}

const MobileHeader = ({ businessName, onSignOut, onCopyLink, onViewProfile, username, isMobile, activeTab = "overview", onTabChange, provider, onRefreshProvider }: MobileHeaderProps) => {

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
          <div className="flex items-center space-x-3">
            {provider && (
              <ProfilePictureUpload
                providerId={provider.id}
                currentImageUrl={provider.profile_image_url}
                businessName={businessName}
                onImageUpdate={onRefreshProvider || (() => {})}
                size="sm"
              />
            )}
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
             
             {onTabChange && (
               <MobileNavigation
                 activeTab={activeTab || "overview"}
                 onTabChange={onTabChange}
                 businessName={businessName}
                 onSignOut={onSignOut}
                 onCopyLink={onCopyLink}
                 onViewProfile={onViewProfile}
                 username={username}
               />
             )}
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