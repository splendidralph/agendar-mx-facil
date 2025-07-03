import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  onPrevious?: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  canProceed?: boolean;
  loading?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const StepNavigation = ({
  onPrevious,
  onNext,
  canGoBack = true,
  canProceed = true,
  loading = false,
  nextLabel = 'Continuar',
  previousLabel = 'Anterior'
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-border/20">
      {canGoBack && onPrevious ? (
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {previousLabel}
        </Button>
      ) : (
        <div /> // Empty div to maintain spacing
      )}
      
      <Button
        onClick={onNext}
        disabled={!canProceed || loading}
        variant="accent"
        size="lg"
        className="min-w-[140px] font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};