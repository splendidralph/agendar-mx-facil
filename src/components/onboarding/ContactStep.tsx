import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MessageCircle, MapPin, Instagram, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import PhoneInput from 'react-phone-number-input/input';
import { Input } from '@/components/ui/input';
import 'react-phone-number-input/style.css';

const ContactStep = () => {
  const { data, nextStep, prevStep, loading } = useOnboarding();
  const [formData, setFormData] = useState({
    address: data.address,
    instagramHandle: data.instagramHandle,
    whatsappPhone: data.whatsappPhone || ''
  });
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

  useEffect(() => {
    setFormData({
      address: data.address,
      instagramHandle: data.instagramHandle,
      whatsappPhone: data.whatsappPhone || ''
    });
  }, [data.address, data.instagramHandle, data.whatsappPhone]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Contact info is optional, so just proceed
    await nextStep(formData);
  };

  const handleInstagramChange = (value: string) => {
    const cleanValue = value.replace('@', '');
    setFormData(prev => ({ ...prev, instagramHandle: cleanValue }));
  };

  const handleWhatsAppChange = (value?: string) => {
    const phoneValue = value || '';
    setFormData(prev => ({ ...prev, whatsappPhone: phoneValue }));
    validatePhoneNumber(phoneValue);
  };

  const canProceed = !loading && (!formData.whatsappPhone || phoneValidation.isValid);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* WhatsApp Benefits Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            WhatsApp para tu Negocio
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              Recomendado
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Recibe notificaciones instantáneas de nuevas citas directamente en tu WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Notificaciones instantáneas
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Mayor tasa de respuesta
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Comunicación directa con clientes
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Fácil gestión desde tu celular
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="whatsapp" className="text-green-800 font-medium">
              Número de WhatsApp
            </Label>
            <div className="relative mt-2">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4 z-10" />
              <PhoneInput
                country="MX"
                value={formData.whatsappPhone}
                onChange={handleWhatsAppChange}
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
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Dirección del Negocio
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Ej: Av. Principal 123, Colonia Centro"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-muted-foreground" />
            Instagram
          </Label>
          <div className="relative mt-1">
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

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="border-border text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          type="submit"
          disabled={!canProceed}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

export default ContactStep;
