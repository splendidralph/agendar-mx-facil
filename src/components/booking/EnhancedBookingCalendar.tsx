import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

interface Props {
  providerId: string;
  serviceId?: string;
  serviceDuration?: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const EnhancedBookingCalendar = ({ 
  providerId, 
  serviceId, 
  serviceDuration = 30,
  onDateTimeSelect,
  selectedDate,
  selectedTime 
}: Props) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [providerAvailability, setProviderAvailability] = useState<any[]>([]);

  useEffect(() => {
    fetchProviderAvailability();
  }, [providerId]);

  useEffect(() => {
    if (date) {
      generateTimeSlots();
    }
  }, [date, providerId, serviceId, serviceDuration]);

  const fetchProviderAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true);

      if (error) throw error;
      setProviderAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const generateTimeSlots = async () => {
    if (!date) return;
    
    setLoading(true);
    try {
      const dayOfWeek = date.getDay();
      const dayAvailability = providerAvailability.filter(
        slot => slot.day_of_week === dayOfWeek
      );

      if (dayAvailability.length === 0) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      // Get existing bookings for the selected date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_time, service_id, services(duration_minutes)')
        .eq('provider_id', providerId)
        .eq('booking_date', format(date, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      const slots: TimeSlot[] = [];

      // Generate slots for each availability window
      dayAvailability.forEach(availability => {
        const startHour = parseInt(availability.start_time.split(':')[0]);
        const startMinute = parseInt(availability.start_time.split(':')[1]);
        const endHour = parseInt(availability.end_time.split(':')[0]);
        const endMinute = parseInt(availability.end_time.split(':')[1]);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        // Generate 30-minute slots
        for (let time = startTime; time < endTime; time += 30) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          // Check if this slot conflicts with existing bookings
          const hasConflict = bookings?.some(booking => {
            const bookingStart = booking.booking_time;
            const bookingDuration = booking.services?.duration_minutes || 30;
            const bookingEndTime = addMinutesToTime(bookingStart, bookingDuration);
            
            const slotEnd = addMinutesToTime(timeString, serviceDuration);
            
            return (
              timeOverlaps(timeString, slotEnd, bookingStart, bookingEndTime)
            );
          });

          slots.push({
            time: timeString,
            available: !hasConflict,
            conflictReason: hasConflict ? 'Ya reservado' : undefined
          });
        }
      });

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const timeOverlaps = (start1: string, end1: string, start2: string, end2: string): boolean => {
    return start1 < end2 && end1 > start2;
  };

  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return providerAvailability.some(slot => 
      slot.day_of_week === dayOfWeek && slot.is_active
    );
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && selectedTime) {
      onDateTimeSelect(newDate, selectedTime);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date) {
      onDateTimeSelect(date, time);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Seleccionar Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => 
              isBefore(date, startOfDay(new Date())) || 
              !isDateAvailable(date)
            }
            modifiers={{
              available: (date) => isDateAvailable(date),
              unavailable: (date) => !isDateAvailable(date)
            }}
            modifiersStyles={{
              available: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))'
              },
              unavailable: { 
                opacity: 0.3,
                textDecoration: 'line-through'
              }
            }}
            locale={es}
            className="rounded-md border"
          />
          
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Días disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded line-through"></div>
              <span>Días no disponibles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios Disponibles
          </CardTitle>
          {date && (
            <p className="text-sm text-muted-foreground">
              {format(date, 'EEEE, d MMMM yyyy', { locale: es })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!date ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una fecha para ver los horarios disponibles</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando horarios...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`${
                    selectedTime === slot.time 
                      ? "bg-primary text-primary-foreground" 
                      : slot.available 
                        ? "hover:bg-secondary" 
                        : "opacity-50 cursor-not-allowed"
                  }`}
                  title={slot.conflictReason}
                >
                  {slot.time}
                  {!slot.available && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      X
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBookingCalendar;