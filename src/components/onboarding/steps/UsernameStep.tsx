import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { StepNavigation } from '../StepNavigation';
import { generateUniqueUsername, checkUsernameAvailability } from '@/utils/usernameUtils';
import { OnboardingData } from '@/types/onboarding';
import { useAuth } from '@/hooks/useAuth';

interface UsernameStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const UsernameStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  loading = false,
  validationErrors 
}: UsernameStepProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: data.bio || '',
    username: data.username || ''
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      bio: data.bio || '',
      username: data.username || ''
    });
  }, [data.bio, data.username]);

  // Check username availability
  useEffect(() => {
    if (formData.username && formData.username.length >= 3) {
      checkAvailability(formData.username);
    } else {
      setIsAvailable(null);
    }
  }, [formData.username]);

  const checkAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const available = await checkUsernameAvailability(usernameToCheck, user?.id);
      setIsAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleUsernameChange = (value: string) => {
    const cleanUsername = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30);
    
    const newData = { ...formData, username: cleanUsername };
    setFormData(newData);
    onUpdate(newData);
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
    // Validate required fields
    if (!formData.username || formData.username.length < 3) {
      toast.error('El username debe tener al menos 3 caracteres');
      return;
    }
    if (isAvailable !== true) {
      if (isAvailable === false) {
        toast.error('El username no está disponible');
      } else {
        toast.error('Verifica que el username esté disponible');
      }
      return;
    }

    await onNext(formData);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const isValid = Boolean(
    formData.username && 
    formData.username.length >= 3 && 
    isAvailable === true
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-6 font-poppins">
          Crea tu perfil único
        </h3>
        
        {/* Username */}
        <div className="mb-6">
          <Label htmlFor="username" className="text-base font-medium">
            Tu Username Único *
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold z-10" style={{ color: '#000000' }}>
              bookeasy.mx/
            </span>
            <Input
              ref={usernameInputRef}
              id="username"
              value={formData.username}
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
              Tu link personalizado será: <span className="font-mono">bookeasy.mx/{formData.username || 'tu-username'}</span>
            </p>
            
            {getFieldError('username') && (
              <p className="text-sm text-red-500">{getFieldError('username')}</p>
            )}
            
            {formData.username && formData.username.length > 0 && formData.username.length < 3 && (
              <p className="text-sm text-red-500">El username debe tener al menos 3 caracteres</p>
            )}
            
            {isAvailable === false && (
              <p className="text-sm text-red-500">Este username no está disponible</p>
            )}
            
            {isAvailable === true && (
              <p className="text-sm text-green-500">¡Username disponible!</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="text-base font-medium">
            Cuéntanos sobre ti (Opcional)
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Ej: Barbero con 5 años de experiencia, especialista en cortes modernos..."
            className="mt-2"
            rows={3}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Ayuda a los clientes a conocerte mejor
          </p>
        </div>
      </div>

      <StepNavigation
        onNext={handleNext}
        canGoBack={false}
        canProceed={isValid && !isChecking}
        loading={loading || isChecking}
      />
    </div>
  );
};