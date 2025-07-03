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
    <div className="flex justify-between items-center pt-4 border-t border-border/50">
      {canGoBack && onPrevious ? (
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-border text-foreground"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {previousLabel}
        </Button>
      ) : (
        <div /> // Empty div to maintain spacing
      )}
      
      <Button
        onClick={onNext}
        disabled={!canProceed || loading}
        className="btn-primary min-w-[120px]"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};