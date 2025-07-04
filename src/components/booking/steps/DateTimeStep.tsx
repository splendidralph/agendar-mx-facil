import UnifiedBookingCalendar from '../UnifiedBookingCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateTimeStepProps {
  providerId: string;
  serviceId?: string;
  serviceDuration?: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const DateTimeStep = ({
  providerId,
  serviceId,
  serviceDuration = 30,
  onDateTimeSelect,
  selectedDate,
  selectedTime
}: DateTimeStepProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Fecha y hora</h3>
          <p className="text-sm text-muted-foreground">Selecciona cuándo quieres tu cita</p>
        </div>
        
        <UnifiedBookingCalendar
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
    <UnifiedBookingCalendar
      providerId={providerId}
      serviceId={serviceId}
      serviceDuration={serviceDuration}
      onDateTimeSelect={onDateTimeSelect}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
    />
  );
};

export default DateTimeStep;