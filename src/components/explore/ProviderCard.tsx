
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Provider {
  id: string;
  name: string;
  category: string;
  city: string;
  startingPrice: number;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
  verified: boolean;
}

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/booking/demo');
  };

  return (
    <Card className="card-hover bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="relative">
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-48 object-cover"
        />
        {provider.verified && (
          <Badge className="absolute top-3 left-3 bg-trust-teal text-white">
            Verificado
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {provider.name}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3 w-3" />
              <span>{provider.category}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{provider.rating}</span>
              <span className="text-xs text-muted-foreground">({provider.reviewCount})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{provider.city}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {provider.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs text-muted-foreground">Desde</span>
            <div className="font-semibold text-foreground">
              ${provider.startingPrice} MXN
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
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
