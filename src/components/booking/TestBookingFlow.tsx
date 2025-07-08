import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UnifiedBookingCalendar from './UnifiedBookingCalendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';

interface Props {
  providerId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
}

export const TestBookingFlow = ({ 
  providerId, 
  serviceId, 
  serviceName, 
  servicePrice, 
  serviceDuration 
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.phone) {
      toast.error('Por favor completa la información requerida');
      return;
    }

    setSubmitting(true);
    try {
      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          provider_id: providerId,
          service_id: serviceId,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedTime,
          total_price: servicePrice,
          status: 'pending',
          source_type: 'test'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create guest booking info
      const { error: guestError } = await supabase
        .from('guest_bookings')
        .insert({
          booking_id: booking.id,
          guest_name: clientInfo.name,
          guest_phone: clientInfo.phone,
          guest_email: clientInfo.email || null
        });

      if (guestError) throw guestError;

      toast.success('¡Reserva creada exitosamente!');
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setClientInfo({ name: '', phone: '', email: '', notes: '' });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservar: {serviceName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Duración: {serviceDuration} minutos</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${servicePrice}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <UnifiedBookingCalendar
        providerId={providerId}
        serviceId={serviceId}
        serviceDuration={serviceDuration}
        onDateTimeSelect={handleDateTimeSelect}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      {/* Client Info */}
      {selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 664 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Resumen de la reserva:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><Clock className="h-4 w-4 inline mr-2" />Fecha: {selectedDate.toLocaleDateString('es-ES')}</p>
                <p><Clock className="h-4 w-4 inline mr-2" />Hora: {selectedTime}</p>
                <p><User className="h-4 w-4 inline mr-2" />Servicio: {serviceName}</p>
                <p><span className="font-semibold">Total: ${servicePrice}</span></p>
              </div>
            </div>

            <Button 
              onClick={handleSubmitBooking}
              disabled={submitting || !clientInfo.name || !clientInfo.phone}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Creando reserva...' : 'Confirmar Reserva'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};