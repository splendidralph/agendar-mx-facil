import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, MapPin, Instagram, CheckCircle, AlertCircle, Smartphone, MapPinIcon } from 'lucide-react';
import PhoneInput from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';
import { validateInstagramHandle, validatePostalCode, sanitizeInput } from '@/utils/securityValidation';
import { toast } from 'sonner';

interface ContactStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
}

export const ContactStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false 
}: ContactStepProps) => {
  const [formData, setFormData] = useState({
    address: data.address || '',
    instagramHandle: data.instagramHandle || '',
    whatsappPhone: data.whatsappPhone || '',
    delegacion: data.delegacion || '',
    delegacionId: data.delegacionId || '',
    colonia: data.colonia || '',
    postalCode: data.postalCode || '',
    groupLabel: data.groupLabel || ''
  });
  
  const [delegaciones, setDelegaciones] = useState<Array<{id: string, name: string}>>([]);
  const [coloniaGroups, setColoniaGroups] = useState<Array<{id: string, name: string, colonia: string, postal_code: string, group_label: string, professional_count: number}>>([]);
  const [loadingDelegaciones, setLoadingDelegaciones] = useState(false);
  const [loadingColonias, setLoadingColonias] = useState(false);
  
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  useEffect(() => {
    setFormData({
      address: data.address || '',
      instagramHandle: data.instagramHandle || '',
      whatsappPhone: data.whatsappPhone || '',
      delegacion: data.delegacion || '',
      delegacionId: data.delegacionId || '',
      colonia: data.colonia || '',
      postalCode: data.postalCode || '',
      groupLabel: data.groupLabel || ''
    });
  }, [data.address, data.instagramHandle, data.whatsappPhone, data.delegacion, data.delegacionId, data.colonia, data.postalCode, data.groupLabel]);

  // Load delegaciones on mount
  useEffect(() => {
    const loadDelegaciones = async () => {
      setLoadingDelegaciones(true);
      try {
        const { data: delegacionData, error } = await supabase
          .from('delegaciones')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setDelegaciones(delegacionData || []);
      } catch (error) {
        console.error('Error loading delegaciones:', error);
      } finally {
        setLoadingDelegaciones(false);
      }
    };
    
    loadDelegaciones();
  }, []);

  // Load colonias when delegación is selected
  useEffect(() => {
    if (!formData.delegacionId) {
      setColoniaGroups([]);
      return;
    }

    const loadColonias = async () => {
      setLoadingColonias(true);
      try {
        const { data: coloniaData, error } = await supabase
          .from('locations')
          .select('id, name, colonia, postal_code, group_label, professional_count')
          .eq('delegacion_id', formData.delegacionId)
          .not('colonia', 'is', null)
          .order('group_label, colonia');
        
        if (error) throw error;
        setColoniaGroups(coloniaData || []);
      } catch (error) {
        console.error('Error loading colonias:', error);
      } finally {
        setLoadingColonias(false);
      }
    };
    
    loadColonias();
  }, [formData.delegacionId]);

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
    console.log('handleChange called:', { field, value });
    
    // Sanitize input to prevent XSS
    let sanitizedValue = sanitizeInput(value, 255);
    
    // Additional validation based on field type
    if (field === 'postalCode' && sanitizedValue && !validatePostalCode(sanitizedValue)) {
      toast.error('El código postal debe tener 5 dígitos');
      return;
    }
    
    const newData = { ...formData, [field]: sanitizedValue };
    console.log('Setting form data:', newData);
    setFormData(newData);
    onUpdate(newData);
    
    if (field === 'whatsappPhone') {
      validatePhoneNumber(sanitizedValue);
    }
  };

  const handleInstagramChange = (value: string) => {
    const cleanValue = value.replace('@', '');
    
    // Validate Instagram handle format
    if (cleanValue && !validateInstagramHandle(cleanValue)) {
      toast.error('El Instagram solo puede contener letras, números, puntos y guiones bajos');
      return;
    }
    
    handleChange('instagramHandle', cleanValue);
  };

  const handleNext = async () => {
    // Final validation before proceeding
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      toast.error('El código postal debe tener 5 dígitos');
      return;
    }
    
    if (formData.instagramHandle && !validateInstagramHandle(formData.instagramHandle)) {
      toast.error('El formato del Instagram no es válido');
      return;
    }
    
    await onNext(formData);
  };

  const canProceed = !formData.whatsappPhone || phoneValidation.isValid;

  return (
    <div className="space-y-6">
      {/* Location Selection Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            Tu Ubicación y Área de Servicio
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
              Importante
            </Badge>
          </CardTitle>
          <CardDescription className="text-blue-700 text-sm">
            Esto nos ayuda a conectarte con clientes cercanos para un servicio más rápido y confiable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="delegacion" className="text-blue-800 font-medium text-sm">
              Selecciona tu Delegación
            </Label>
            <Select 
              value={formData.delegacion} 
              onValueChange={(value) => {
                const selectedDelegacion = delegaciones.find(d => d.name === value);
                handleChange('delegacion', value);
                if (selectedDelegacion) {
                  handleChange('delegacionId', selectedDelegacion.id);
                }
                // Clear colonia selection when delegacion changes
                handleChange('colonia', '');
                handleChange('postalCode', '');
                handleChange('groupLabel', '');
              }}
              disabled={loadingDelegaciones}
            >
              <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder={loadingDelegaciones ? "Cargando delegaciones..." : "Elige tu delegación"} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-border shadow-lg">
                {delegaciones.map((delegacion) => (
                  <SelectItem key={delegacion.id} value={delegacion.name}>
                    {delegacion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.delegacionId && (
            <div>
              <Label htmlFor="colonia" className="text-blue-800 font-medium text-sm">
                Selecciona tu Área/Colonia
              </Label>
              <Select 
                value={formData.colonia} 
                onValueChange={(value) => {
                  const selectedColonia = coloniaGroups.find(c => c.colonia === value);
                  handleChange('colonia', value);
                  if (selectedColonia) {
                    handleChange('postalCode', selectedColonia.postal_code);
                    handleChange('groupLabel', selectedColonia.group_label);
                  }
                }}
                disabled={loadingColonias}
              >
                <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={loadingColonias ? "Cargando áreas..." : "Busca tu colonia/área"} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-border shadow-lg">
                  {coloniaGroups.map((colonia) => (
                    <SelectItem key={colonia.id} value={colonia.colonia}>
                      <div className="flex justify-between items-center w-full">
                        <span>{colonia.colonia}</span>
                        {colonia.professional_count > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {colonia.professional_count} pros
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {colonia.group_label} • {colonia.postal_code}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="postalCode" className="text-blue-800 font-medium text-sm">
              Código Postal
            </Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="Ej: 22150"
              className="mt-2 border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Benefits Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800 text-base">
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            WhatsApp para tu Negocio
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
              Recomendado
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-700 text-sm">
            Recibe notificaciones instantáneas de nuevas citas directamente en tu WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Notificaciones instantáneas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Mayor tasa de respuesta</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Comunicación directa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Gestión desde tu celular</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="whatsapp" className="text-green-800 font-medium text-sm">
              Número de WhatsApp
            </Label>
            <div className="relative mt-2">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4 z-10" />
              <PhoneInput
                country="MX"
                value={formData.whatsappPhone}
                onChange={(value) => handleChange('whatsappPhone', value || '')}
                className={`pl-10 w-full h-10 px-3 py-2 border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-green-200 focus:border-green-400 focus:ring-green-400 ${
                  formData.whatsappPhone && !phoneValidation.isValid ? 'border-red-300' : ''
                } ${
                  formData.whatsappPhone && phoneValidation.isValid ? 'border-green-300' : ''
                }`}
                placeholder="Número de WhatsApp"
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

      {/* Optional Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-sm text-muted-foreground px-3">Información Adicional (Opcional)</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Dirección del Negocio
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Ej: Av. Principal 123, Colonia Centro"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium">
            <Instagram className="h-4 w-4 text-muted-foreground" />
            Instagram
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="instagram"
              value={formData.instagramHandle}
              onChange={(e) => handleInstagramChange(e.target.value)}
              placeholder="tu_instagram"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={canProceed}
        loading={loading}
      />
    </div>
  );
};