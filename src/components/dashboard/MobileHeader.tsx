import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import MobileNavigation from "./MobileNavigation";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { LogoIcon } from "@/components/branding/LogoIcon";
import { LogoText } from "@/components/branding/LogoText";

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
            <LogoIcon className="h-8 w-8" />
            <LogoText className="text-2xl" />
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
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <LogoIcon className="h-7 w-7" />
            <div className="min-w-0 flex-1">
              <LogoText className="text-base" />
              <p className="text-sm text-muted-foreground truncate">
                {businessName}
              </p>
            </div>
          </div>
          
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
      </header>
    </>
  );
};

export default MobileHeader;