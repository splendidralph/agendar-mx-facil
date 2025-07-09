import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPinIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { CustomPhoneInput } from '@/components/ui/phone-input';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { sanitizeInput } from '@/utils/securityValidation';
import { useLocations } from '@/hooks/useLocations';
import { City, Zone, Location } from '@/types/location';
import { toast } from 'sonner';

interface ContactLocationStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
}

export const ContactLocationStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false 
}: ContactLocationStepProps) => {
  const { cities, getZonesByCity, getLocationsByZone, loading: locationsLoading } = useLocations();
  
  const [formData, setFormData] = useState({
    whatsappPhone: data.whatsappPhone || '',
    city_id: data.city_id || '',
    zone_id: data.zone_id || '',
    address: data.address || ''
  });
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  useEffect(() => {
    setFormData({
      whatsappPhone: data.whatsappPhone || '',
      city_id: data.city_id || '',
      zone_id: data.zone_id || '',
      address: data.address || ''
    });
  }, [data.whatsappPhone, data.city_id, data.zone_id, data.address]);

  // Load zones when city changes
  useEffect(() => {
    if (formData.city_id) {
      const loadZones = async () => {
        const zoneData = await getZonesByCity(formData.city_id);
        setZones(zoneData);
        
        // Reset zone if city changed
        if (formData.zone_id && !zoneData.find(z => z.id === formData.zone_id)) {
          handleChange('zone_id', '');
        }
      };
      loadZones();
    } else {
      setZones([]);
    }
  }, [formData.city_id]);

  const validatePhoneNumber = (phoneValue?: string) => {
    if (!phoneValue) {
      setPhoneValidation({ isValid: false, message: 'Número de teléfono requerido' });
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
    let sanitizedValue = value;
    
    // Sanitize text inputs
    if (field === 'address') {
      sanitizedValue = sanitizeInput(value, 255);
    }
    
    const newData = { ...formData, [field]: sanitizedValue };
    setFormData(newData);
    onUpdate(newData);
    
    if (field === 'whatsappPhone') {
      validatePhoneNumber(sanitizedValue);
    }
  };

  const handleNext = async () => {
    // Validate required fields
    if (!formData.whatsappPhone || !phoneValidation.isValid) {
      toast.error('Necesitas un número de teléfono válido');
      return;
    }
    
    if (!formData.city_id) {
      toast.error('Debes seleccionar una ciudad');
      return;
    }
    
    if (!formData.zone_id) {
      toast.error('Debes seleccionar una zona');
      return;
    }
    
    await onNext(formData);
  };

  const canProceed = Boolean(
    formData.whatsappPhone && 
    phoneValidation.isValid &&
    formData.city_id &&
    formData.zone_id
  );

  const selectedCity = cities.find(city => city.id === formData.city_id);
  const selectedZone = zones.find(zone => zone.id === formData.zone_id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-6 font-poppins">
          Contacto y ubicación
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

      {/* Location Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-white" />
            </div>
            Tu Ubicación
            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 text-xs">
              Requerido
            </Badge>
          </CardTitle>
          <CardDescription className="text-blue-700 text-sm">
            Esta información ayuda a los clientes a encontrarte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City Selection */}
          <div>
            <Label htmlFor="city" className="text-blue-800 font-medium text-sm">
              Ciudad *
            </Label>
            <Select
              value={formData.city_id}
              onValueChange={(value) => handleChange('city_id', value)}
              disabled={locationsLoading}
            >
              <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Selecciona tu ciudad" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone Selection */}
          {selectedCity && (
            <div>
              <Label htmlFor="zone" className="text-blue-800 font-medium text-sm">
                Zona *
              </Label>
              <Select
                value={formData.zone_id}
                onValueChange={(value) => handleChange('zone_id', value)}
                disabled={zones.length === 0}
              >
                <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecciona tu zona" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Optional Address */}
          <div>
            <Label htmlFor="address" className="text-blue-800 font-medium text-sm">
              Dirección específica (Opcional)
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Av. Principal 123, Local 5"
              className="mt-2 border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-blue-600 mt-1">
              Solo si quieres especificar una dirección exacta
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