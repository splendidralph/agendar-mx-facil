
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UsernameStep = () => {
  const { data, updateData, nextStep, prevStep, loading, generateUsername, checkUsernameAvailability } = useOnboarding();
  const [username, setUsername] = useState(data.username);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!data.username && data.businessName) {
      const generated = generateUsername(data.businessName);
      setUsername(generated);
      checkAvailability(generated);
    } else {
      setUsername(data.username);
      if (data.username) {
        checkAvailability(data.username);
      }
    }
  }, [data.businessName, data.username]);

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
    // Clean the username
    const cleanUsername = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30);
    
    setUsername(cleanUsername);
    setIsAvailable(null);

    // Clear existing timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Set new timeout for availability check
    if (cleanUsername.length >= 3) {
      const timeout = setTimeout(() => {
        checkAvailability(cleanUsername);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  const handleNext = async () => {
    if (!isAvailable) {
      toast.error('Por favor elige un username disponible');
      return;
    }

    console.log('UsernameStep: handleNext called with username:', username);
    
    // Update data first, then proceed
    updateData({ username });
    
    // Wait a bit for state to update, then proceed
    setTimeout(async () => {
      try {
        await nextStep();
        console.log('UsernameStep: nextStep completed successfully');
      } catch (error) {
        console.error('UsernameStep: Error in nextStep:', error);
      }
    }, 100);
  };

  const isValid = username.length >= 3 && isAvailable === true;

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
            value={username}
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
            Este será tu link personalizado: <span className="font-mono">bookeasy.mx/@{username || 'tu-username'}</span>
          </p>
          
          {username.length > 0 && username.length < 3 && (
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
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid || loading}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default UsernameStep;
