import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Provider {
  business_name: string | null;
  profile_image_url: string | null;
  category: string | null;
  avg_rating: number;
  review_count: number;
  colonia: string | null;
  username: string;
}

interface BookingProfileHeaderProps {
  provider: Provider;
  themeColor?: string;
  onBackClick: () => void;
}

export const BookingProfileHeader = ({ 
  provider, 
  themeColor = '#3B82F6',
  onBackClick 
}: BookingProfileHeaderProps) => {
  const displayName = provider.business_name || provider.username;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center gap-3 p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary">
          <AvatarImage src={provider.profile_image_url || ''} alt={displayName} />
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          {provider.category && (
            <p className="text-xs text-muted-foreground truncate">{provider.category}</p>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4 p-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-14 w-14 shrink-0 ring-2 ring-primary">
          <AvatarImage src={provider.profile_image_url || ''} alt={displayName} />
          <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{displayName}</h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {provider.category && (
              <Badge variant="secondary" className="text-xs">
                {provider.category}
              </Badge>
            )}
            
            {provider.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{provider.avg_rating.toFixed(1)}</span>
                <span>({provider.review_count})</span>
              </div>
            )}

            {provider.colonia && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{provider.colonia}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
