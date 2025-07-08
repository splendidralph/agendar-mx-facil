import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPinIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { CustomPhoneInput } from '@/components/ui/phone-input';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { validateInstagramHandle, sanitizeInput } from '@/utils/securityValidation';
import { toast } from 'sonner';

interface SimplifiedContactStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
}

export const SimplifiedContactStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false 
}: SimplifiedContactStepProps) => {
  const [formData, setFormData] = useState({
    address: data.address || '',
    instagramHandle: data.instagramHandle || '',
    whatsappPhone: data.whatsappPhone || '',
    colonia: data.colonia || ''
  });
  
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  useEffect(() => {
    setFormData({
      address: data.address || '',
      instagramHandle: data.instagramHandle || '',
      whatsappPhone: data.whatsappPhone || '',
      colonia: data.colonia || ''
    });
  }, [data.address, data.instagramHandle, data.whatsappPhone, data.colonia]);

  const validatePhoneNumber = (phoneValue?: string) => {
    if (!phoneValue) {
      setPhoneValidation({ isValid: true, message: '' });
      return;
    }

    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (e164Regex.test(phoneValue) && phoneValue.length >= 12) {
      setPhoneValidation({ isValid: true, message: '¡Perfecto! Número válido' });
    } else if (phoneValue.length < 12) {
      setPhoneValidation({ 
        isValid: false, 
        message: 'Número incompleto' 
      });
    } else {
      setPhoneValidation({ 
        isValid: false, 
        message: 'Formato de número inválido' 
      });
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    // Sanitize input to prevent XSS
    let sanitizedValue = sanitizeInput(value, 255);
    
    const newData = { ...formData, [field]: sanitizedValue };
    setFormData(newData);
    onUpdate(newData);
    
    if (field === 'whatsappPhone') {
      validatePhoneNumber(sanitizedValue);
    }
  };

  const handleNext = async () => {
    // Final validation before proceeding
    if (formData.instagramHandle && !validateInstagramHandle(formData.instagramHandle)) {
      toast.error('El formato del Instagram no es válido');
      return;
    }
    
    if (!formData.whatsappPhone || !phoneValidation.isValid) {
      toast.error('Necesitas un número de teléfono válido');
      return;
    }
    
    await onNext(formData);
  };

  const canProceed = formData.whatsappPhone && phoneValidation.isValid;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-6 font-poppins">
          Información de contacto
        </h3>
      </div>

      {/* Phone Number Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800 text-base">
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            Tu Número de Teléfono
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 text-xs">
              Requerido
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-700 text-sm">
            Recibe notificaciones de nuevas citas por WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="whatsapp" className="text-green-800 font-medium text-sm">
              Número de Teléfono *
            </Label>
            <div className="relative mt-2">
              <CustomPhoneInput
                value={formData.whatsappPhone}
                onChange={(value) => handleChange('whatsappPhone', value || '')}
                placeholder="Número de teléfono"
                defaultCountry="MX"
                required={true}
                className={`border-green-200 focus:border-green-400 focus:ring-green-400 ${
                  formData.whatsappPhone && !phoneValidation.isValid ? 'border-red-300' : ''
                } ${
                  formData.whatsappPhone && phoneValidation.isValid ? 'border-green-300' : ''
                }`}
                error={formData.whatsappPhone ? !phoneValidation.isValid : false}
              />
              {formData.whatsappPhone && (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  phoneValidation.isValid ? 'text-green-600' : 'text-red-500'
                }`}>
                  {phoneValidation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
            {formData.whatsappPhone && phoneValidation.message && (
              <p className={`text-sm mt-1 ${
                phoneValidation.isValid ? 'text-green-600' : 'text-red-500'
              }`}>
                {phoneValidation.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simple Location Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            Tu Ubicación
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
              Opcional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="colonia" className="text-blue-800 font-medium text-sm">
              Colonia donde trabajas
            </Label>
            <Input
              id="colonia"
              value={formData.colonia}
              onChange={(e) => handleChange('colonia', e.target.value)}
              placeholder="Ej: Centro, Roma Norte, Condesa..."
              className="mt-2 border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-blue-600 mt-1">
              Ayuda a los clientes cercanos a encontrarte
            </p>
          </div>
          
          <div>
            <Label htmlFor="address" className="text-blue-800 font-medium text-sm">
              Dirección completa (Opcional)
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Av. Principal 123"
              className="mt-2 border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Optional Instagram */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
            <div className="p-2 bg-purple-500 rounded-lg text-white text-xs font-bold">
              IG
            </div>
            Instagram (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="instagram" className="text-purple-800 font-medium text-sm">
              Tu Instagram
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-purple-600">
                @
              </span>
              <Input
                id="instagram"
                value={formData.instagramHandle}
                onChange={(e) => handleChange('instagramHandle', e.target.value)}
                placeholder="tu_usuario"
                className="pl-8 border-purple-200 focus:border-purple-400"
              />
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Conecta con tus clientes en redes sociales
            </p>
          </div>
        </CardContent>
      </Card>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={canProceed}
        loading={loading}
        nextLabel="Completar perfil"
      />
    </div>
  );
};