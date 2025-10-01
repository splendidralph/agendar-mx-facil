import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CustomPhoneInput } from '@/components/ui/phone-input';
import { AlertCircle, Edit2 } from 'lucide-react';
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
  onEditService?: () => void;
  onEditDateTime?: () => void;
}

const ClientDetailsStep = ({
  clientData,
  onClientDataChange,
  selectedService,
  selectedDate,
  selectedTime,
  error,
  isMobile = false,
  onEditService,
  onEditDateTime
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
            <Label htmlFor="phone" className="text-foreground font-medium">Teléfono (con código de país) *</Label>
            <div className="mt-2">
              <CustomPhoneInput
                value={clientData.phone}
                onChange={(value) => handleChange('phone', value || '')}
                defaultCountry="MX"
                className="border-border focus:border-primary h-12"
                placeholder="(55) 1234-5678"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Requerido:</strong> Incluye el código de país (ej. +52 para México, +1 para EE.UU./Canadá)
            </p>
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

        {/* Booking Summary with Edit Buttons */}
        {selectedService && selectedDate && selectedTime && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">Resumen de tu cita</h4>
            </div>
            
            <div className="text-sm space-y-2.5">
              <div className="flex justify-between items-start py-2 border-b border-border/50">
                <div className="flex-1">
                  <span className="text-muted-foreground text-xs block mb-1">Servicio</span>
                  <div>
                    <span className="font-medium text-foreground">{selectedService.name}</span>
                    <span className="text-muted-foreground ml-2">(${selectedService.price})</span>
                  </div>
                </div>
                {onEditService && (
                  <button
                    onClick={onEditService}
                    className="text-primary hover:text-primary/80 transition-colors ml-2 flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="h-3 w-3" />
                    Cambiar
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-start py-2">
                <div className="flex-1">
                  <span className="text-muted-foreground text-xs block mb-1">Fecha y hora</span>
                  <div className="font-medium text-foreground">
                    <div>{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</div>
                    <div className="text-primary">{selectedTime}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Duración: {selectedService.duration_minutes} min</div>
                  </div>
                </div>
                {onEditDateTime && (
                  <button
                    onClick={onEditDateTime}
                    className="text-primary hover:text-primary/80 transition-colors ml-2 flex items-center gap-1 text-xs"
                  >
                    <Edit2 className="h-3 w-3" />
                    Cambiar
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-primary/20">
                <span className="font-semibold text-foreground">Total a pagar:</span>
                <span className="text-xl font-bold text-primary">${selectedService.price}</span>
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