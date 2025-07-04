import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface ClientDetailsStepProps {
  clientData: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    colonia: string;
  };
  onClientDataChange: (data: any) => void;
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  error?: string | null;
  isMobile?: boolean;
}

const ClientDetailsStep = ({
  clientData,
  onClientDataChange,
  selectedService,
  selectedDate,
  selectedTime,
  error,
  isMobile = false
}: ClientDetailsStepProps) => {
  const handleChange = (field: string, value: string) => {
    onClientDataChange(prev => ({ ...prev, [field]: value }));
  };

  const content = (
    <div className="space-y-4">
      {!isMobile && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Tus datos</h3>
          <p className="text-sm text-muted-foreground">
            Completa la información para confirmar tu cita
          </p>
        </div>
      )}

      {isMobile && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Completa tus datos</h3>
          <p className="text-sm text-muted-foreground">
            Solo necesitamos algunos datos para confirmar tu reserva
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-foreground font-medium">Nombre completo *</Label>
            <Input
              id="name"
              type="text"
              required
              value={clientData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="border-border focus:border-primary mt-2 h-12"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground font-medium">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={clientData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="border-border focus:border-primary mt-2 h-12"
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-foreground font-medium">Email (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={clientData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="border-border focus:border-primary mt-2 h-12"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="client-colonia" className="text-foreground font-medium">Tu colonia (opcional)</Label>
          <Input
            id="client-colonia"
            value={clientData.colonia}
            onChange={(e) => handleChange('colonia', e.target.value)}
            className="border-border focus:border-primary mt-2 h-12"
            placeholder="Ej. Roma Norte"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-foreground font-medium">Notas adicionales (opcional)</Label>
          <Textarea
            id="notes"
            value={clientData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="border-border focus:border-primary mt-2"
            placeholder="Cualquier información adicional..."
            rows={3}
          />
        </div>

        {/* Booking Summary */}
        {selectedService && selectedDate && selectedTime && (
          <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 space-y-2">
            <h4 className="font-medium text-foreground">Resumen de tu cita:</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span className="font-medium">{selectedService.duration_minutes} min</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${selectedService.price} MXN</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  );
};

export default ClientDetailsStep;