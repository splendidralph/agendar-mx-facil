import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

const ReviewForm = ({ 
  bookingId, 
  providerId, 
  providerName, 
  serviceName, 
  onReviewSubmitted, 
  onCancel 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          provider_id: providerId,
          client_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast.error('Error al enviar la reseña');
        return;
      }

      toast.success('¡Reseña enviada exitosamente!');
      onReviewSubmitted();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`h-8 w-8 ${
              starValue <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Deja una reseña</CardTitle>
        <p className="text-sm text-muted-foreground">
          Califica tu experiencia con {providerName} - {serviceName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Calificación *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Haz clic en las estrellas para calificar
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Comentario (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia..."
              className="border-border focus:border-primary"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1"
            >
              {submitting ? 'Enviando...' : 'Enviar Reseña'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;