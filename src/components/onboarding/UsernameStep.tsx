
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateStep } from '@/utils/onboardingValidation';
import { generateUsername, checkUsernameAvailability } from '@/utils/usernameUtils';

const UsernameStep = () => {
  const { data, updateData, nextStep, prevStep, loading, currentStep } = useOnboarding();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize username once on mount if needed
  useEffect(() => {
    if (!data.username && data.businessName) {
      const generated = generateUsername(data.businessName);
      console.log('UsernameStep: Generating initial username:', generated);
      updateData({ username: generated });
      checkAvailability(generated);
    } else if (data.username) {
      console.log('UsernameStep: Checking existing username:', data.username);
      checkAvailability(data.username);
    }
  }, []); // Run only once on mount

  const checkAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    console.log('UsernameStep: Checking availability for:', usernameToCheck);
    setIsChecking(true);
    try {
      const available = await checkUsernameAvailability(usernameToCheck);
      console.log('UsernameStep: Availability result:', available);
      setIsAvailable(available);
    } catch (error) {
      console.error('UsernameStep: Error checking username:', error);
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
    
    console.log('UsernameStep: Username changed to:', cleanUsername);
    updateData({ username: cleanUsername });
    
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
    console.log('UsernameStep: Clicking Continuar', { 
      username: data.username, 
      isAvailable,
      currentStep 
    });
    
    // Validate step requirements
    if (!validateStep(currentStep, data)) {
      console.warn('UsernameStep: Step validation failed');
      return;
    }
    
    if (isAvailable !== true) {
      console.warn('UsernameStep: Username not available');
      if (isAvailable === false) {
        toast.error('El username no está disponible');
      } else {
        toast.error('Verifica que el username esté disponible');
      }
      return;
    }
    
    try {
      await nextStep();
      console.log('UsernameStep: Successfully advanced to next step');
    } catch (error) {
      console.error('UsernameStep: Error in nextStep:', error);
      toast.error('Error avanzando al siguiente paso');
    }
  };

  // Simple validation for button state
  const isValid = data.username && data.username.length >= 3;
  const canProceed = isValid && isAvailable === true && !loading && !isChecking;

  console.log('UsernameStep: Render state:', {
    username: data.username,
    isAvailable,
    isValid,
    canProceed,
    loading,
    isChecking
  });

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="username">Tu Username Único *</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            bookeasy.mx/@
          </span>
          <Input
            id="username"
            value={data.username || ''}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="tu-username"
            className="pl-32"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
            {!isChecking && isAvailable === false && <X className="h-4 w-4 text-red-500" />}
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            Este será tu link personalizado: <span className="font-mono">bookeasy.mx/{data.username || 'tu-username'}</span>
          </p>
          
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

      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          variant="outline"
          className="border-border text-foreground"
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-primary"
          type="button"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default UsernameStep;
