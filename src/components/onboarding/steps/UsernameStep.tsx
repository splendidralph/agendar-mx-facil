import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateUsername, checkUsernameAvailability } from '@/utils/usernameUtils';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';

interface UsernameStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const UsernameStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false,
  validationErrors 
}: UsernameStepProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Generate username on mount if needed
  useEffect(() => {
    if (!data.username && data.businessName) {
      const generated = generateUsername(data.businessName);
      onUpdate({ username: generated });
      checkAvailability(generated);
    } else if (data.username) {
      checkAvailability(data.username);
    }
  }, []);

  const checkAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const available = await checkUsernameAvailability(usernameToCheck);
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanUsername = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30);
    
    onUpdate({ username: cleanUsername });
    setIsAvailable(null);

    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    if (cleanUsername.length >= 3) {
      const timeout = setTimeout(() => {
        checkAvailability(cleanUsername);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  const handleNext = async () => {
    if (isAvailable !== true) {
      if (isAvailable === false) {
        toast.error('El username no está disponible');
      } else {
        toast.error('Verifica que el username esté disponible');
      }
      return;
    }
    
    await onNext();
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const isValid = data.username && data.username.length >= 3;
  const canProceed = Boolean(isValid && isAvailable === true && !isChecking);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="username" className="text-base font-medium">
          Tu Username Único *
        </Label>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            bookeasy.mx/@
          </span>
          <Input
            id="username"
            value={data.username || ''}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="tu-username"
            className={`pl-32 ${getFieldError('username') ? 'border-red-500' : ''}`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
            {!isChecking && isAvailable === false && <X className="h-4 w-4 text-red-500" />}
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            Este será tu link personalizado: <span className="font-mono">bookeasy.mx/@{data.username || 'tu-username'}</span>
          </p>
          
          {getFieldError('username') && (
            <p className="text-sm text-red-500">{getFieldError('username')}</p>
          )}
          
          {data.username && data.username.length > 0 && data.username.length < 3 && (
            <p className="text-sm text-red-500">El username debe tener al menos 3 caracteres</p>
          )}
          
          {isAvailable === false && (
            <p className="text-sm text-red-500">Este username no está disponible</p>
          )}
          
          {isAvailable === true && (
            <p className="text-sm text-green-500">¡Username disponible!</p>
          )}
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border/50">
          <p className="text-sm font-medium text-foreground mb-1">Tips para tu username:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Solo letras minúsculas, números y guiones</li>
            <li>• Mínimo 3 caracteres, máximo 30</li>
            <li>• Fácil de recordar y compartir</li>
          </ul>
        </div>
      </div>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={canProceed}
        loading={loading || isChecking}
      />
    </div>
  );
};