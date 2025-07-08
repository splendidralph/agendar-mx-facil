import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, MapPinIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { CustomPhoneInput } from '@/components/ui/phone-input';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { validateInstagramHandle, validatePostalCode, sanitizeInput } from '@/utils/securityValidation';
import { toast } from 'sonner';
import { useLocations } from '@/hooks/useLocations';
import { City, Zone, Location } from '@/types/location';

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
  const { cities, loading: citiesLoading, getCityById, getZonesByCity, getLocationsByZone } = useLocations();
  
  const [formData, setFormData] = useState({
    address: data.address || '',
    instagramHandle: data.instagramHandle || '',
    whatsappPhone: data.whatsappPhone || '',
    postalCode: data.postalCode || ''
  });
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  useEffect(() => {
    setFormData({
      address: data.address || '',
      instagramHandle: data.instagramHandle || '',
      whatsappPhone: data.whatsappPhone || '',
      postalCode: data.postalCode || ''
    });
  }, [data.address, data.instagramHandle, data.whatsappPhone, data.postalCode]);

  // Load zones when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setZones([]);
      setSelectedZone(null);
      return;
    }

    const loadZones = async () => {
      setLoadingZones(true);
      try {
        const zonesData = await getZonesByCity(selectedCity.id);
        setZones(zonesData);
      } catch (error) {
        console.error('Error loading zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, [selectedCity, getZonesByCity]);

  // Load locations when zone is selected
  useEffect(() => {
    if (!selectedZone) {
      setLocations([]);
      setSelectedLocation(null);
      return;
    }

    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const locationsData = await getLocationsByZone(selectedZone.id);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, [selectedZone, getLocationsByZone]);

  // Update postal code and onboarding data when location is selected
  useEffect(() => {
    if (selectedLocation && selectedLocation.postal_code) {
      const newFormData = { ...formData, postalCode: selectedLocation.postal_code };
      setFormData(newFormData);
      
      // Update onboarding data with all location info
      onUpdate({
        ...newFormData,
        colonia: selectedLocation.colonia || '',
        city_id: selectedCity?.id,
        zone_id: selectedZone?.id
      });
    }
  }, [selectedLocation]);

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
    
    const newData = { ...formData, [field]: sanitizedValue };
    console.log('Setting form data:', newData);
    setFormData(newData);
    onUpdate(newData);
    
    if (field === 'whatsappPhone') {
      validatePhoneNumber(sanitizedValue);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    setSelectedCity(city || null);
    setSelectedZone(null);
    setSelectedLocation(null);
    
    // Clear location-related data
    const newFormData = { ...formData, postalCode: '' };
    setFormData(newFormData);
    onUpdate({
      ...newFormData,
      colonia: '',
      city_id: city?.id,
      zone_id: undefined
    });
  };

  const handleZoneSelect = (zoneName: string) => {
    const zone = zones.find(z => z.name === zoneName);
    setSelectedZone(zone || null);
    setSelectedLocation(null);
    
    // Clear location-related data
    const newFormData = { ...formData, postalCode: '' };
    setFormData(newFormData);
    onUpdate({
      ...newFormData,
      colonia: '',
      zone_id: zone?.id
    });
  };

  const handleLocationSelect = (locationName: string) => {
    const location = locations.find(l => l.colonia === locationName);
    setSelectedLocation(location || null);
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
    
    await onNext({
      ...formData,
      colonia: selectedLocation?.colonia || '',
      city_id: selectedCity?.id,
      zone_id: selectedZone?.id
    });
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
            Selecciona tu ubicación para que los clientes te encuentren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-blue-800 font-medium text-sm">
              Dirección del Negocio (Opcional)
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Av. Principal 123, Colonia Centro"
              className="mt-2 border-blue-200 focus:border-blue-400"
            />
          </div>
          
          {/* City Selection */}
          <div>
            <Label htmlFor="city" className="text-blue-800 font-medium text-sm">
              Selecciona tu Ciudad
            </Label>
            <Select 
              value={selectedCity?.name || ''} 
              onValueChange={handleCitySelect}
              disabled={citiesLoading}
            >
              <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                <SelectValue placeholder={citiesLoading ? "Cargando ciudades..." : "Elige tu ciudad"} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-border shadow-lg">
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
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
                Selecciona tu Zona
              </Label>
              <Select 
                value={selectedZone?.name || ''} 
                onValueChange={handleZoneSelect}
                disabled={loadingZones}
              >
                <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={loadingZones ? "Cargando zonas..." : "Elige tu zona"} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-border shadow-lg">
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Colonia Selection */}
          {selectedZone && (
            <div>
              <Label htmlFor="colonia" className="text-blue-800 font-medium text-sm">
                Selecciona tu Colonia
              </Label>
              <Select 
                value={selectedLocation?.colonia || ''} 
                onValueChange={handleLocationSelect}
                disabled={loadingLocations}
              >
                <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={loadingLocations ? "Cargando colonias..." : "Busca tu colonia"} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-border shadow-lg">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.colonia || ''}>
                      <div className="flex justify-between items-center w-full">
                        <span>{location.colonia}</span>
                        {location.professional_count && location.professional_count > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {location.professional_count} pros
                          </Badge>
                        )}
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
              disabled={!!selectedLocation}
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
              <CustomPhoneInput
                value={formData.whatsappPhone}
                onChange={(value) => handleChange('whatsappPhone', value || '')}
                placeholder="Número de WhatsApp"
                defaultCountry="MX"
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

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={canProceed}
        loading={loading}
      />
    </div>
  );
};