import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    users?: {
      full_name: string;
    };
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(review.users?.full_name || 'Usuario')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground">
                {review.users?.full_name || 'Usuario verificado'}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "d 'de' MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              {renderStars(review.rating)}
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;