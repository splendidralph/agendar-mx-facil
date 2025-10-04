import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TimeSelect } from '@/components/ui/time-select';
import { Calendar, Clock, Plus, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { normalizeTimeFormat } from '@/lib/utils';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Props {
  providerId: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const getDayName = (dayOfWeek: number): string => {
  const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
  return day?.label || 'día';
};

const AvailabilityManager = ({ providerId }: Props) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [providerId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('provider_id', providerId)
        .order('day_of_week');

      if (error) throw error;

      // Initialize with default slots if none exist
      if (!data || data.length === 0) {
        const defaultSlots = DAYS_OF_WEEK.slice(0, 5).map(day => ({
          day_of_week: day.value,
          start_time: '09:00',
          end_time: '17:00',
          is_active: day.value >= 1 && day.value <= 5, // Monday to Friday
        }));
        setAvailability(defaultSlots);
      } else {
        // Normalize time format from database (HH:MM:SS -> HH:MM)
        const normalizedData = data.map(slot => ({
          ...slot,
          start_time: normalizeTimeFormat(slot.start_time) || '09:00',
          end_time: normalizeTimeFormat(slot.end_time) || '17:00',
        }));
        setAvailability(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_active: true,
    };
    setAvailability(prev => [...prev, newSlot]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev => 
      prev.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // CRITICAL FIX: Client-side validation for time range constraints
      const validationErrors: string[] = [];
      const activeSlots = availability.filter(slot => slot.is_active);

      for (const slot of activeSlots) {
        // Check if times are provided
        if (!slot.start_time || !slot.end_time) {
          validationErrors.push(`El ${getDayName(slot.day_of_week)} debe tener hora de inicio y fin.`);
          continue;
        }

        // Create Date objects for comparison to avoid string issues
        const startTime = new Date(`2000/01/01 ${slot.start_time}`);
        const endTime = new Date(`2000/01/01 ${slot.end_time}`);

        // Check the database constraint: end_time must be greater than start_time
        if (endTime <= startTime) {
          validationErrors.push(`La hora de fin debe ser posterior a la hora de inicio el ${getDayName(slot.day_of_week)}.`);
        }
      }

      // If there are validation errors, show the first one and stop
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        setSaving(false);
        return;
      }

      // Delete existing availability for this provider
      await supabase
        .from('availability')
        .delete()
        .eq('provider_id', providerId);

      // Insert new availability slots with explicit seconds format
      const slotsToInsert = activeSlots.map(slot => ({
        provider_id: providerId,
        day_of_week: slot.day_of_week,
        start_time: `${slot.start_time}:00`,
        end_time: `${slot.end_time}:00`,
        is_active: slot.is_active,
      }));

      if (slotsToInsert.length > 0) {
        const { error } = await supabase
          .from('availability')
          .insert(slotsToInsert);

        if (error) throw error;
      }

      toast.success('Disponibilidad guardada exitosamente');
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error al guardar la disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  const getDaySlots = (dayOfWeek: number) => {
    return availability.filter(slot => slot.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gestionar Disponibilidad
        </CardTitle>
        <CardDescription>
          Configura tus horarios de trabajo para cada día de la semana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS_OF_WEEK.map(day => {
          const daySlots = getDaySlots(day.value);
          const hasSlots = daySlots.length > 0;

          return (
            <div key={day.value} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{day.label}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(day.value)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {hasSlots ? (
                <div className="space-y-2 pl-4">
                  {daySlots.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => 
                      s.day_of_week === slot.day_of_week && 
                      s.start_time === slot.start_time && 
                      s.end_time === slot.end_time
                    );
                    
                    return (
                      <div key={`${slot.day_of_week}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg">
                        <Switch
                          checked={slot.is_active}
                          onCheckedChange={(checked) => updateTimeSlot(globalIndex, 'is_active', checked)}
                          className="shrink-0"
                        />
                        
                         <div className="flex items-center gap-2 w-full sm:flex-1">
                           <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                           <TimeSelect
                             value={slot.start_time}
                             onValueChange={(value) => updateTimeSlot(globalIndex, 'start_time', value)}
                             placeholder="Inicio"
                             className="flex-1 sm:w-32"
                           />
                           <span className="text-muted-foreground shrink-0">-</span>
                           <TimeSelect
                             value={slot.end_time}
                             onValueChange={(value) => updateTimeSlot(globalIndex, 'end_time', value)}
                             placeholder="Fin"
                             className="flex-1 sm:w-32"
                           />
                         </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(globalIndex)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0 self-end sm:self-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pl-4 py-2 text-sm text-muted-foreground">
                  No disponible
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <Button 
            onClick={saveAvailability}
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;