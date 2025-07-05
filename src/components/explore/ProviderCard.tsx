import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Database } from '@/integrations/supabase/types';

type Provider = Database['public']['Tables']['providers']['Row'] & {
  services: Database['public']['Tables']['services']['Row'][];
  isLocal?: boolean;
  distance?: number;
};

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/${provider.username}`);
  };

  const startingPrice = provider.services.length > 0 
    ? Math.min(...provider.services.map(s => s.price))
    : 0;

  const getLocationDisplay = () => {
    if (provider.colonia) {
      return provider.colonia;
    }
    return provider.address || 'Ciudad de México';
  };

  return (
    <Card className="card-hover bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Avatar className="w-20 h-20 border-4 border-white/20 shadow-lg">
            <AvatarImage src={provider.profile_image_url || undefined} />
            <AvatarFallback className="bg-card text-primary text-3xl font-bold">
              {provider.business_name?.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {provider.isLocal && (
            <Badge className="bg-trust-teal text-white shadow-lg">
              En tu colonia
            </Badge>
          )}
          {provider.profile_completed && (
            <Badge className="bg-secondary text-secondary-foreground">
              Verificado
            </Badge>
          )}
        </div>

        {provider.distance !== undefined && provider.distance > 0 && (
          <Badge className="absolute top-3 right-3 bg-card/90 text-foreground border border-border">
            {provider.distance < 1 ? '< 1 km' : `${provider.distance.toFixed(1)} km`}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {provider.business_name}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3 w-3" />
              <span>{provider.category}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{provider.rating || 5.0}</span>
              <span className="text-xs text-muted-foreground">({provider.total_reviews || 'Nuevo'})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{getLocationDisplay()}</span>
        </div>

        {provider.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {provider.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs text-muted-foreground">Desde</span>
            <div className="font-semibold text-foreground">
              ${startingPrice} MXN
            </div>
          </div>
          
          <Button
            onClick={handleViewProfile}
            size="sm"
            className="btn-primary"
          >
            Ver perfil
          </Button>
        </div>

        {provider.services.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{provider.services.length} servicio{provider.services.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderCard;