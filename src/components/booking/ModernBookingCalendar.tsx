import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

interface AvailableDay {
  date: Date;
  label: string;
  subLabel: string;
  availableSlots: number;
  hasSlots: boolean;
}

interface Props {
  providerId: string;
  serviceId?: string;
  serviceDuration?: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const ModernBookingCalendar = ({ 
  providerId, 
  serviceId, 
  serviceDuration = 30,
  onDateTimeSelect,
  selectedDate,
  selectedTime 
}: Props) => {
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<AvailableDay | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [providerAvailability, setProviderAvailability] = useState<any[]>([]);
  const [showingMoreDays, setShowingMoreDays] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchProviderAvailability();
  }, [providerId]);

  useEffect(() => {
    if (providerAvailability.length > 0) {
      generateAvailableDays();
    }
  }, [providerAvailability]);

  useEffect(() => {
    if (selectedDate && availableDays.length > 0) {
      const matchingDay = availableDays.find(day => isSameDay(day.date, selectedDate));
      if (matchingDay) {
        setSelectedDay(matchingDay);
        generateTimeSlots(matchingDay.date);
      }
    }
  }, [selectedDate, availableDays]);

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

  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return providerAvailability.some(slot => 
      slot.day_of_week === dayOfWeek && slot.is_active
    );
  };

  const generateAvailableDays = async () => {
    setLoading(true);
    const days: AvailableDay[] = [];
    const today = new Date();
    const daysToCheck = showingMoreDays ? 21 : 7;

    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = addDays(today, i);
      
      if (isDateAvailable(checkDate)) {
        const slotsCount = await getAvailableSlotsCount(checkDate);
        
        const label = isToday(checkDate) 
          ? 'Hoy' 
          : isTomorrow(checkDate) 
            ? 'Mañana' 
            : format(checkDate, 'EEEE', { locale: es });
        
        const subLabel = format(checkDate, 'd MMM', { locale: es });
        
        days.push({
          date: checkDate,
          label,
          subLabel,
          availableSlots: slotsCount,
          hasSlots: slotsCount > 0
        });
      }
    }

    setAvailableDays(days.filter(day => day.hasSlots));
    setLoading(false);
  };

  const getAvailableSlotsCount = async (date: Date): Promise<number> => {
    const dayOfWeek = date.getDay();
    const dayAvailability = providerAvailability.filter(
      slot => slot.day_of_week === dayOfWeek
    );

    if (dayAvailability.length === 0) return 0;

    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_time, service_id, services(duration_minutes)')
        .eq('provider_id', providerId)
        .eq('booking_date', format(date, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      let totalSlots = 0;
      let availableSlots = 0;

      dayAvailability.forEach(availability => {
        const startHour = parseInt(availability.start_time.split(':')[0]);
        const startMinute = parseInt(availability.start_time.split(':')[1]);
        const endHour = parseInt(availability.end_time.split(':')[0]);
        const endMinute = parseInt(availability.end_time.split(':')[1]);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        const slotIncrement = Math.max(30, serviceDuration);
        for (let time = startTime; time < endTime; time += slotIncrement) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const slotEnd = addMinutesToTime(timeString, serviceDuration);
          const slotEndMinutes = timeToMinutes(slotEnd);
          
          if (slotEndMinutes > endTime) continue;
          
          totalSlots++;
          
          const hasConflict = bookings?.some(booking => {
            const bookingStart = booking.booking_time;
            const bookingDuration = booking.services?.duration_minutes || 30;
            const bookingEndTime = addMinutesToTime(bookingStart, bookingDuration);
            
            return timeOverlaps(timeString, slotEnd, bookingStart, bookingEndTime);
          });

          if (!hasConflict) availableSlots++;
        }
      });

      return availableSlots;
    } catch (error) {
      console.error('Error counting available slots:', error);
      return 0;
    }
  };

  const generateTimeSlots = async (date: Date) => {
    setTimeSlotsLoading(true);
    try {
      const dayOfWeek = date.getDay();
      const dayAvailability = providerAvailability.filter(
        slot => slot.day_of_week === dayOfWeek
      );

      if (dayAvailability.length === 0) {
        setTimeSlots([]);
        setTimeSlotsLoading(false);
        return;
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_time, service_id, services(duration_minutes)')
        .eq('provider_id', providerId)
        .eq('booking_date', format(date, 'yyyy-MM-dd'))
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;

      const slots: TimeSlot[] = [];

      dayAvailability.forEach(availability => {
        const startHour = parseInt(availability.start_time.split(':')[0]);
        const startMinute = parseInt(availability.start_time.split(':')[1]);
        const endHour = parseInt(availability.end_time.split(':')[0]);
        const endMinute = parseInt(availability.end_time.split(':')[1]);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        const slotIncrement = Math.max(30, serviceDuration);
        for (let time = startTime; time < endTime; time += slotIncrement) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const slotEnd = addMinutesToTime(timeString, serviceDuration);
          const slotEndMinutes = timeToMinutes(slotEnd);
          
          if (slotEndMinutes > endTime) continue;
          
          const hasConflict = bookings?.some(booking => {
            const bookingStart = booking.booking_time;
            const bookingDuration = booking.services?.duration_minutes || 30;
            const bookingEndTime = addMinutesToTime(bookingStart, bookingDuration);
            
            return timeOverlaps(timeString, slotEnd, bookingStart, bookingEndTime);
          });

          slots.push({
            time: timeString,
            available: !hasConflict,
            conflictReason: hasConflict ? 'Ya reservado' : undefined
          });
        }
      });

      setTimeSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
    } finally {
      setTimeSlotsLoading(false);
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

  const handleDaySelect = (day: AvailableDay) => {
    setSelectedDay(day);
    generateTimeSlots(day.date);
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDay) {
      onDateTimeSelect(selectedDay.date, time);
    }
  };

  const handleBackToDays = () => {
    setSelectedDay(null);
    setTimeSlots([]);
  };

  const getAvailabilityText = (slotsCount: number) => {
    if (slotsCount === 1) return '1 espacio';
    if (slotsCount < 5) return `${slotsCount} espacios`;
    return 'Varios espacios';
  };

  const groupTimeSlots = () => {
    const morning = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour < 12;
    });
    
    const afternoon = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    
    const evening = timeSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 18;
    });

    return { morning, afternoon, evening };
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-2xl overflow-hidden animate-fade-in">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted/50 rounded-lg animate-pulse"></div>
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse"></div>
            <div className="space-y-3 mt-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show time slots view
  if (selectedDay) {
    const { morning, afternoon, evening } = groupTimeSlots();
    
    return (
      <Card className="border-border/50 shadow-2xl overflow-hidden animate-fade-in">
        <CardContent className="p-6">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDays}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar fecha
            </Button>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {selectedDay.label}, {selectedDay.subLabel}
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecciona tu horario preferido
              </p>
            </div>
          </div>

          {timeSlotsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="font-medium text-foreground mb-2">No hay horarios disponibles</h4>
              <p className="text-sm text-muted-foreground">Selecciona otra fecha</p>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-in-right">
              {/* Morning slots */}
              {morning.some(slot => slot.available) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Mañana
                    </span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                  )}>
                    {morning.filter(slot => slot.available).map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "h-12 touch-manipulation font-medium smooth-transition justify-start",
                          selectedTime === slot.time && "shadow-lg scale-105",
                          isMobile && "text-base"
                        )}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon slots */}
              {afternoon.some(slot => slot.available) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Tarde
                    </span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                  )}>
                    {afternoon.filter(slot => slot.available).map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "h-12 touch-manipulation font-medium smooth-transition justify-start",
                          selectedTime === slot.time && "shadow-lg scale-105",
                          isMobile && "text-base"
                        )}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evening slots */}
              {evening.some(slot => slot.available) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Noche
                    </span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                  )}>
                    {evening.filter(slot => slot.available).map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "h-12 touch-manipulation font-medium smooth-transition justify-start",
                          selectedTime === slot.time && "shadow-lg scale-105",
                          isMobile && "text-base"
                        )}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show available days view
  return (
    <Card className="border-border/50 shadow-2xl overflow-hidden animate-fade-in">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            ¿Cuándo te gustaría tu cita?
          </h3>
          <p className="text-sm text-muted-foreground">
            Selecciona el día que mejor te convenga
          </p>
        </div>

        {availableDays.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="font-medium text-foreground mb-2">No hay fechas disponibles</h4>
            <p className="text-sm text-muted-foreground">
              Este proveedor no tiene disponibilidad en los próximos días
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableDays.map((day, index) => (
              <Button
                key={day.date.getTime()}
                variant="outline"
                onClick={() => handleDaySelect(day)}
                className={cn(
                  "w-full h-auto p-4 justify-between hover:scale-[1.02] smooth-transition animate-fade-in touch-manipulation",
                  isMobile && "p-5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-lg">
                      {day.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.subLabel}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {getAvailabilityText(day.availableSlots)}
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Button>
            ))}

            {!showingMoreDays && availableDays.length >= 5 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setShowingMoreDays(true);
                  generateAvailableDays();
                }}
                className="w-full mt-4 text-primary hover:text-primary/80"
              >
                Ver más días disponibles
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernBookingCalendar;