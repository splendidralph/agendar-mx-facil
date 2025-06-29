
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MessageCircle, MapPin, Instagram, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const ContactStep = () => {
  const { data, updateData, nextStep, prevStep, loading } = useOnboarding();
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
  }, [data]);

  const validatePhoneNumber = (phone: string) => {
    if (!phone) {
      setPhoneValidation({ isValid: true, message: '' });
      return;
    }

    // Basic validation for Mexican phone numbers
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      setPhoneValidation({ 
        isValid: false, 
        message: 'Número muy corto. Debe tener al menos 10 dígitos.' 
      });
    } else if (cleanPhone.length > 13) {
      setPhoneValidation({ 
        isValid: false, 
        message: 'Número muy largo. Máximo 13 dígitos.' 
      });
    } else if (!cleanPhone.match(/^(\+?52)?[1-9]\d{9}$/)) {
      setPhoneValidation({ 
        isValid: false, 
        message: 'Formato inválido. Usa +52 55 1234 5678 o 55 1234 5678' 
      });
    } else {
      setPhoneValidation({ isValid: true, message: '¡Perfecto! Número válido' });
    }
  };

  const handleNext = async () => {
    console.log('ContactStep: handleNext called with formData:', formData);
    
    // Validate phone if provided
    if (formData.whatsappPhone && !phoneValidation.isValid) {
      toast.error('Por favor corrige el número de WhatsApp');
      return;
    }
    
    updateData(formData);
    
    try {
      await nextStep(formData);
      console.log('ContactStep: nextStep completed successfully');
    } catch (error) {
      console.error('ContactStep: Error in nextStep:', error);
    }
  };

  const handleInstagramChange = (value: string) => {
    const cleanValue = value.replace('@', '');
    setFormData(prev => ({ ...prev, instagramHandle: cleanValue }));
  };

  const handleWhatsAppChange = (value: string) => {
    const cleanValue = value.replace(/[^\d+\s-]/g, '');
    setFormData(prev => ({ ...prev, whatsappPhone: cleanValue }));
    validatePhoneNumber(cleanValue);
  };

  return (
    <div className="space-y-6">
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
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4" />
              <Input
                id="whatsapp"
                value={formData.whatsappPhone}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="+52 55 1234 5678"
                className={`pl-10 border-green-200 focus:border-green-400 focus:ring-green-400 ${
                  formData.whatsappPhone && !phoneValidation.isValid ? 'border-red-300' : ''
                } ${
                  formData.whatsappPhone && phoneValidation.isValid ? 'border-green-300' : ''
                }`}
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
            {!formData.whatsappPhone && (
              <p className="text-sm text-green-600 mt-1">
                Ejemplo: +52 55 1234 5678 (incluye código de país)
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
          <p className="text-sm text-muted-foreground mt-1">
            Ayuda a los clientes a encontrarte fácilmente
          </p>
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
          <p className="text-sm text-muted-foreground mt-1">
            Conecta con tus clientes en redes sociales
          </p>
        </div>
      </div>

      {/* Skip Warning */}
      {!formData.whatsappPhone && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Sin WhatsApp te perderás notificaciones importantes
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Solo recibirás notificaciones por email, que pueden llegar a spam o tardar más en ser vistas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={loading || (formData.whatsappPhone && !phoneValidation.isValid)}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ContactStep;
