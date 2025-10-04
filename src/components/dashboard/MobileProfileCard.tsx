import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Link, Eye, Settings } from "lucide-react";
import ProfilePictureUpload from "./ProfilePictureUpload";

interface MobileProfileCardProps {
  provider: any;
  onRefreshProvider: () => void;
  onCopyLink: () => void;
  onViewProfile: () => void;
  onSettingsClick: () => void;
}

const MobileProfileCard = ({ 
  provider, 
  onRefreshProvider, 
  onCopyLink, 
  onViewProfile,
  onSettingsClick 
}: MobileProfileCardProps) => {
  return (
    <Card className="solid-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mi Perfil
        </CardTitle>
        <CardDescription>
          Información de tu negocio
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Profile Picture & Basic Info */}
        <div className="flex items-center gap-4">
          <ProfilePictureUpload
            providerId={provider.id}
            currentImageUrl={provider.profile_image_url}
            businessName={provider.business_name}
            onImageUpdate={onRefreshProvider}
            size="lg"
            showUploadButton
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {provider.business_name || "Sin nombre"}
            </h3>
            {provider.category && (
              <div className="mt-1 max-w-full overflow-hidden">
                <Badge variant="secondary" className="truncate max-w-full">
                  {provider.category}
                </Badge>
              </div>
            )}
            {provider.username && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                @{provider.username}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {provider.bio}
            </p>
          </div>
        )}

        {/* Location */}
        {provider.colonia && (
          <div className="text-sm">
            <span className="text-muted-foreground">Ubicación: </span>
            <span className="font-medium">{provider.colonia}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyLink}
            disabled={!provider.username}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Link className="h-4 w-4" />
            <span className="text-xs">Copiar Link</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            disabled={!provider.username}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Eye className="h-4 w-4" />
            <span className="text-xs">Ver Perfil</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">Editar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileProfileCard;