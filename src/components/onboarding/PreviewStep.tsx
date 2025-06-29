
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Link2, Check, Instagram, MapPin, Clock, DollarSign, AlertCircle, MessageCircle, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PreviewStep = () => {
  const navigate = useNavigate();
  const { data, prevStep, completeOnboarding, loading } = useOnboarding();
  const [completing, setCompleting] = useState(false);

  const bookingUrl = `https://bookeasy.mx/@${data.username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('¡Link copiado al portapapeles!');
  };

  const handleComplete = async () => {
    setCompleting(true);
    const success = await completeOnboarding();
    if (success) {
      navigate('/dashboard');
    }
    setCompleting(false);
  };

  const categoryLabels = {
    corte_barberia: 'Corte y Barbería',
    unas: 'Uñas y Manicure',
    maquillaje_cejas: 'Maquillaje y Cejas',
    cuidado_facial: 'Cuidado Facial',
    masajes_relajacion: 'Masajes y Relajación',
    color_alisado: 'Color y Alisado'
  };

  // Check if we have all required data
  const hasRequiredData = data.businessName && data.category && data.username && data.services.length > 0;

  if (!hasRequiredData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Información Incompleta</h3>
            <p className="text-sm text-yellow-700">
              Faltan algunos datos requeridos para completar tu perfil. Por favor regresa a los pasos anteriores.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Datos faltantes:</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {!data.businessName && <li>Nombre del negocio</li>}
            {!data.category && <li>Categoría del servicio</li>}
            {!data.username && <li>Username</li>}
            {data.services.length === 0 && <li>Al menos un servicio</li>}
          </ul>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-border text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Regresar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          ¡Tu Perfil está Listo!
        </h3>
        <p className="text-muted-foreground mb-4">
          Revisa cómo se verá tu perfil para los clientes
        </p>
      </div>

      {/* Notification Setup Status */}
      <Card className={`${data.whatsappPhone ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {data.whatsappPhone ? (
              <>
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Notificaciones Configuradas</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  ¡Perfecto!
                </Badge>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 text-amber-600" />
                <span className="text-amber-800">Solo Email Configurado</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                  Mejorable
                </Badge>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.whatsappPhone ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Smartphone className="h-4 w-4" />
                WhatsApp: {data.whatsappPhone}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Mail className="h-4 w-4" />
                Email: Habilitado
              </div>
              <p className="text-sm text-green-600">
                Recibirás notificaciones instantáneas de nuevas citas por WhatsApp y email.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Mail className="h-4 w-4" />
                Solo notificaciones por email
              </div>
              <p className="text-sm text-amber-600">
                Puedes agregar WhatsApp después en tu dashboard para recibir notificaciones más rápidas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Tu Link de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
            <span className="font-mono text-sm flex-1">{bookingUrl}</span>
            <Button onClick={copyLink} size="sm" variant="outline">
              Copiar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Comparte este link con tus clientes para que puedan hacer reservas
          </p>
        </CardContent>
      </Card>

      {/* Profile Preview */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{data.businessName}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {categoryLabels[data.category as keyof typeof categoryLabels]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.bio && (
            <p className="text-muted-foreground">{data.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {data.address}
              </div>
            )}
            {data.instagramHandle && (
              <div className="flex items-center gap-1">
                <Instagram className="h-4 w-4" />
                @{data.instagramHandle}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3">Servicios Disponibles</h4>
            <div className="space-y-3">
              {data.services.map((service, index) => (
                <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{service.name}</h5>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} min
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[service.category as keyof typeof categoryLabels]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-semibold text-lg">
                      <DollarSign className="h-4 w-4" />
                      {service.price}
                    </div>
                    <p className="text-xs text-muted-foreground">MXN</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
          onClick={handleComplete}
          disabled={completing || loading}
          className="btn-primary"
        >
          {completing ? 'Finalizando...' : 'Finalizar Configuración'}
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep;
