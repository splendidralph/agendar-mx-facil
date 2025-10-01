import ModernBookingCalendar from '../ModernBookingCalendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { CheckCircle } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface DateTimeStepProps {
  providerId: string;
  serviceId?: string;
  serviceDuration?: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
  selectedService?: Service | null;
  onEditService?: () => void;
}

const DateTimeStep = ({
  providerId,
  serviceId,
  serviceDuration = 30,
  onDateTimeSelect,
  selectedDate,
  selectedTime,
  selectedService,
  onEditService
}: DateTimeStepProps) => {
  const isMobile = useIsMobile();

  const ServiceSummary = () => {
    if (!selectedService) return null;
    
    return (
      <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{selectedService.name}</p>
              <p className="text-xs text-muted-foreground">${selectedService.price} • {selectedService.duration_minutes} min</p>
            </div>
          </div>
          {onEditService && (
            <button
              onClick={onEditService}
              className="text-xs text-primary hover:underline font-medium"
            >
              Cambiar
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <ServiceSummary />
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Fecha y hora</h3>
          <p className="text-sm text-muted-foreground">Selecciona cuándo quieres tu cita</p>
        </div>
        
        <ModernBookingCalendar
          providerId={providerId}
          serviceId={serviceId}
          serviceDuration={serviceDuration}
          onDateTimeSelect={onDateTimeSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceSummary />
      <ModernBookingCalendar
        providerId={providerId}
        serviceId={serviceId}
        serviceDuration={serviceDuration}
        onDateTimeSelect={onDateTimeSelect}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    </div>
  );
};

export default DateTimeStep;