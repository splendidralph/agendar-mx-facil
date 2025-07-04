import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
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

        // Generate slots based on service duration (minimum 30 minutes)
        const slotIncrement = Math.max(30, serviceDuration);
        for (let time = startTime; time < endTime; time += slotIncrement) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          // Check if this slot can accommodate the full service duration
          const slotEnd = addMinutesToTime(timeString, serviceDuration);
          const slotEndMinutes = timeToMinutes(slotEnd);
          
          // Skip if slot would extend beyond availability window
          if (slotEndMinutes > endTime) continue;
          
          // Check if this slot conflicts with existing bookings
          const hasConflict = bookings?.some(booking => {
            const bookingStart = booking.booking_time;
            const bookingDuration = booking.services?.duration_minutes || 30;
            const bookingEndTime = addMinutesToTime(bookingStart, bookingDuration);
            
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

  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
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

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, 'EEE d', { locale: es });
  };

  const groupTimeSlots = () => {
    const morning = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour < 12;
    });
    
    const afternoon = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    
    const evening = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 18;
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupTimeSlots();

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
          <span className="text-sm font-medium text-primary">Fecha</span>
        </div>
        <div className="w-8 h-0.5 bg-border"></div>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            date ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>2</div>
          <span className={`text-sm font-medium ${date ? 'text-primary' : 'text-muted-foreground'}`}>Hora</span>
        </div>
      </div>

      {/* Date Selection */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Selecciona una fecha</CardTitle>
          <p className="text-sm text-muted-foreground">Elige el día para tu cita</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick date shortcuts */}
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map(days => {
              const quickDate = addDays(new Date(), days);
              if (!isDateAvailable(quickDate)) return null;
              
              return (
                <Button
                  key={days}
                  variant={date && isSameDay(date, quickDate) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateSelect(quickDate)}
                  className="touch-manipulation h-10 px-4 text-sm"
                >
                  {getDateLabel(quickDate)}
                </Button>
              );
            })}
          </div>

          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => 
              isBefore(date, startOfDay(new Date())) || 
              !isDateAvailable(date)
            }
            modifiers={{
              available: (date) => isDateAvailable(date) && !isBefore(date, startOfDay(new Date())),
              unavailable: (date) => !isDateAvailable(date) || isBefore(date, startOfDay(new Date()))
            }}
            modifiersStyles={{
              available: { 
                backgroundColor: 'hsl(var(--primary) / 0.1)', 
                color: 'hsl(var(--primary))',
                fontWeight: '500'
              },
              unavailable: { 
                opacity: 0.4,
                color: 'hsl(var(--muted-foreground))'
              }
            }}
            locale={es}
            className="rounded-lg border-0 w-full"
          />
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 rounded border border-primary/30"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded"></div>
              <span>No disponible</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {date && (
        <Card className="border-border/50 shadow-sm animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Selecciona una hora</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(date, "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-foreground mb-2">No hay horarios disponibles</h3>
                <p className="text-sm">Por favor selecciona otra fecha</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Morning slots */}
                {morning.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mañana</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {morning.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`h-12 touch-manipulation font-medium ${
                            selectedTime === slot.time 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : slot.available 
                                ? "hover:bg-secondary hover:border-secondary-foreground/20" 
                                : "opacity-50 cursor-not-allowed"
                          }`}
                          title={slot.conflictReason}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-2 text-xs opacity-60">Ocupado</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Afternoon slots */}
                {afternoon.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tarde</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {afternoon.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`h-12 touch-manipulation font-medium ${
                            selectedTime === slot.time 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : slot.available 
                                ? "hover:bg-secondary hover:border-secondary-foreground/20" 
                                : "opacity-50 cursor-not-allowed"
                          }`}
                          title={slot.conflictReason}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-2 text-xs opacity-60">Ocupado</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening slots */}
                {evening.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Noche</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {evening.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`h-12 touch-manipulation font-medium ${
                            selectedTime === slot.time 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : slot.available 
                                ? "hover:bg-secondary hover:border-secondary-foreground/20" 
                                : "opacity-50 cursor-not-allowed"
                          }`}
                          title={slot.conflictReason}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-2 text-xs opacity-60">Ocupado</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBookingCalendar;